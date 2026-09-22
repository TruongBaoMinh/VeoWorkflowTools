/**
 * GenNormal Queue Manager
 * Simple queue for batch video generation
 */
declare class GenNormalQueueManager {
    private profileQueues;
    private profileProviders;
    private pollInterval;
    private watchdogInterval;
    private readonly STUCK_JOB_TIMEOUT_MS;
    private lastGlobalSubmitTime;
    private lastRecaptchaTimePerProfile;
    private projectConcurrency;
    private projectMaxActiveProfiles;
    private projectBatchSize;
    private projectDelaySeconds;
    private queueCreationTime;
    private profileProcessingActive;
    private lastSubmittedProfileId;
    private cancelledProjects;
    private currentBatchJobs;
    private profile403FailureCount;
    private profileHostTimeoutCount;
    private readonly HOST_TIMEOUT_RESET_THRESHOLD;
    private profile403Timestamps;
    private readonly SLIDING_WINDOW_MS;
    private readonly SLIDING_WINDOW_THRESHOLD;
    private readonly SLIDING_WINDOW_PENALTY_MS;
    private readonly POST_403_COOLDOWN_MS;
    private profileSlidingPenaltyUntil;
    private profileDelayLogLastAt;
    private readonly DELAY_LOG_THROTTLE_MS;
    private profileRecoveryCooldownUntil;
    private readonly PROFILE_RECOVERY_COOLDOWN_MS;
    private readonly DEFERRED_UA_ROTATION_GUARD_MS;
    private readonly BROWSER_RECOVERY_TIMEOUT_MS;
    private readonly BROWSER_RECOVERY_RETRY_COOLDOWN_MS;
    private circuitBreakerState;
    private profilesNeedingRelogin;
    private readonly CIRCUIT_BREAKER_DEGRADED_THRESHOLD;
    private readonly CIRCUIT_BREAKER_DEAD_THRESHOLD;
    private readonly CIRCUIT_BREAKER_DEGRADED_COOLDOWN_MS;
    private readonly CIRCUIT_BREAKER_DEAD_COOLDOWN_MS;
    private readonly CIRCUIT_BREAKER_THRESHOLD;
    private readonly CIRCUIT_BREAKER_COOLDOWN_MS;
    private readonly DEFAULT_CONCURRENT_PER_PROFILE;
    private readonly MAX_GLOBAL_RUNNING_JOBS;
    private readonly MAX_IMAGE_GEN_INFLIGHT_PER_PROFILE;
    private readonly IMAGE_PIPELINE_MAX_BATCHES;
    private readonly MAX_VIDEO_INFLIGHT_PER_PROFILE;
    private readonly MIN_RECAPTCHA_GAP_MS;
    private readonly MIN_RECAPTCHA_GAP_VIDEO_REF_MS;
    /**
     * Get per-profile reCAPTCHA gap based on job mode.
     * VIDEO với reference/start image dùng gap dài hơn vì API heavy hơn → dễ trigger
     * Google rate limit (429 PUBLIC_ERROR_HIGH_TRAFFIC).
     */
    private getMinGapMsForMode;
    /**
     * Get per-profile reCAPTCHA gap based on the full queued job.
     *
     * Fix A (Nguyên nhân 9): IMAGE_GENERATION có reference images cũng cần gap dài
     * vì browser session token score suy giảm nhanh khi gen nhiều batch liên tiếp
     * cùng action. Log cho thấy batch N+1 (sau batch N) bị fail Set #1/#3 với
     * PUBLIC_ERROR_UNUSUAL_ACTIVITY. Tăng gap → giãn thời gian giữa batches → cho
     * Google assessment reset score.
     */
    private getMinGapMsForJob;
    private readonly MIN_GLOBAL_SUBMIT_GAP_MS;
    private readonly MAX_GLOBAL_SUBMIT_GAP_MS;
    private readonly DEFAULT_BATCH_SIZE;
    private readonly BATCH_INTERVAL_MS;
    private lastBatchTimePerProfile;
    /**
     * Default per-profile inter-submit delay.
     *
     * 2-3s → 0s: captcha gen serialize đã tự throttle (~1-2s/captcha + 5-15s human-sim mỗi
     * lần warm). Thêm delay nhân tạo chỉ làm chậm pipeline 12-luồng.
     *
     * Rate-limit delay (429/403/500) vẫn được set riêng qua `setProfileRateLimitDelay`,
     * không bị ảnh hưởng.
     *
     * User vẫn có thể override per-project qua field `project.delaySeconds` (UI).
     */
    private getRandomDelay;
    private timelineLogsEnabled;
    private logTimeline;
    private getWaveCooldownConfig;
    private videoBackgroundWarmEnabled;
    private getOtherRunningJobs;
    private scheduleBrowserRecovery;
    private triggerPendingBrowserRecovery;
    private rotateUaProfileNow;
    private deferUaRotation;
    private maybeTriggerPendingUaRotation;
    private handleSubmitFired;
    private maybeTriggerWaveCooldownMaintenance;
    /**
     * Count active profiles for a project (profiles processing jobs)
     */
    private countActiveProfiles;
    /**
     * Count total active jobs for a project across ALL profiles
     */
    private countProjectActiveJobs;
    /**
     * Get batch size for a profile's project (default 4)
     */
    private getProjectBatchSize;
    /**
     * Get random global submit gap between 7-15 seconds
     * @returns Random gap in milliseconds
     */
    /**
     * Get or create queue for a profile
     */
    private getProfileQueue;
    /**
     * FLAT DELAY (user y\u00eau c\u1ea7u): lu\u00f4n 20-30s b\u1ea5t k\u1ec3 s\u1ed1 l\u1ea7n 403 li\u00ean ti\u1ebfp.
     * \u0110\u1ed5i t\u1eeb escalating ladder (30/60/300/900/3600s) sang flat v\u00ec:
     *  - User quan s\u00e1t: ch\u1edd 5-60 ph\u00fat kh\u00f4ng gi\u1ea3i quy\u1ebft \u0111\u01b0\u1ee3c 403, ch\u1ec9 l\u00e0m ch\u1eadm pipeline
     *  - Ngu\u1ed3n 403 th\u1ef1c: session/token score th\u1ea5p, reset browser + \u0111\u1ee3i ng\u1eafn l\u00e0 \u0111\u1ee7
     * Return gi\u00e1 tr\u1ecb SECONDS.
     */
    private getEscalatingDelay;
    /**
     * Delay in seconds between silent reCAPTCHA retries (failure count <= 3).
     *
     * Default 2s: post-submit Page.reload (reloadScheduler) and per-403 TLS
     * session recycle already flush both the Chrome page state AND the HTTP/2
     * connection — by the time the retry fires, the bot-scoring window has
     * effectively been "slid" by an entire fresh page. The legacy 5s/30s waits
     * were a substitute for not having those resets; with them in place, 2s is
     * plenty for the next mint to score high.
     *
     * Operators can override via `VEO3_RECAPTCHA_SILENT_RETRY_DELAY_SEC`
     * (set to `5` to restore the previous default, `30` for legacy, `0` for
     * immediate retry). Min clamp: 0, no max.
     */
    private getRecaptchaSilentRetryDelaySec;
    /**
     * Return the configured delay verbatim. The previous default added ±2s
     * jitter to mask the cadence, but that contradicted the user's UI value
     * ("set 5s → actual 3-7s"). Operators who want anti-bot jitter can opt
     * back in by exporting `VEO3_DELAY_JITTER_SEC=2` (or any positive number).
     */
    private jitterDelaySec;
    /**
     * On a sustained reCAPTCHA-403 streak (score dead, not a transient blip), ask the
     * captcha extension to clear the _GRECAPTCHA anchor cookie + reload the Flow tab —
     * the only thing that resets the reCAPTCHA Enterprise score in extension-bridge
     * mode — and drop the reused sessionId. Logs the connected extension version so a
     * stale (pre-1.5.0, no cookie-clear) extension is immediately obvious in the logs.
     */
    private triggerExtensionAnchorReset;
    /**
     * Increment 403 failure count for a profile
     * Also checks and triggers circuit breaker if threshold reached
     */
    private increment403FailureCount;
    /**
     * Best-effort: when a batch fails with PUBLIC_ERROR_MODEL_ACCESS_DENIED, the
     * paygateTier on the underlying GenNormalProject is likely stale (account
     * upgraded/downgraded since last sync). Drop the in-memory cache so the
     */
    private invalidatePaygateTierIfModelAccessDenied;
    /**
     * Hard ceiling for batch-requeue paths. Splits a batch into (retryable,
     * exhausted): jobs whose retryCount has hit maxRetries get marked FAILED
     * here so the caller can requeue only the survivors. Without this, certain
     * branches (browser race / "other retryable" / rate-limit) requeue without
     * incrementing or checking retryCount, producing unbounded loops every 1-3s
     * (see logs 09:33:34-09:33:48 with `Batch failed (retryable)` repeating).
     *
     * Returns the subset of jobs still eligible to retry. Caller should iterate
     * only over the returned array when re-pushing to the queue.
     */
    private enforceBatchRetryCeiling;
    /**
     * Reset 403 failure count for a profile (called on successful submission)
     * Also resets circuit breaker state
     */
    private reset403FailureCount;
    private shouldRunRecovery;
    /**
     * Clear needs-relogin flag for a profile (called when cookies are updated)
     */
    clearNeedsRelogin(profileId: string): void;
    /**
     * 🔴 CIRCUIT BREAKER (P0 #7): Trip with severity level (degraded | dead).
     * - degraded: 15 phút cooldown, profile skip trong lúc đó
     * - dead: 60 phút cooldown, profile cần user intervention
     */
    private tripCircuitBreaker;
    /**
     * 🔴 CIRCUIT BREAKER: Check if profile is disabled
     * Returns true if profile should skip processing
     */
    private isCircuitBreakerOpen;
    /**
     * Collect IMAGE_GENERATION jobs from PROFILE'S PENDING QUEUE for batch processing
     * Returns up to IMAGE_BATCH_SIZE (6) jobs from the same profile
     *
     * ✅ FIX: Collect from queuedJobs (profile's pending jobs) instead of globalSubmissionQueue
     * because other jobs may not be in globalSubmissionQueue yet (waiting for delay)
     */
    private collectImageBatchJobs;
    /**
     * Collect VIDEO jobs from PROFILE'S PENDING QUEUE for batch processing
     * Returns up to batchSize jobs of the SAME MODE from the same profile
     *
     * ✅ BATCH VIDEO: Only batches jobs with same mode (TEXT_TO_VIDEO, REFERENCE_TO_VIDEO, etc.)
     * Does NOT mix different video modes in same batch
     */
    private collectVideoBatchJobs;
    /**
     * Generate UUID v4 for sceneId (as per Veo3 API requirements)
     * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
     */
    private generateUUID;
    /**
     * Initialize queue for a project
     */
    initializeProject(projectId: string): Promise<void>;
    /**
     * Start processing loop
     */
    startProcessing(): void;
    /**
     * Sweep TẤT CẢ per-profile state khi profile bị xóa hoặc idle quá lâu.
     * Memory critical: nếu không gọi → các Map keyed theo profileId grow vô hạn.
     *
     * Gọi từ:
     *  - profile delete handler (user xóa profile)
     *  - watchdog định kỳ với profile không còn trong DB
     *  - profile re-login (clear circuit breaker state)
     */
    removeProfileState(profileId: string): void;
    /**
     * Clear all 403/captcha throttling state for a profile WITHOUT touching its
     * queue/jobs. Used by the "Reset & tiếp tục" button so a user stuck behind
     * repeated captcha 403s can resume immediately instead of waiting out the
     * escalating delay.
     */
    clearProfileThrottle(profileId: string): void;
    /**
     * Sweep TẤT CẢ per-project state khi project bị xóa.
     * `cleanupProjectQueue` chỉ filter jobs trong queue, không xóa các Map cấu hình.
     */
    removeProjectState(projectId: string): void;
    /**
     * Watchdog: phát hiện job stuck (Set runningJobs có entry nhưng DB đã done,
     * hoặc job PROCESSING quá lâu). Force-fail và dọn Set để queue unblock.
     */
    private runStuckJobWatchdog;
    /**
     * Stop processing
     */
    stopProcessing(): void;
    /**
     * Clear all jobs for a specific project from queues
     * This method is called when stopping/cancelling a project
     */
    clearProjectJobs(projectId: string): Promise<void>;
    /**
     * Process all profile queues
     * ✅ TRUE PARALLEL: Each profile processes independently without waiting for other profiles
     */
    private processQueues;
    /**
     * ✅ TRUE PARALLEL: Process a single profile's queue independently
     * This runs completely independently from other profiles
     * Multiple profiles can run this method simultaneously
     */
    private processProfileQueueIndependently;
    /**
     * Handle submission errors (extracted to support both awaited and detached execution)
     */
    private handleSubmissionError;
    /**
     * Terminal handler for daily-quota errors.
     * 1. Marks all triggering jobs FAILED (removes from runningJobs).
     * 2. Cancels all remaining QUEUED jobs for the profile in the project (DB + in-memory).
     * 3. Refreshes project stats.
     * Callers must clear their own currentBatchJobs entry BEFORE calling this.
     */
    private cancelProfileJobsOnDailyQuota;
    /**
     * Execute actual job submission (reCAPTCHA + API call)
     * ✅ TRUE PARALLEL: Per-profile reCAPTCHA gap allows true parallel processing
     * Different profiles can submit simultaneously, each with their own 15s reCAPTCHA gap
     */
    private executeJobSubmission;
    private submitJob;
    /**
     * Mark job as completed/failed and remove from running queue
     * Called by GenNormalStatusPoller when job status changes
     *
     * NOTE: lastSubmitTime is now updated when job is SUBMITTED (not when completed)
     * to ensure delay between submissions, not between completions.
     * This allows each profile to run independently like separate browsers.
     */
    markJobCompleted(jobId: string, profileId: string): void;
    /**
     * Set rate limit delay for a profile after error
     * @param profileId Profile ID to set delay for
     * @param delaySeconds Delay in seconds (default: 180s for rate limit, can be higher for reCAPTCHA)
     * @param errorType Type of error ('403' for reCAPTCHA, '429' for rate limit)
     */
    /**
     * 🪟 P1: Record a 403 in sliding window; return true if sliding penalty just tripped.
     * Also fires P5 notify so Electron main can adjust dynamic MAX_BATCHES threshold.
     */
    private recordSliding403;
    setProfileRateLimitDelay(profileId: string, delaySeconds?: number, errorType?: '403' | '429' | '500'): void;
    /**
     * Add a job back to queue (for retry purposes)
     * This is a public method to allow requeuing jobs from external modules
     */
    requeueJob(jobId: string, profileId: string, projectId: string, jobIndex: number, mode: string, addToFront?: boolean): Promise<void>;
    /**
     * Requeue a job for retry after rate limit error
     * This is called when a job fails due to rate limit during status polling
     * @param delaySeconds Retry delay in seconds (default: 60s for rate limit, can be 120s for reCAPTCHA)
     */
    requeueJobForRateLimitRetry(jobId: string, profileId: string, errorMessage: string, delaySeconds?: number, isSilent?: boolean): Promise<void>;
    /**
     * Update project statistics
     */
    private updateProjectStats;
    /**
     * Cancel all jobs in project (called by Stop button)
     */
    cancelProject(projectId: string): Promise<void>;
    /**
     * Pause project (stop submitting new jobs + mark running jobs as QUEUED)
     */
    pauseProject(projectId: string): Promise<void>;
    /**
     * Resume project
     */
    resumeProject(projectId: string): Promise<void>;
    /**
     * Get rate limit info for a project (aggregated from all profiles in the project)
     * This is used by pollJobs to return rate limit status to frontend
     */
    getProjectRateLimitInfo(projectId: string): {
        hasRateLimit: boolean;
        profiles: Array<{
            profileId: string;
            isRateLimited: boolean;
            rateLimitType?: '403' | '429' | '500';
            rateLimitUntil?: string;
            remainingSeconds?: number;
            queuedJobs: number;
            runningJobs: number;
        }>;
    };
    /**
     * Check if a project has been cancelled (user navigated away)
     */
    isProjectCancelled(projectId: string): boolean;
    /**
     * Clear cancelled status for a project (when user returns and reinitializes)
     */
    clearCancelledStatus(projectId: string): void;
    /**
     * Cleanup project queue when user navigates away
     * This clears in-memory queues AND marks project as cancelled to abort in-flight submissions
     * Jobs remain in QUEUED/PROCESSING state in DB so they can be resumed later
     */
    cleanupProjectQueue(projectId: string): Promise<{
        success: boolean;
        clearedQueuedCount: number;
        clearedRunningCount: number;
        clearedSubmissionCount: number;
    }>;
    /**
     * Restore queue state from database on server startup
     * This handles "Exit and Re-enter" persistence
     */
    restoreState(): Promise<void>;
}
export declare const genNormalQueueManager: GenNormalQueueManager;
export {};
//# sourceMappingURL=genNormalQueueManager.d.ts.map