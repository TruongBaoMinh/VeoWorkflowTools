import type { WorkflowDef, WorkflowRunRecord, RunStatus, NodeRunState, StartRunOptions } from './workflow.types.js';
export declare const workflowRepository: {
    createWorkflow(def: Omit<WorkflowDef, "id">): Promise<WorkflowDef>;
    getWorkflow(id: string): Promise<WorkflowDef | null>;
    listWorkflows(): Promise<WorkflowDef[]>;
    updateWorkflow(id: string, patch: Partial<Omit<WorkflowDef, "id">>): Promise<WorkflowDef>;
    deleteWorkflow(id: string): Promise<void>;
    createRun(opts: StartRunOptions, seededNodeStates?: Record<string, NodeRunState>): Promise<WorkflowRunRecord>;
    getRun(runId: string): Promise<WorkflowRunRecord | null>;
    /** List runs, optionally filtered by workflowId. */
    listRuns(workflowId?: string): Promise<WorkflowRunRecord[]>;
    /** Alias used by routes — delegates to listRuns with a required workflowId. */
    listRunsByWorkflow(workflowId: string): Promise<WorkflowRunRecord[]>;
    updateRunStatus(runId: string, status: RunStatus, error?: string): Promise<void>;
    persistNodeStates(runId: string, nodeStates: Record<string, NodeRunState>): Promise<void>;
    findRunsByStatus(statuses: RunStatus[]): Promise<WorkflowRunRecord[]>;
    /** Batch-fetch nodeStates for a set of run IDs (poll enrichment, avoids N+1). */
    findRunsByIds(runIds: string[]): Promise<Map<string, Record<string, NodeRunState>>>;
};
//# sourceMappingURL=workflow.repository.d.ts.map