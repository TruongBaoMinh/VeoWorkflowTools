/**
 * GenNormal Job Handler
 * Processes GenNormal jobs (image/video generation for Pro Editor)
 */
import { BaseJobHandler } from '../JobHandler.js';
import type { QueueJob } from '../SQLiteQueueManager.js';
import { JobType } from '../../jobs/JobTypes.js';
export declare class GenNormalJobHandler extends BaseJobHandler {
    getJobType(): JobType;
    execute(job: QueueJob): Promise<any>;
    private processImageGeneration;
    canRetry(job: QueueJob, error: Error): boolean;
    getRetryDelay(attempt: number): number;
}
//# sourceMappingURL=GenNormalJobHandler.d.ts.map