/**
 * SQLite Queue Manager
 * Unified queue system replacing JobScheduler, JobQueueManager, and GenNormalQueueManager
 * All state persisted to SQLite for reliability
 */
import { EventEmitter } from 'events';
import type { JobHandler } from './JobHandler.js';
import { JobType } from '../jobs/JobTypes.js';
export interface QueueJob {
    id: string;
    type: JobType | string;
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
    priority: number;
    profileId?: string;
    data: any;
    attempts: number;
    maxAttempts: number;
    result?: any;
    error?: string;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}
export declare class SQLiteQueueManager extends EventEmitter {
    private isRunning;
    private pollInterval;
    private activeJobs;
    private handlers;
    private _lastStuckLog;
    private readonly POLL_INTERVAL_MS;
    readonly MAX_CONCURRENT_PER_PROFILE = 20;
    readonly MAX_CONCURRENT_GLOBAL: number;
    constructor();
    /**
     * Register a job handler for a specific job type
     */
    registerHandler(type: JobType, handler: JobHandler): void;
    /**
     * Get handler for a job type
     */
    getHandler(type: JobType): JobHandler | undefined;
    /**
     * Start the queue processor
     */
    start(): Promise<void>;
    /**
     * Stop the queue processor
     */
    stop(): Promise<void>;
    /**
     * Add job to queue
     */
    addJob(job: Omit<QueueJob, 'id' | 'status' | 'attempts' | 'createdAt' | 'result' | 'error'>): Promise<string>;
    /**
     * Main queue processing loop
     */
    private processQueue;
    /**
     * Try to mark job as processing (atomic)
     */
    private tryMarkProcessing;
    /**
     * Process a single job
     */
    private processJob;
    /**
     * Recover jobs that were interrupted (e.g., app crash)
     */
    private recoverInterruptedJobs;
    private dbJobToQueueJob;
}
export declare const queueManager: SQLiteQueueManager;
//# sourceMappingURL=SQLiteQueueManager.d.ts.map