export type NodeType = 'prompt' | 'gemini-script' | 'upload-image' | 'generate-image' | 'generate-video' | 'upscale-image' | 'upscale-video' | 'merge-video' | 'extract-endframe' | 'remove-image-logo' | 'remove-video-logo' | 'result';
export type ImageMode = 'text' | 'reference';
export type VideoMode = 'text-to-video' | 'image-to-video' | 'reference-to-video' | 'frame-to-frame';
export type NodeRunStatus = 'pending' | 'running' | 'done' | 'error' | 'skipped';
export interface MediaResult {
    mediaId: string;
    /**
     * Video-compatible media id (the generation/CAMaJD id). Veo3 video
     * start/reference images require this, NOT the UUID resource `name` that
     * `mediaId` carries for upscale / image-input. Falls back to `mediaId`.
     */
    veoMediaId?: string;
    url: string;
    kind?: 'image' | 'video';
}
export interface NodeRunState {
    status: NodeRunStatus;
    results: MediaResult[];
    textValue?: string;
    /** Multi-output text (e.g. gemini-script): index k = output port `text-out-k`. */
    textValues?: string[];
    error?: string;
    /** Raw Google reason code (e.g. PUBLIC_ERROR_USER_QUOTA_REACHED) when a Veo3 call failed. */
    reason?: string;
    /** Number of auto-retries this node consumed (0 / absent when it passed first try). */
    retryCount?: number;
    completedAt?: string;
}
export declare function emptyNodeState(): NodeRunState;
export interface WorkflowNodeDef {
    id: string;
    type: NodeType;
    data: Record<string, unknown>;
    label?: string;
    position?: {
        x: number;
        y: number;
    };
}
export interface WorkflowEdgeDef {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}
export interface WorkflowDef {
    id: string;
    name: string;
    description?: string;
    nodes: WorkflowNodeDef[];
    edges: WorkflowEdgeDef[];
}
export type RunStatus = 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export interface WorkflowRunRecord {
    id: string;
    workflowId: string;
    profileId: string;
    veo3ProjectId?: string | null;
    status: RunStatus;
    nodeStates: Record<string, NodeRunState>;
    inputOverrides?: Record<string, Record<string, unknown>> | null;
    error?: string | null;
    startedAt?: Date | null;
    completedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface StartRunOptions {
    workflowId: string;
    profileId: string;
    veo3ProjectId?: string;
    inputOverrides?: Record<string, Record<string, unknown>>;
    /**
     * Retry: re-run starting at this node and everything downstream, reusing the
     * source run's completed upstream results (and its veo3 project so those media
     * ids stay valid). Requires `sourceRunId`.
     */
    retryFromNodeId?: string;
    sourceRunId?: string;
    /**
     * System AI credentials (license key + deviceId) for nodes that call the
     * credit-metered remote AI (gemini-script). Held in memory for the run only.
     */
    aiCreds?: {
        key: string;
        deviceId: string;
    };
}
export interface DispatchResult {
    results: MediaResult[];
    textValue?: string;
    textValues?: string[];
}
export interface ResolvedInputs {
    promptTexts: string[];
    imageResults: MediaResult[];
    videoResults: MediaResult[];
}
export type EngineEvent = {
    type: 'node:state';
    nodeId: string;
    state: NodeRunState;
} | {
    type: 'run:status';
    status: RunStatus;
    error?: string;
};
export declare const NODE_CONCURRENCY = 4;
export declare const POLL_INTERVAL_MS = 5000;
export declare const MAX_POLL_MS: number;
/** Exact veo3 terminal status strings returned by pollVideoStatuses. */
export declare const STATUS_OK = "MEDIA_GENERATION_STATUS_SUCCESSFUL";
export declare const STATUS_FAIL = "MEDIA_GENERATION_STATUS_FAILED";
export declare const TEXT_SOURCES: NodeType[];
export declare const IMAGE_SOURCES: NodeType[];
export declare const VIDEO_SOURCES: NodeType[];
export declare const sleep: (ms: number) => Promise<void>;
//# sourceMappingURL=workflow.types.d.ts.map