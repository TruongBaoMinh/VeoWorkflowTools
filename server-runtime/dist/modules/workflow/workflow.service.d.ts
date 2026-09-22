/**
 * Workflow Service
 * Use-case layer: loads profile from DB, coordinates repository + engine.
 */
import type { StartRunOptions, WorkflowRunRecord } from './workflow.types.js';
export declare const workflowService: {
    startRun(opts: StartRunOptions): Promise<WorkflowRunRecord>;
    cancelRun(runId: string): Promise<void>;
    rehydrateRunningRuns(): Promise<void>;
};
//# sourceMappingURL=workflow.service.d.ts.map