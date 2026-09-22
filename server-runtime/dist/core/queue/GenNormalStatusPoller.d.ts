/**
 * GenNormal Status Poller
 * Background service to poll status of PROCESSING GenNormal jobs
 * Replaces GenNormalQueueManager.pollJobsStatus
 */
import { EventEmitter } from 'events';
/**
 * Fire-and-forget: if project has autoUpscale enabled, check whether ALL gen jobs
 * in the project are done. If yes → batch-create upscale jobs for ALL completed jobs.
 * If gen still running → skip (defer upscale until gen phase finishes).
 *
 * Rationale: upscale during gen causes burst of captcha + API calls → Google rate-limits
 * with TOO_MUCH_TRAFFIC. Gen-first, upscale-last avoids this entirely.
 */
export declare function triggerAutoUpscaleIfEnabled(jobId: string, projectId: string, jobMode: string): Promise<void>;
/**
 * Batch-create upscale jobs for ALL completed gen jobs in a project.
 * Called once when the last gen job finishes.
 */
export declare function triggerDeferredUpscales(projectId: string): Promise<void>;
export declare function maybeTriggerDeferredUpscales(projectId: string): Promise<void>;
export declare class GenNormalStatusPoller extends EventEmitter {
    private isRunning;
    private pollInterval;
    private readonly POLL_INTERVAL_MS;
    private readonly TIMEOUT_MS;
    private readonly GRACE_PERIOD_MS;
    private recentlyCompletedJobIds;
    private recentlyCompletedTimestamps;
    private isPolling;
    private urlRetryCounters;
    private readonly MAX_URL_RETRIES;
    /**
     * true = còn lượt retry → caller return luôn (giữ PROCESSING, tick sau thử lại).
     * false = đã hết lượt (counter tự xoá) → caller complete với URL_PENDING.
     */
    private shouldDeferUrlResolve;
    /**
     * Start polling status
     */
    start(): void;
    /**
     * Stop polling
     */
    stop(): void;
    /**
     * Poll status for all PROCESSING jobs
     * Groups video jobs by profile for batch polling, images are polled individually
     */
    private pollJobsStatus;
    /**
     * ✅ BATCH POLL: Poll video jobs in batches by profile
     * Groups up to 4 jobs per profile and uses batchCheckAsyncVideoGenerationStatus
     * Reduces API calls by 75% (4 status checks → 1 batch check)
     */
    private batchPollVideoJobs;
    private isTransientBrowserFetchPollError;
    /**
     * Build `{name, projectId, sceneId}` items for the media-shape status poll
     * (`batchCheckMediaGenerationStatus`). Jobs whose veo3ProjectId cannot be
     * resolved are returned in `missing` — they cannot be polled by the media
     * endpoint (which requires projectId per item).
     */
    private buildMediaPollItems;
    /**
     * A media-shape job with no resolvable veo3ProjectId can never be polled —
     * mark it FAILED so it stops looping the poller instead of hanging PROCESSING.
     */
    private failJobMissingProjectId;
    /**
     * Normalize one `batchCheckMediaGenerationStatus` operation (already converted
     * to the legacy `{operation:{metadata:{video}}}` shape) into the same result
     * object `pollVideoStatusNormalized` returns. `null` when no operation came back.
     */
    private normalizeMediaOperation;
    /**
     * Poll a batch of video jobs for a single profile. Veo 3.1 (useV2ModelConfig)
     * jobs use the media-shape endpoint; legacy jobs use the operations endpoint.
     */
    private pollVideoBatch;
    /**
     * Process status result for a single video job from batch poll
     */
    private processVideoStatusResult;
    /**
     * ✅ BATCH POLL: Poll status for upsampling jobs in batches by profile
     * Jobs that have parentJobId are upsampling jobs (clones created for upsampling)
     * Groups up to 4 jobs per profile and uses batchCheckAsyncVideoGenerationStatus
     */
    private pollUpsamplingJobs;
    /**
     * ✅ BATCH: Poll a batch of upsampling jobs for a single profile using batchCheckAsyncVideoGenerationStatus
     */
    private pollUpsamplingBatch;
    /**
     * ✅ BATCH: Process status result for a single upsampling job from batch poll
     */
    private processUpsamplingStatusResult;
    /**
     * Handle upsampling job failure (extracted for reuse)
     */
    private handleUpsamplingFailure;
    /**
     * Cleanup a permanently failed upsampling job
     */
    private cleanupFailedUpsampling;
    /**
     * Poll status for a single upsampling job from Veo3 API (fallback for batch failures)
     */
    private pollUpsamplingJobStatus;
    /**
     * Poll status for a single job
     */
    private pollJobStatus;
    /**
     * Update project statistics
     */
    private updateProjectStats;
}
export declare const genNormalStatusPoller: GenNormalStatusPoller;
//# sourceMappingURL=GenNormalStatusPoller.d.ts.map