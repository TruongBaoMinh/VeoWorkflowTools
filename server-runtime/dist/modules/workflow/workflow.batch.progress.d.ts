/**
 * Batch Flow progress derivation — pure functions, no I/O.
 *
 * Imported by the poll route to enrich each item with per-node progress so the
 * UI can show "node X/Y + current node" without extra DB round-trips.
 */
import type { WorkflowNodeDef, NodeRunState } from './workflow.types.js';
export interface BatchItemProgress {
    completedNodes: number;
    totalNodes: number;
    currentNodeLabel: string | null;
    errorNodes: number;
}
/**
 * Derive progress counts from a run's nodeStates + the workflow node index.
 * Pure: no I/O, testable in isolation.
 *
 * `totalNodes` excludes 'skipped' nodes — the engine skips them when an upstream
 * node fails, so they were never going to run and must not count toward progress.
 */
export declare function deriveProgress(nodeStates: Record<string, NodeRunState>, nodeIndex: Map<string, WorkflowNodeDef>): BatchItemProgress;
//# sourceMappingURL=workflow.batch.progress.d.ts.map