/**
 * Veo Profile Manager
 * Centralized profile pool: load + slot acquire/release for queue handlers.
 */
export interface VeoProfile {
    id: string;
    name: string;
    accessToken?: string | null;
    cookies?: string | null;
    maxConcurrency: number;
    maxConcurrentVeo3Jobs: number;
    dailyQuota?: number | null;
    active: boolean;
    runningJobs: number;
    currentDailyUsage?: number;
    updatedAt: Date;
}
export interface LoadStats {
    totalProfiles: number;
    activeProfiles: number;
    totalRunningJobs: number;
    totalCapacity: number;
    utilizationPercent: number;
    availableSlots: number;
}
export declare class VeoProfileManager {
    private _lastAcquireLog;
    getProfile(profileId: string): Promise<VeoProfile | null>;
    getActiveProfiles(): Promise<VeoProfile[]>;
    /**
     * Reserve a slot for a queue job. Returns false to block pickup.
     *
     * Concurrency gates by job type:
     * - upsampling: dynamic sub-limit (1 batch when gen running, 12 idle)
     * - other (currently nothing else routes here in this build): profile.maxConcurrency
     *
     * Gen-normal jobs are managed by `genNormalQueueManager` at the project level
     * and do NOT go through this slot acquisition path.
     */
    acquireSlot(profileId: string, jobType?: string): Promise<boolean>;
    releaseSlot(profileId: string): Promise<void>;
    /**
     * Aggregate load stats. Called WITHOUT args from admin/stats endpoint
     * (covers all active profiles). The optional `profileIds` arg keeps the
     * signature future-proof for per-project queries.
     */
    getLoadStats(profileIds?: string[]): Promise<LoadStats>;
    private maybeLogBlocked;
    private getCurrentUsage;
}
export declare const veoProfileManager: VeoProfileManager;
//# sourceMappingURL=VeoProfileManager.d.ts.map