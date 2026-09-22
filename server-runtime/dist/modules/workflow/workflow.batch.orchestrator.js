/**
 * Batch orchestrator (singleton, server-side).
 *
 * Runs one workflow template across N rows. Each selected profile becomes a
 * worker running up to rowsPerProfile (1-3) concurrent lanes, each pulling rows
 * off a SHARED queue (atomic DB claim). A row = one WorkflowRun (its own veo3
 * project). When a run
 * completes, the marked output node's media is downloaded into the batch's
 * output folder. The whole run is NEVER retried here — per-node auto-retry lives
 * in the engine; the orchestrator only schedules, polls and downloads.
 */
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { logger } from '../../lib/logger.js';
import { downloadFile, resolveUniquePath } from '../../utils/fileDownloader.js';
import { workflowRepository } from './workflow.repository.js';
import { workflowService } from './workflow.service.js';
import { workflowBatchRepository } from './workflow.batch.repository.js';
import { extractBatchSchema } from './workflow.batch.schema.js';
const POLL_INTERVAL_MS = 5000;
const RUN_DEADLINE_MS = 40 * 60 * 1000; // safety cap per row
const CANCEL_GRACE_MS = 5 * 60 * 1000; // max wait after a cancel before abandoning
const TERMINAL_RUN = ['COMPLETED', 'FAILED', 'CANCELLED'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// ── Filename + media helpers ─────────────────────────────────────────────────
function padRow(rowIndex) {
    return String(rowIndex + 1).padStart(3, '0');
}
/** Derive a file extension from a media url, falling back by kind. */
function extFromUrl(url, kind) {
    const clean = url.split('?')[0]?.split('#')[0] ?? '';
    const m = clean.match(/\.([a-z0-9]{2,4})$/i);
    if (m)
        return `.${m[1].toLowerCase()}`;
    return kind === 'image' ? '.png' : '.mp4';
}
function safeKey(key) {
    return key.replace(/[^\w-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'out';
}
// ── Orchestrator ─────────────────────────────────────────────────────────────
const activeBatches = new Map();
export const workflowBatchOrchestrator = {
    isRunning(batchId) {
        return activeBatches.has(batchId);
    },
    /**
     * Validate + start a batch. Resolves once workers are dispatched (fire and
     * forget); throws synchronously on invalid input so the route can 400.
     */
    async startBatch(batchId, aiCreds) {
        if (activeBatches.has(batchId)) {
            throw new Error('Batch đang chạy rồi');
        }
        const batch = await workflowBatchRepository.getBatch(batchId);
        if (!batch)
            throw new Error(`Batch not found: ${batchId}`);
        if (batch.status !== 'PENDING') {
            throw new Error(`Batch không ở trạng thái PENDING (hiện tại: ${batch.status})`);
        }
        const def = await workflowRepository.getWorkflow(batch.workflowId);
        if (!def)
            throw new Error(`Workflow not found: ${batch.workflowId}`);
        const schema = extractBatchSchema(def);
        if (schema.inputs.length === 0) {
            throw new Error('Workflow chưa đánh dấu node input nào (Prompt / Upload ảnh)');
        }
        if (schema.outputs.length === 0) {
            throw new Error('Workflow chưa đánh dấu node output nào (Video / Merge / Result)');
        }
        if (batch.profileIds.length === 0) {
            throw new Error('Chưa chọn profile nào để chạy');
        }
        const { missing } = await workflowBatchRepository.validateProfileIds(batch.profileIds);
        if (missing.length > 0) {
            throw new Error(`Không tìm thấy ${missing.length} profile đã chọn. Hãy cập nhật lại batch trước khi chạy.`);
        }
        // Reserve the batch (state owns the cancel flag + in-flight run ids) BEFORE
        // going RUNNING so isRunning() is true the instant the pool is dispatched.
        const state = { cancelled: false, runIds: new Set() };
        activeBatches.set(batchId, state);
        await workflowBatchRepository.updateBatchStatus(batchId, 'RUNNING', null);
        // Fire-and-forget the worker pool; the route returns immediately.
        void this.runBatch(batch, def, schema, aiCreds, state).catch((err) => {
            logger.error(`[BatchOrchestrator] batch ${batchId} crashed:`, err);
        });
    },
    /**
     * Internal: spin up one worker per profile over a shared queue, then finalize.
     * `state` is created + registered in `activeBatches` by the caller (startBatch /
     * retryItem / rehydrate) so isRunning() is true before dispatch.
     */
    async runBatch(batch, def, schema, aiCreds, state) {
        logger.info(`[BatchOrchestrator] batch ${batch.id} start — ${batch.profileIds.length} profile(s), ` +
            `${Math.max(1, Math.min(3, batch.rowsPerProfile ?? 1))} lane(s)/profile`);
        try {
            // Drain the shared queue, then re-check for new PENDING items and dispatch
            // again if any appeared — a row reset by retryItem while the pool was still
            // alive (its lanes already drained) would otherwise never run and finalize
            // would miscount. Normal runs execute the body once (pending → 0) and exit.
            let guard = 0;
            do {
                await Promise.all(batch.profileIds.map((profileId) => this.runProfileWorker(batch, def, schema, profileId, state, aiCreds)));
                if (++guard > 50) {
                    logger.warn(`[BatchOrchestrator] batch ${batch.id} drain loop cap reached`);
                    break;
                }
            } while (!state.cancelled &&
                (await workflowBatchRepository.countItemsByStatus(batch.id)).pending > 0);
        }
        finally {
            // A throw here must NOT skip the activeBatches cleanup, or the batch becomes
            // a zombie (isRunning forever, /start permanently rejected). Force FAILED if
            // finalize itself fails, then always deregister.
            try {
                await this.finalizeBatch(batch.id, state);
            }
            catch (err) {
                logger.error(`[BatchOrchestrator] finalize ${batch.id} failed — forcing FAILED:`, err);
                await workflowBatchRepository
                    .updateBatchStatus(batch.id, 'FAILED', 'Lỗi nội bộ khi tổng kết batch')
                    .catch(() => { });
            }
            finally {
                activeBatches.delete(batch.id);
            }
        }
    },
    /**
     * One profile runs `rowsPerProfile` (1-3) concurrent lanes over the shared
     * queue. claimNextItem is atomic, so lanes never claim the same row.
     */
    async runProfileWorker(batch, def, schema, profileId, state, aiCreds) {
        const lanes = Math.max(1, Math.min(3, batch.rowsPerProfile ?? 1));
        await Promise.all(Array.from({ length: lanes }, () => this.runProfileLane(batch, def, schema, profileId, state, aiCreds)));
    },
    /** One lane pulls rows off the shared queue until it drains (or cancel). */
    async runProfileLane(batch, def, schema, profileId, state, aiCreds) {
        while (!state.cancelled) {
            // Isolate claimNextItem: a transient DB error must exit only THIS lane
            // (return, not throw), or it would reject Promise.all(lanes) and orphan
            // the sibling lanes + other profile workers after finalizeBatch.
            let item = null;
            try {
                item = await workflowBatchRepository.claimNextItem(batch.id, profileId);
            }
            catch (claimErr) {
                const msg = claimErr instanceof Error ? claimErr.message : String(claimErr);
                logger.error(`[BatchOrchestrator] claimNextItem lỗi (profile ${profileId}): ${msg}`);
                return;
            }
            if (!item)
                return; // queue drained for this lane
            try {
                await this.processItem(batch, def, schema, item, profileId, state, aiCreds);
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                logger.error(`[BatchOrchestrator] row ${item.rowIndex} (${item.id}) failed:`, err);
                await workflowBatchRepository.failItem(item.id, 'ERROR', msg).catch((dbErr) => {
                    logger.error(`[BatchOrchestrator] failItem ${item.id} không ghi được — item kẹt RUNNING:`, dbErr);
                });
            }
        }
    },
    /** Run one row end-to-end: start run → poll → download outputs → persist. */
    async processItem(batch, def, schema, item, profileId, state, aiCreds) {
        if (state.cancelled) {
            await workflowBatchRepository.failItem(item.id, 'CANCELLED', 'Batch đã huỷ');
            return;
        }
        const inputOverrides = this.buildInputOverrides(schema, item);
        const run = await workflowService.startRun({
            workflowId: batch.workflowId,
            profileId,
            inputOverrides,
            aiCreds,
        });
        state.runIds.add(run.id);
        await workflowBatchRepository.setItemRun(item.id, run.id);
        try {
            const finished = await this.waitForRun(run.id, state);
            const retryCount = sumRetries(finished);
            if (finished.status === 'CANCELLED') {
                await workflowBatchRepository.failItem(item.id, 'CANCELLED', 'Run bị huỷ', retryCount);
                return;
            }
            if (finished.status === 'FAILED') {
                await workflowBatchRepository.failItem(item.id, 'ERROR', finished.error ?? 'Run thất bại', retryCount);
                return;
            }
            // COMPLETED → download marked output media.
            const outputPaths = batch.autoDownload
                ? await this.downloadOutputs(batch, def, schema, finished, item)
                : [];
            await workflowBatchRepository.completeItem(item.id, outputPaths, retryCount);
        }
        finally {
            state.runIds.delete(run.id);
        }
    },
    /** Map row values onto node input overrides keyed by node id. */
    buildInputOverrides(schema, item) {
        const overrides = {};
        for (const input of schema.inputs) {
            const value = item.inputValues[input.batchKey];
            if (value === undefined || value === '')
                continue; // keep the template default
            overrides[input.nodeId] =
                input.batchInputType === 'text' ? { prompt: value } : { localPath: value };
        }
        return overrides;
    },
    /** Poll a run to a terminal state, honouring cancel + a safety deadline. */
    async waitForRun(runId, state) {
        const deadline = Date.now() + RUN_DEADLINE_MS;
        let cancelGrace = 0; // set when a cancel is requested; hard bail-out after this
        for (;;) {
            if ((state.cancelled || Date.now() > deadline) && cancelGrace === 0) {
                cancelGrace = Date.now() + CANCEL_GRACE_MS;
                await workflowService.cancelRun(runId).catch(() => { });
            }
            // If the engine never honours the cancel (e.g. a wedged dispatch), don't
            // hang this worker forever — abandon the row so the pool can drain.
            if (cancelGrace > 0 && Date.now() > cancelGrace) {
                throw new Error(`Run ${runId} không kết thúc sau khi huỷ — bỏ qua dòng này`);
            }
            const run = await workflowRepository.getRun(runId);
            if (!run)
                throw new Error(`Run disappeared: ${runId}`);
            if (TERMINAL_RUN.includes(run.status))
                return run;
            await sleep(POLL_INTERVAL_MS);
        }
    },
    /** Download every result of each marked output node into the batch folder. */
    async downloadOutputs(batch, _def, schema, run, item) {
        const saved = [];
        // The output folder may have been deleted between the first run and a regen.
        await mkdir(batch.outputDir, { recursive: true }).catch(() => { });
        for (const output of schema.outputs) {
            const results = run.nodeStates[output.nodeId]?.results ?? [];
            let i = 0;
            for (const result of results) {
                if (!result.url)
                    continue;
                const ext = extFromUrl(result.url, result.kind);
                const filename = `row_${padRow(item.rowIndex)}_${safeKey(output.batchKey)}_${i}${ext}`;
                // Uniquify against the filesystem so a regen of the same row appends an
                // index (`_1`, `_2`) instead of overwriting the previous file.
                const outPath = resolveUniquePath(path.join(batch.outputDir, filename));
                try {
                    await downloadFile(result.url, outPath);
                    saved.push(outPath);
                    i += 1;
                }
                catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    logger.error(`[BatchOrchestrator] row ${item.rowIndex} download failed (${output.batchKey}): ${msg}`);
                }
            }
        }
        return saved;
    },
    /** Compute + persist the batch's terminal status from item counts. */
    async finalizeBatch(batchId, state) {
        const counts = await workflowBatchRepository.countItemsByStatus(batchId);
        let status;
        if (state.cancelled)
            status = 'CANCELLED';
        else if (counts.total > 0 && counts.error + counts.cancelled === counts.total)
            status = 'FAILED';
        else
            status = 'COMPLETED';
        await workflowBatchRepository.updateBatchStatus(batchId, status, null);
        logger.info(`[BatchOrchestrator] batch ${batchId} ${status} — done ${counts.done}/${counts.total}, error ${counts.error}`);
    },
    /** Signal cancel, tear down in-flight runs, and mark open items cancelled. */
    async cancelBatch(batchId) {
        const state = activeBatches.get(batchId);
        if (state) {
            state.cancelled = true;
            for (const runId of state.runIds) {
                await workflowService.cancelRun(runId).catch(() => { });
            }
        }
        await workflowBatchRepository.cancelOpenItems(batchId);
        if (!state) {
            // Not actively running in this process — just mark it cancelled.
            await workflowBatchRepository.updateBatchStatus(batchId, 'CANCELLED', null);
        }
    },
    /**
     * Re-queue one failed/cancelled row. If the pool is still alive the reset item
     * is claimed by a lane (or the drain re-check loop); if the batch already
     * finished, a fresh pool is dispatched to process just this row.
     */
    async retryItem(batchId, rowIndex, aiCreds, newInputValues) {
        const batch = await workflowBatchRepository.getBatchWithItems(batchId);
        if (!batch)
            throw new Error(`Batch not found: ${batchId}`);
        const item = batch.items.find((it) => it.rowIndex === rowIndex);
        if (!item)
            throw new Error(`Không tìm thấy dòng ${rowIndex + 1} trong batch`);
        if (item.status !== 'ERROR' && item.status !== 'CANCELLED') {
            throw new Error(`Dòng ${rowIndex + 1} không ở trạng thái lỗi (${item.status})`);
        }
        const reset = await workflowBatchRepository.resetItemForRetry(item.id, newInputValues);
        if (!reset) {
            throw new Error(`Dòng ${rowIndex + 1} vừa được gen lại bởi một yêu cầu khác`);
        }
        // A live pool's lanes (or its drain re-check loop) will claim the PENDING item.
        if (this.isRunning(batchId))
            return;
        // Pool already finished → dispatch a fresh one for the single reset row.
        // Reserve state synchronously (no await between isRunning check and set) so a
        // second concurrent retry sees isRunning=true and doesn't double-dispatch.
        const state = { cancelled: false, runIds: new Set() };
        activeBatches.set(batchId, state);
        try {
            const def = await workflowRepository.getWorkflow(batch.workflowId);
            if (!def)
                throw new Error('Workflow đã bị xoá');
            const schema = extractBatchSchema(def);
            await workflowBatchRepository.updateBatchStatus(batchId, 'RUNNING', null);
            void this.runBatch(batch, def, schema, aiCreds, state).catch((err) => {
                logger.error(`[BatchOrchestrator] retry batch ${batchId} crashed:`, err);
            });
        }
        catch (err) {
            activeBatches.delete(batchId); // dispatch failed — release the reservation
            throw err;
        }
    },
    /** Resume RUNNING batches after a restart (reset stuck items, re-dispatch). */
    async rehydrate() {
        const running = await workflowBatchRepository.findBatchesByStatus(['RUNNING']);
        if (running.length === 0)
            return;
        logger.info(`[BatchOrchestrator] resuming ${running.length} interrupted batch(es)`);
        for (const batch of running) {
            try {
                // No profiles → no workers → items would stay PENDING forever. Fail fast.
                if (batch.profileIds.length === 0) {
                    await workflowBatchRepository.cancelOpenItems(batch.id);
                    await workflowBatchRepository.updateBatchStatus(batch.id, 'FAILED', 'Không có profile');
                    continue;
                }
                // A profile deleted while the app was down would crash its lane on resume.
                const { missing } = await workflowBatchRepository.validateProfileIds(batch.profileIds);
                if (missing.length > 0) {
                    await workflowBatchRepository.cancelOpenItems(batch.id);
                    await workflowBatchRepository.updateBatchStatus(batch.id, 'FAILED', `${missing.length} profile đã bị xoá — batch không thể tiếp tục`);
                    continue;
                }
                await workflowBatchRepository.resetRunningItems(batch.id);
                const def = await workflowRepository.getWorkflow(batch.workflowId);
                if (!def) {
                    await workflowBatchRepository.cancelOpenItems(batch.id);
                    await workflowBatchRepository.updateBatchStatus(batch.id, 'FAILED', 'Workflow đã bị xoá');
                    continue;
                }
                const schema = extractBatchSchema(def);
                const state = { cancelled: false, runIds: new Set() };
                activeBatches.set(batch.id, state);
                void this.runBatch(batch, def, schema, undefined, state).catch((err) => {
                    logger.error(`[BatchOrchestrator] resumed batch ${batch.id} crashed:`, err);
                });
            }
            catch (err) {
                logger.error(`[BatchOrchestrator] failed to resume batch ${batch.id}:`, err);
            }
        }
    },
};
/** Sum per-node auto-retries across a finished run for the row's retry badge. */
function sumRetries(run) {
    return Object.values(run.nodeStates).reduce((sum, st) => sum + (st.retryCount ?? 0), 0);
}
//# sourceMappingURL=workflow.batch.orchestrator.js.map