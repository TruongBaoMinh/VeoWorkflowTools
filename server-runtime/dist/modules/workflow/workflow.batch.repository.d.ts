/**
 * Batch repository — CRUD for WorkflowBatch + WorkflowBatchItem.
 *
 * JSON columns (profileIds, inputValues, outputPaths) are stored as strings and
 * parsed on read, mirroring workflow.repository's nodeStates handling.
 */
import type { BatchStatus, BatchItemStatus, CreateBatchInput, WorkflowBatchRecord, WorkflowBatchItemRecord, WorkflowBatchWithItems } from './workflow.batch.types.js';
export declare const workflowBatchRepository: {
    /**
     * Split `profileIds` into the ones that no longer exist and a de-duplicated
     * copy. One indexed `in` query regardless of list length. Used to reject a
     * batch that still references a since-deleted profile.
     */
    validateProfileIds(profileIds: string[]): Promise<{
        missing: string[];
        deduped: string[];
    }>;
    createBatch(input: CreateBatchInput): Promise<WorkflowBatchWithItems>;
    getBatch(batchId: string): Promise<WorkflowBatchRecord | null>;
    getBatchWithItems(batchId: string): Promise<WorkflowBatchWithItems | null>;
    listBatches(workflowId?: string): Promise<WorkflowBatchRecord[]>;
    listItems(batchId: string): Promise<WorkflowBatchItemRecord[]>;
    updateBatchStatus(batchId: string, status: BatchStatus, error?: string | null): Promise<void>;
    /**
     * Atomically claim the next PENDING item for a profile. Returns the claimed
     * item or null when the queue is drained. The `updateMany` guard (id +
     * status=PENDING) guarantees only one worker wins a contested row.
     */
    claimNextItem(batchId: string, profileId: string): Promise<WorkflowBatchItemRecord | null>;
    setItemRun(itemId: string, runId: string): Promise<void>;
    completeItem(itemId: string, outputPaths: string[], retryCount: number): Promise<void>;
    failItem(itemId: string, status: Extract<BatchItemStatus, "ERROR" | "CANCELLED">, error: string, retryCount?: number): Promise<void>;
    /**
     * Reset a single terminal-error item (ERROR/CANCELLED) back to PENDING so the
     * worker pool re-runs it. Atomic `updateMany` guard: two concurrent retries of
     * the same item — only the first flips it, the loser gets `false`. `retryCount`
     * is preserved (the re-run overwrites it on completion); outputPaths cleared so
     * the poll shows a clean queued state.
     *
     * `newInputValues` (prompt/ảnh user vừa sửa) được ghi TRONG CÙNG câu update
     * với việc flip status — lane claim PENDING vì thế không bao giờ đọc được
     * giá trị cũ. Không truyền = giữ nguyên inputValues (retry thuần).
     */
    resetItemForRetry(itemId: string, newInputValues?: Record<string, string>): Promise<boolean>;
    /** Reset items left RUNNING by a crash back to PENDING (resume path). */
    resetRunningItems(batchId: string): Promise<void>;
    findBatchesByStatus(statuses: BatchStatus[]): Promise<WorkflowBatchRecord[]>;
    /** Counts used to decide a batch's terminal status. */
    countItemsByStatus(batchId: string): Promise<{
        total: number;
        pending: number;
        running: number;
        done: number;
        error: number;
        cancelled: number;
    }>;
    /** Mark every still-open item of a batch as CANCELLED (cancel path). */
    cancelOpenItems(batchId: string): Promise<void>;
};
//# sourceMappingURL=workflow.batch.repository.d.ts.map