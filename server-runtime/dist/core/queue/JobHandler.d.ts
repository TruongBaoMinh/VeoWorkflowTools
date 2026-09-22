/**
 * Job Handler Interface
 * Defines contract for processing different job types
 */
import type { QueueJob } from './SQLiteQueueManager.js';
import { JobType } from '../jobs/JobTypes.js';
export interface JobHandler {
    /**
     * Execute the job
     * @param job The job to execute
     * @returns Result data (will be stored in job.result)
     */
    execute(job: QueueJob): Promise<any>;
    /**
     * Check if job can be retried after error
     * @param job The job that failed
     * @param error The error that occurred
     * @returns true if job should be retried
     */
    canRetry(job: QueueJob, error: Error): boolean;
    /**
     * Get retry delay in milliseconds
     * @param attempt Current attempt number (0-based)
     * @returns Delay in milliseconds
     */
    getRetryDelay(attempt: number, error?: Error): number;
    /**
     * Check if error is a transient wait (e.g. BATCH_WAIT) that should not count as a failed attempt.
     * When true, the attempt counter is decremented so the job can be retried indefinitely.
     */
    isTransientWait?(error: Error): boolean;
    /**
     * Pre-check before a job is picked up from the queue.
     * Return false to skip this job (leave as queued) without incrementing attempts.
     * Used to implement profile-level concurrency control (e.g. max 4 upsampling jobs per profile).
     */
    canProcess?(job: {
        id: string;
        type: string;
        profileId: string | null;
        data: string;
    }): Promise<boolean>;
    /**
     * Get job type this handler supports
     */
    getJobType(): JobType;
}
/**
 * Base implementation with default retry logic
 */
export declare abstract class BaseJobHandler implements JobHandler {
    abstract execute(job: QueueJob): Promise<any>;
    abstract getJobType(): JobType;
    canRetry(job: QueueJob, error: Error): boolean;
    getRetryDelay(attempt: number, _error?: Error): number;
}
//# sourceMappingURL=JobHandler.d.ts.map