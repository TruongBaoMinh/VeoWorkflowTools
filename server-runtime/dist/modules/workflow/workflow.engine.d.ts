/**
 * WorkflowEngine — in-process DAG runner.
 *
 * Architecture:
 *  - One WorkflowEngine instance per active run, held in ACTIVE_ENGINES map.
 *  - Promise memoisation: each node's promise is created once and awaited by all
 *    downstream dependants — topological ordering falls out naturally.
 *  - Semaphore (NODE_CONCURRENCY=4) limits concurrent dispatches per run.
 *  - Every state transition persists nodeStates to DB and emits 'engine:event'.
 *  - Pause: engine.pauseSignal() sets a flag; checkPauseOrCancel() yields until
 *    resume(). Cancel: unblocks all waiters and throws from checkPauseOrCancel.
 *  - On restart: RUNNING/PENDING/PAUSED runs are reset to FAILED.
 *
 * Node-type contract — node.type is canonical:
 *   prompt | gemini-script | upload-image | generate-image | generate-video |
 *   upscale-image | upscale-video | merge-video | extract-endframe | result
 *
 * Sub-modes live in node.data:
 *   generate-image → data.imageMode: 'text' | 'reference'
 *   generate-video → data.videoMode: 'text-to-video' | 'image-to-video' |
 *                                    'reference-to-video' | 'frame-to-frame'
 */
import { EventEmitter } from 'node:events';
import type { WorkflowDef, WorkflowRunRecord, NodeRunState } from './workflow.types.js';
/**
 * Build a human-readable run-level error from the failed nodes' states — never
 * raw node IDs (meaningless to users). Uses each node's friendly `error` and
 * embeds the first `reason` code in brackets so it stays greppable.
 */
export declare function summarizeFailedNodes(nodeStates: Record<string, NodeRunState>): string;
export declare const ACTIVE_ENGINES: Map<string, WorkflowEngine>;
export declare class WorkflowEngine extends EventEmitter {
    private readonly runId;
    private cancelled;
    private paused;
    private readonly pauseWaiters;
    private profileId;
    private veo3ProjectId;
    private userPaygateTierPromise;
    private aiCreds;
    private constructor();
    static getInstance(runId: string): WorkflowEngine;
    static releaseInstance(runId: string): void;
    static hasInstance(runId: string): boolean;
    /** Pause execution at the next poll iteration or node boundary. */
    pauseSignal(): void;
    /** Resume a paused run; unblocks all checkPauseOrCancel waiters. */
    resumeSignal(): void;
    /** Cancel the run; terminates at the next checkpoint. */
    cancel(): void;
    startRun(run: WorkflowRunRecord, def: WorkflowDef, profile: {
        id: string;
        accessToken: string | null;
    }, veo3ProjectId?: string | null, aiCreds?: {
        key: string;
        deviceId: string;
    } | null): Promise<void>;
    private walkDag;
    private checkPauseOrCancel;
    /**
     * Call the credit-metered remote /openrouter/generate proxy (task `flow.script`)
     * and return EXACTLY `outputCount` prompts. Charges 5 credits server-side on
     * success (free quota first); refunds on AI failure. Retries once on a 409
     * nonce replay (pre-charge), never on a 402 (insufficient credit).
     */
    private callGeminiScript;
    /**
     * Dispatch a single node to the appropriate veo3Service call(s).
     *
     * node.type drives the outer switch; for 'generate-image' and 'generate-video'
     * the sub-mode is read from merged data.imageMode / data.videoMode.
     *
     * Returns { results, textValue? }:
     *   - results  → stored in NodeRunState.results (empty for prompt nodes)
     *   - textValue → stored in NodeRunState.textValue (prompt nodes only)
     */
    private dispatchNode;
    /**
     * Resolve (and cache) the account's real paygate tier. Image upscale must send
     * the account's actual tier — an Ultra account upscaled as PAYGATE_TIER_ONE
     * gets a watermarked/blurred free-tier image. Falls back to PAYGATE_TIER_ONE
     * if credits can't be fetched.
     */
    private resolveUserPaygateTier;
    private buildClientContext;
    /**
     * Resolve the flat UUID of a generated video for upsampling. Mirrors
     * genNormal's VideoUpsamplingHandler.resolveSourceVideoUuid: the Veo upsample
     * API needs the bare UUID (parsed from the CDN url `…/video/<uuid>?…`), not the
     * encoded CAUS…/CAM… media id (which encodes the project and 404s).
     */
    private resolveVideoUuid;
    /**
     * Poll a set of video generation operations until all reach a terminal status.
     * Works for batchAsyncGenerateVideo*, batchAsyncGenerateVideoUpsampleVideo.
     * Checks pause/cancel at every iteration.
     */
    private pollMultipleVideos;
    /** Poll a single async operation (used for async upscale-image path). */
    private pollSingleOperation;
    /**
     * Mirror credential loading from GenNormalJobHandler lines 84–119.
     * Builds one Veo3Service per run, configured for the given profile.
     */
    private buildProvider;
}
export declare const workflowEngine: {
    /**
     * Start a run asynchronously (fire-and-forget).
     * Route handlers return { runId } immediately; clients subscribe via SSE.
     */
    startRun(run: WorkflowRunRecord, def: WorkflowDef, profile: {
        id: string;
        accessToken: string | null;
    }, veo3ProjectId?: string | null, aiCreds?: {
        key: string;
        deviceId: string;
    } | null): void;
    cancelRun(runId: string): void;
    pauseRun(runId: string): Promise<void>;
    resumeRun(runId: string): Promise<void>;
    /**
     * Called once at server boot.
     * Resets any runs that were interrupted by a prior crash so the UI shows FAILED.
     * Running nodes are reset to pending so a manual restart attempt is consistent.
     */
    rehydrateRunningRuns(): Promise<void>;
};
//# sourceMappingURL=workflow.engine.d.ts.map