/**
 * Batch schema extraction.
 *
 * Reads `batchRole` / `batchKey` / `batchLabel` from node.data (set in the flow
 * editor) and returns the input columns + output sinks for a batch run. The
 * input TYPE (image | text) is DERIVED from node.type so it can never drift from
 * what the node actually consumes.
 */
import type { WorkflowDef } from './workflow.types.js';
import type { BatchSchema } from './workflow.batch.types.js';
export declare function extractBatchSchema(def: WorkflowDef): BatchSchema;
//# sourceMappingURL=workflow.batch.schema.d.ts.map