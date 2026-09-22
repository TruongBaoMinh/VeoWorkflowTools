/**
 * Batch Flow types — run one workflow template across N input rows.
 *
 * A batch holds N items (rows). Each item becomes an independent WorkflowRun
 * (its own veo3 project). `profileIds` drives a multi-profile worker pool that
 * pulls rows off a shared queue; concurrency = profiles × rowsPerProfile (1-3).
 */
export type BatchStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type BatchItemStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'ERROR' | 'CANCELLED';
/** Derived from node.type — never persisted on the node. */
export type BatchInputType = 'image' | 'text';
export interface BatchInputDef {
    nodeId: string;
    batchKey: string;
    batchLabel: string;
    batchInputType: BatchInputType;
}
export interface BatchOutputDef {
    nodeId: string;
    batchKey: string;
    batchLabel: string;
}
export interface BatchSchema {
    inputs: BatchInputDef[];
    outputs: BatchOutputDef[];
}
export interface WorkflowBatchItemRecord {
    id: string;
    batchId: string;
    rowIndex: number;
    profileId: string | null;
    /** Map of batchKey → value (prompt text or local image path). */
    inputValues: Record<string, string>;
    runId: string | null;
    status: BatchItemStatus;
    retryCount: number;
    outputPaths: string[];
    error: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface WorkflowBatchRecord {
    id: string;
    workflowId: string;
    name: string;
    status: BatchStatus;
    outputDir: string;
    profileIds: string[];
    autoDownload: boolean;
    rowsPerProfile: number;
    error: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface WorkflowBatchWithItems extends WorkflowBatchRecord {
    items: WorkflowBatchItemRecord[];
}
export interface CreateBatchItemInput {
    rowIndex: number;
    inputValues: Record<string, string>;
}
export interface CreateBatchInput {
    workflowId: string;
    name: string;
    profileIds: string[];
    outputDir: string;
    autoDownload?: boolean;
    rowsPerProfile?: number;
    items: CreateBatchItemInput[];
}
export type { BatchItemProgress } from './workflow.batch.progress.js';
//# sourceMappingURL=workflow.batch.types.d.ts.map