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
import type { WorkflowDef, WorkflowRunRecord } from './workflow.types.js';
import type { BatchSchema, WorkflowBatchRecord, WorkflowBatchItemRecord } from './workflow.batch.types.js';
interface BatchState {
    cancelled: boolean;
    /** Run ids currently in flight, so cancelBatch can tear them down. */
    runIds: Set<string>;
}
export declare const workflowBatchOrchestrator: {
    isRunning(batchId: string): boolean;
    /**
     * Validate + start a batch. Resolves once workers are dispatched (fire and
     * forget); throws synchronously on invalid input so the route can 400.
     */
    startBatch(batchId: string, aiCreds?: {
        key: string;
        deviceId: string;
    }): Promise<void>;
    /**
     * Internal: spin up one worker per profile over a shared queue, then finalize.
     * `state` is created + registered in `activeBatches` by the caller (startBatch /
     * retryItem / rehydrate) so isRunning() is true before dispatch.
     */
    runBatch(batch: WorkflowBatchRecord, def: WorkflowDef, schema: BatchSchema, aiCreds: {
        key: string;
        deviceId: string;
    } | undefined, state: BatchState): Promise<void>;
    /**
     * One profile runs `rowsPerProfile` (1-3) concurrent lanes over the shared
     * queue. claimNextItem is atomic, so lanes never claim the same row.
     */
    runProfileWorker(batch: WorkflowBatchRecord, def: WorkflowDef, schema: BatchSchema, profileId: string, state: BatchState, aiCreds?: {
        key: string;
        deviceId: string;
    }): Promise<void>;
    /** One lane pulls rows off the shared queue until it drains (or cancel). */
    runProfileLane(batch: WorkflowBatchRecord, def: WorkflowDef, schema: BatchSchema, profileId: string, state: BatchState, aiCreds?: {
        key: string;
        deviceId: string;
    }): Promise<void>;
    /** Run one row end-to-end: start run → poll → download outputs → persist. */
    processItem(batch: WorkflowBatchRecord, def: WorkflowDef, schema: BatchSchema, item: WorkflowBatchItemRecord, profileId: string, state: BatchState, aiCreds?: {
        key: string;
        deviceId: string;
    }): Promise<void>;
    /** Map row values onto node input overrides keyed by node id. */
    buildInputOverrides(schema: BatchSchema, item: WorkflowBatchItemRecord): Record<string, Record<string, unknown>>;
    /** Poll a run to a terminal state, honouring cancel + a safety deadline. */
    waitForRun(runId: string, state: BatchState): Promise<WorkflowRunRecord>;
    /** Download every result of each marked output node into the batch folder. */
    downloadOutputs(batch: WorkflowBatchRecord, _def: WorkflowDef, schema: BatchSchema, run: WorkflowRunRecord, item: WorkflowBatchItemRecord): Promise<string[]>;
    /** Compute + persist the batch's terminal status from item counts. */
    finalizeBatch(batchId: string, state: BatchState): Promise<void>;
    /** Signal cancel, tear down in-flight runs, and mark open items cancelled. */
    cancelBatch(batchId: string): Promise<void>;
    /**
     * Re-queue one failed/cancelled row. If the pool is still alive the reset item
     * is claimed by a lane (or the drain re-check loop); if the batch already
     * finished, a fresh pool is dispatched to process just this row.
     */
    retryItem(batchId: string, rowIndex: number, aiCreds?: {
        key: string;
        deviceId: string;
    }, newInputValues?: Record<string, string>): Promise<void>;
    /** Resume RUNNING batches after a restart (reset stuck items, re-dispatch). */
    rehydrate(): Promise<void>;
};
export {};
//# sourceMappingURL=workflow.batch.orchestrator.d.ts.map