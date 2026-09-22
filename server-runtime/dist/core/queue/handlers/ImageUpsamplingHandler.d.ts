/**
 * Image Upsampling Handler
 * Processes image upsampling jobs (upsample to 2K/4K).
 * 🔒 SEQUENTIAL: 1 job at a time per profile via static `submissionLocks` Map
 * — tránh 403 captcha overlap khi extension mint cùng lúc cho 2 submit cùng profile.
 */
import { BaseJobHandler } from '../JobHandler.js';
import type { QueueJob } from '../SQLiteQueueManager.js';
import { JobType } from '../../jobs/JobTypes.js';
export declare class ImageUpsamplingHandler extends BaseJobHandler {
    private static inflightByProfile;
    private static effectiveLimit;
    private static refreshLimitForJob;
    getJobType(): JobType;
    /**
     * Pre-check at SQLite queue level: refuse to pull this job into execute()
     * when the profile is already at its configured per-profile parallel limit
     * or sitting in a 429 cool-down. Uses a cached limit (TTL 30s) so this
     * stays cheap; execute() will refresh the cache on first dispatch.
     */
    canProcess(job: {
        id: string;
        type: string;
        profileId: string | null;
        data: string;
    }): Promise<boolean>;
    execute(job: QueueJob): Promise<any>;
    private executeConcurrentUpsampling;
    private isRecaptchaError;
    /**
     * Override canRetry — reCAPTCHA errors should retry with longer delay
     */
    canRetry(job: QueueJob, error: Error): boolean;
    /**
     * Captcha extension endpoint unreachable (Chrome/extension not running) —
     * don't count as real attempt; retry when extension comes back.
     */
    isTransientWait(error: Error): boolean;
    /**
     * Retry delay based on error type:
     * - 503 (service unavailable): 5s → 10s → 15s (transient, retry fast)
     * - reCAPTCHA / other: 30s → 60s → 120s (exponential backoff)
     */
    getRetryDelay(attempt: number, error?: Error): number;
}
//# sourceMappingURL=ImageUpsamplingHandler.d.ts.map