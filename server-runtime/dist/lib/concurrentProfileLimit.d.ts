/**
 * Device-level concurrent-profile semaphore (Phase C3).
 *
 * Limits how many DISTINCT profile IDs can be in the captcha-execute →
 * submit-XHR phase at the same time. Above ~3-4 concurrent profiles on one
 * public IP, Google's abuse detection treats the traffic as a click farm
 * even when each profile individually has a good session score.
 *
 * Cross-profile gate (orthogonal to per-profile mint serialisation handled
 * inside captchaManager).
 *
 * Re-entry rule: if the same profileId already holds a slot, the call returns
 * immediately without consuming an extra slot, so jobs for the same profile
 * never starve themselves.
 *
 * Configure via env: CONCURRENT_PROFILE_LIMIT (default 3).
 */
declare class ConcurrentProfileLimit {
    private readonly active;
    private readonly pending;
    private readonly queue;
    /**
     * Acquire a device-level slot for `profileId`.
     * Returns an idempotent release function that MUST be called when the
     * captcha+submit section ends.
     */
    acquire(profileId: string): Promise<() => void>;
    private makeRelease;
    private releaseSlot;
    getActiveCount(): number;
    /** Diagnostic: number of profiles currently waiting for a slot. */
    getQueueDepth(): number;
}
export declare const concurrentProfileLimit: ConcurrentProfileLimit;
export {};
//# sourceMappingURL=concurrentProfileLimit.d.ts.map