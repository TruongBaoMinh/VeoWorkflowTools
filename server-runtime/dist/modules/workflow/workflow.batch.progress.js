/**
 * Batch Flow progress derivation — pure functions, no I/O.
 *
 * Imported by the poll route to enrich each item with per-node progress so the
 * UI can show "node X/Y + current node" without extra DB round-trips.
 */
const NODE_TYPE_LABELS = {
    prompt: 'Nhập prompt',
    'gemini-script': 'Tạo script AI',
    'upload-image': 'Tải ảnh',
    'generate-image': 'Tạo ảnh',
    'generate-video': 'Tạo video',
    'upscale-image': 'Nâng cấp ảnh',
    'upscale-video': 'Nâng cấp video',
    'merge-video': 'Ghép video',
    'extract-endframe': 'Trích khung cuối',
    'remove-image-logo': 'Xóa logo ảnh',
    'remove-video-logo': 'Xóa logo video',
    result: 'Lấy kết quả',
};
/**
 * Derive progress counts from a run's nodeStates + the workflow node index.
 * Pure: no I/O, testable in isolation.
 *
 * `totalNodes` excludes 'skipped' nodes — the engine skips them when an upstream
 * node fails, so they were never going to run and must not count toward progress.
 */
export function deriveProgress(nodeStates, nodeIndex) {
    const executable = Object.entries(nodeStates).filter(([, s]) => s.status !== 'skipped');
    const completedNodes = executable.filter(([, s]) => s.status === 'done').length;
    const errorNodes = executable.filter(([, s]) => s.status === 'error').length;
    const running = executable.find(([, s]) => s.status === 'running');
    let currentNodeLabel = null;
    if (running) {
        const def = nodeIndex.get(running[0]);
        if (def) {
            currentNodeLabel = def.label?.trim() || NODE_TYPE_LABELS[def.type] || def.type;
        }
        else {
            currentNodeLabel = running[0];
        }
    }
    return { completedNodes, totalNodes: executable.length, currentNodeLabel, errorNodes };
}
//# sourceMappingURL=workflow.batch.progress.js.map