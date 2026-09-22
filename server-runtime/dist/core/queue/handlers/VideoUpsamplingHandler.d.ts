/**
 * Video Upsampling Handler
 * Processes video upsampling jobs (upsample to 1080p)
 * ✅ BATCH SUPPORT: Collects up to 3 upsampling jobs from same profile and sends in single batch request
 */
import { BaseJobHandler } from '../JobHandler.js';
import type { QueueJob } from '../SQLiteQueueManager.js';
import { JobType } from '../../jobs/JobTypes.js';
export declare class VideoUpsamplingHandler extends BaseJobHandler {
    private static submissionLocks;
    private static processingProfiles;
    private static acquireProfileLock;
    getJobType(): JobType;
    /**
     * Pre-check: only allow processing if profile has room for more upsampling jobs.
     * This prevents 500 jobs from all entering execute() and throwing BATCH_WAIT.
     * Jobs that fail this check stay queued and are retried on the next poll cycle.
     */
    canProcess(job: {
        id: string;
        type: string;
        profileId: string | null;
        data: string;
    }): Promise<boolean>;
    execute(job: QueueJob): Promise<any>;
    private executeUpsampling;
    /**
     * ✅ BATCH: Collect upsampling jobs from same profile for batch processing
     * Similar to collectVideoBatchJobs in genNormalQueueManager
     */
    private collectBatchUpsamplingJobs;
    /**
     * Get parent job and resolve mediaId (handle operation name → mediaId conversion)
     */
    private getParentJobWithMediaId;
    /**
     * Resolve UUID PHẲNG của video nguồn để dùng cho `videoInput.mediaId` khi upsample.
     *
     * Veo 3.1 upsample CHỈ chấp nhận UUID phẳng (verified từ request web:
     * `videoInput.mediaId = "70fbb201-81f8-4e07-b019-a16e82def46c"`). Gửi id mã hoá
     * `CAUS…` (encode PROJECT id) sẽ bị 404 NOT_FOUND.
     *
     * Thứ tự ưu tiên:
     *   1. resultUrl: `https://flow-content.google/video/<uuid>?…` — nguồn chuẩn, luôn UUID phẳng
     *   2. providerJobId là UUID phẳng (operation name của t2v) → dùng luôn
     *   3. providerJobId dạng `CAM…` → decode field 3 về UUID
     *   4. `CAUS…` / không decode được → null (không đủ dữ liệu, không submit id rác)
     */
    private resolveSourceVideoUuid;
    /**
     * ✅ BATCH: Execute batch upsampling for multiple jobs
     */
    private executeBatchUpsampling;
    /**
     * Override canRetry to handle BATCH_WAIT errors
     * BATCH_WAIT errors should always retry (waiting for current batch to complete)
     */
    canRetry(job: QueueJob, error: Error): boolean;
    /**
     * Transient waits that should NOT count as a failed attempt:
     * - BATCH_WAIT: handler intentionally postponed (collecting more jobs)
     * - ECONNREFUSED / fetch failed: captcha extension endpoint unreachable
     *   (Chrome/extension not running) — retry when it comes back
     */
    isTransientWait(error: Error): boolean;
    private isRecaptchaError;
    /**
     * Override getRetryDelay with exponential backoff for reCAPTCHA errors
     * reCAPTCHA: 30s → 60s → 120s (gives Google time to reset)
     * Other errors: 30s flat
     */
    getRetryDelay(attempt: number, error?: Error): number;
    private generateUUID;
}
//# sourceMappingURL=VideoUpsamplingHandler.d.ts.map