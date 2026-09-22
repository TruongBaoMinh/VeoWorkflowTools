/**
 * Veo3 API Service
 * Browser-like request simulation for Veo3 Flow API interaction
 */
import { extractUUIDFromMediaId, normalizeReferenceImage, type ReferenceImageInput } from "../../utils/referenceImage.js";
export type { Veo3ServiceConfig, VideoModel, VideoModelConfig, CreditsResponse, UserPreferences, MediaLibraryResponse, MediaDetailResponse, SessionResponse, BatchLogRequest, GenerateVideoRequest, GenerateVideoReferenceImagesRequest, GenerateVideoStartImageRequest, GenerateVideoUpsampleRequest, GenerateCharacterImagesOptions, BatchGenerateImagesOptions, BatchGeneratedImageResult, GeneratedCharacterImageResult, GenerateVideoResponse, CheckStatusRequest, CheckStatusResponse, UploadImageResponse, FlowVoicePreset, } from "./veo3Types.js";
import type { Veo3ServiceConfig, VideoModel, VideoModelConfig, CreditsResponse, UserPreferences, MediaLibraryResponse, SessionResponse, BatchLogRequest, GenerateVideoRequest, GenerateVideoReferenceImagesRequest, GenerateVideoStartImageRequest, GenerateVideoUpsampleRequest, GenerateCharacterImagesOptions, BatchGenerateImagesOptions, BatchGeneratedImageResult, GeneratedCharacterImageResult, GenerateVideoResponse, CheckStatusRequest, CheckStatusResponse, UploadImageResponse, FlowVoicePreset } from "./veo3Types.js";
/**
 * Decode UUID from CAMa proto-base64 mediaId.
 * mediaId UUID extraction + referenceImages normalization live in a standalone
 * util so they can be unit-tested without dragging in the network/captcha/proxy
 * graph. Re-exported here for the existing call sites (VideoUpsamplingHandler,
 * workflow.engine) that import them from this module.
 */
export { extractUUIDFromMediaId, normalizeReferenceImage };
export type { ReferenceImageInput };
/**
 * Pull the voice catalogue out of the `Zzl0ze` payload.
 *
 * Shape (positional, captured from the live client):
 *   payload[3] = [ [ mediaId, 3, displayName,
 *                    [ mediaId, …9 nulls…, [[ name, description, isPreset, sampleUrl ]] ] ], … ]
 */
export declare function parseFlowVoicePresets(payload: unknown): FlowVoicePreset[];
/**
 * Veo3 API Service Class
 */
export declare class Veo3Service {
    private config;
    private readonly baseUrl;
    /**
     * Product slot in the createProject args. Captured verbatim from the live web
     * client for Flow (`PINHOLE`); the enum is not documented, so there is no
     * mapping for any other tool.
     */
    private static readonly FLOW_PRODUCT_SLOT;
    private static readonly FLOW_PRODUCT_TOOL;
    private static readonly UUID_PATTERN;
    private readonly sandboxBaseUrl;
    private readonly defaultHeaders;
    constructor(config?: Veo3ServiceConfig);
    /**
     * Update configuration
     */
    updateConfig(config: Partial<Veo3ServiceConfig>): void;
    /**
     * Refresh access token from cookies using /api/auth/session
     * Uses cookieTokenService to handle different cookie formats (JSON array, header string, etc.)
     * @returns New access token
     */
    refreshAccessTokenFromCookies(): Promise<string>;
    /**
     * Check if error is an authentication error (401/403)
     * NOTE: 403 with PUBLIC_ERROR_MODEL_ACCESS_DENIED is NOT an auth error —
     * it means the account lacks permission for this model. Token refresh won't help.
     */
    private isAuthError;
    /**
     * Mint N fresh reCAPTCHA Enterprise tokens by calling the user's Chrome
     * extension (via captchaManager) sequentially. Each token is single-use
     * and action-bound: reusing or mixing actions trips PUBLIC_ERROR_UNUSUAL_ACTIVITY.
     *
     * Throughput is bounded by Google's reCAPTCHA SDK (~1-3s/mint), not by
     * our parallelism — the extension serialises mints inside one Flow tab.
     *
     * @param action 'IMAGE_GENERATION' or 'VIDEO_GENERATION' (must match endpoint kind)
     * @param count number of tokens (1..N)
     */
    private requestRecaptchaTokens;
    /**
     * Execute API call with automatic token refresh on auth errors
     * @param apiCall - Function that makes the API call
     * @param retryOnAuthError - Whether to retry once after refreshing token (default: true)
     */
    private executeWithTokenRefresh;
    /**
     * Headers for TRPC API requests. Issued via the tlsClient Chrome 131 PSK
     * profile — User-Agent, Cookie, sec-ch-ua*, sec-fetch-* must align with the
     * fingerprint or reCAPTCHA Enterprise scoring will downgrade the call.
     */
    private getTrpcHeaders;
    /**
     * Headers for Google AI Sandbox API requests. Same browser-owned-headers
     * policy as getTrpcHeaders.
     *
     * CRITICAL: User-Agent must match the Chrome that minted the reCAPTCHA token.
     * In the single-shared-browser model the user-installed Chrome extension
     * mints inside the user's real Chrome (whatever version they have). Our
     * submit Node lane should declare a sec-ch-ua close to that — but since
     * we no longer know the master Chrome's exact version, we fall back to a
     * stable UA in veo3HttpClient.deriveChromeMajor / deriveSecChUa when the
     * caller doesn't pass one. Score is typically fine because the action
     * + IP + token signature dominate, not the sec-ch-ua minor mismatch.
     *
     * Referer is intentionally set to the labs.google root (matches real Chrome
     * captures of manual gen — Chrome strips the path on cross-origin POST to
     * googleapis.com, leaving only the origin). Earlier code sent the full
     * project-page URL which Google's reCAPTCHA pipeline flagged as a
     * non-browser submission.
     */
    private getSandboxHeaders;
    /**
     * Push image-gen telemetry events into the per-profile FlowTelemetryBuffer
     * (which batches + flushes on a delay, mirroring real Flow's network signature).
     *
     * Real Flow pattern (verified via captures/flowai-lifecycle-*.json):
     *   - Per gen on the wire: ONLY `flowMedia:batchGenerateImages` + `/clr` (auto)
     *   - `:batchLog` and `/flow:batchLogFrontendEvents` are flushed PERIODICALLY
     *     with N events accumulated (a single capture POST contained 12+ events)
     *
     * Old per-gen-immediate-POST behaviour produced a per-gen telemetry burst
     * (log → log → gen → log → log → log → log) that Google's reCAPTCHA Enterprise
     * scoring flagged as bot, causing PUBLIC_ERROR_UNUSUAL_ACTIVITY 403 after the
     * first 1–2 gens. See `flowTelemetryBuffer.ts` for the batching strategy.
     *
     * NOTE: `phase: 'before'` is intentionally a no-op now — real Flow does NOT
     * fire any pre-gen telemetry tied to the user clicking Generate. The previous
     * pre-gen FLOW_IMAGE_LATENCY with placeholder duration (`?? 300`) was a fake
     * value with no real-browser counterpart and added a per-gen request that
     * Google could fingerprint.
     */
    private fireImageGenLogs;
    /**
     * ✅ Get access token từ session
     * GET /api/auth/session
     *
     * Lấy access token từ session hiện tại. API này cần cookies từ browser session.
     * Thường được gọi từ browser context với cookies đã được set.
     *
     * @returns Session info bao gồm access_token, user info, và expires time
     */
    getSession(): Promise<SessionResponse>;
    /**
     * ✅ Get access token từ session với cookies từ profile
     * GET /api/auth/session
     *
     * Lấy access token từ session sử dụng cookies từ profile.
     *
     * @param cookieHeader - Cookie header string (e.g., "name1=value1; name2=value2")
     * @returns Session info bao gồm access_token, user info, và expires time
     */
    getSessionWithCookies(_cookieHeader: string): Promise<SessionResponse>;
    /**
     * ✅ Helper: Get access token từ session
     * Wrapper method để chỉ lấy access_token
     */
    getAccessToken(): Promise<string>;
    /**
     * ✅ Helper: Get access token và tự động update vào config
     * Tiện lợi để tự động refresh token và update vào service
     */
    refreshAccessToken(): Promise<string>;
    /**
     * ✅ Get Credits and Paygate Tier from sandbox API
     * GET /v1/credits
     */
    getCredits(): Promise<CreditsResponse>;
    /**
     * Create a Flow project.
     *
     * Runs on the flow.google.com BOQ transport: Google disabled the labs.google
     * tRPC `project.createProject` in Sept 2026 ("Flow RPCs have been deprecated
     * and disabled"). This lane authenticates with the profile's Google cookies,
     * not the ya29 Bearer, so there is no token-refresh retry here — a failure
     * means the profile is signed out of Flow, which only a re-login fixes.
     *
     * @returns the new project's UUID and the display name Flow echoed back
     */
    createProject(projectTitle: string, toolName?: string): Promise<{
        projectId: string;
        projectTitle: string;
    }>;
    /**
     * ✅ Helper: Create project và trả về projectId
     * Wrapper method để dễ sử dụng hơn
     */
    createProjectAndGetId(projectTitle: string, toolName?: string): Promise<string>;
    /**
     * Get video model config (TRPC API - phụ, không trực tiếp tạo video)
     * GET /api/trpc/videoFx.getVideoModelConfig
     *
     * Lấy danh sách tất cả video models có sẵn với thông tin chi tiết:
     * - Model keys (veo_3_1_t2v_fast_ultra, etc.)
     * - Supported aspect ratios
     * - Capabilities (TEXT, AUDIO, START_IMAGE, etc.)
     * - Video length, generation time
     * - Credit cost, paygate tier
     *
     * Chỉ dùng để lấy config, không ảnh hưởng đến video generation
     */
    getVideoModelConfig(): Promise<VideoModelConfig>;
    /**
     * ✅ Helper: Get video models list (chỉ lấy array videoModels)
     * Wrapper method để dễ sử dụng hơn
     */
    getVideoModels(): Promise<VideoModel[]>;
    /**
     * Fetch the list of preset audio voices ("externalReferenceMedia" with
     * mediaType=AUDIO) attached to a Veo3 project.
     *
     * Endpoint: `GET /api/trpc/flow.projectInitialData?input={"json":{"projectId":"<veo3ProjectId>"}}`
     *
     * The voice list is the same across all Veo3 projects of an account, but
     * Flow only exposes it through the per-project initial-data call. We
     * fetch with profile cookies + access token and parse the
     * `externalReferenceMedia` array. Each entry's `mediaId` (e.g.
     * `"achernar"`) is what gets passed back to Veo's video reference API
     * as `referenceAudio[].mediaId` — see `GenerateVideoReferenceImagesRequest`.
     *
     * @param veo3ProjectId Project id used to anchor the request URL/referer.
     *                      Caller must have already populated `config.cookies`
     *                      and/or `config.accessToken` for this profile.
     */
    listFlowVoicePresets(veo3ProjectId: string): Promise<FlowVoicePreset[]>;
    fetchMediaLibrary(options?: {
        pageSize?: number;
        cursor?: string | null;
    }): Promise<MediaLibraryResponse>;
    /**
     * ✅ Helper: Get video models filtered by criteria
     * Tìm models theo aspect ratio, capability, paygate tier, etc.
     */
    getVideoModelsByCriteria(options: {
        aspectRatio?: string;
        capability?: string;
        paygateTier?: string;
        excludeDeprecated?: boolean;
    }): Promise<VideoModel[]>;
    /**
     * ✅ Helper: Get video model by key
     * Tìm model cụ thể theo key (ví dụ: "veo_3_1_t2v_fast_ultra")
     */
    getVideoModelByKey(key: string): Promise<VideoModel | null>;
    /**
     * Fetch user preferences (TRPC API - phụ, không trực tiếp tạo video)
     * GET /api/trpc/general.fetchUserPreferences
     * Chỉ dùng để lấy user preferences, không ảnh hưởng đến video generation
     */
    fetchUserPreferences(): Promise<UserPreferences>;
    /**
     * Submit batch log (TRPC API - phụ, chỉ dùng cho analytics/logging)
     * POST /api/trpc/general.submitBatchLog
     * Chỉ dùng để gửi analytics events, không trực tiếp tạo video
     */
    submitBatchLog(logData: BatchLogRequest): Promise<any>;
    /**
     * ✅ API CHÍNH: Submit job generate video
     * POST /v1/video:batchAsyncGenerateVideoText
     *
     * Đây là API chính để tạo video. Trả về operation name để dùng cho check status.
     *
     * @returns operation name (dùng để poll status)
     */
    batchAsyncGenerateVideoText(request: GenerateVideoRequest, onRecaptchaComplete?: () => Promise<void>, onSubmitFired?: () => void): Promise<GenerateVideoResponse>;
    /**
     * ✅ API: Submit job generate video với reference images
     * POST /v1/video:batchAsyncGenerateVideoReferenceImages
     *
     * Đây là API để tạo video với reference images (đã upload lên Veo3).
     * Sử dụng khi có mediaGenerationId từ characters.
     *
     * API spec: Content-Type: application/json (khác với batchAsyncGenerateVideoText dùng text/plain)
     *
     * @returns operation name (dùng để poll status)
     */
    batchAsyncGenerateVideoReferenceImages(request: GenerateVideoReferenceImagesRequest, onRecaptchaComplete?: () => Promise<void>, onSubmitFired?: () => void): Promise<GenerateVideoResponse>;
    /**
     * ✅ API: Generate video from start image (image-to-video)
     * POST /v1/video:batchAsyncGenerateVideoStartImage
     *
     * Đây là API để tạo video từ ảnh bắt đầu (start image).
     * Sử dụng khi có mediaId từ frame cuối của video trước đó.
     *
     * API spec: Content-Type: text/plain;charset=UTF-8 (giống batchAsyncGenerateVideoText)
     *
     * @returns operation name (dùng để poll status)
     */
    batchAsyncGenerateVideoStartImage(request: GenerateVideoStartImageRequest, onRecaptchaComplete?: () => Promise<void>, onSubmitFired?: () => void): Promise<GenerateVideoResponse>;
    /**
     * ✅ API: Upsample video to 1080p
     * POST /v1/video:batchAsyncGenerateVideoUpsampleVideo
     *
     * Đây là API để upsampling video lên 1080p.
     * Sử dụng model veo_2_1080p_upsampler_8s.
     *
     * API spec: Content-Type: application/json
     *
     * @returns operation name (dùng để poll status)
     */
    batchAsyncGenerateVideoUpsampleVideo(request: GenerateVideoUpsampleRequest): Promise<GenerateVideoResponse>;
    /**
     * ✅ API: Upsample Image to 2K/4K
     * POST /v1/flow/upsampleImage
     *
     * @param mediaId - The mediaId of the image to upsample (CAMSJ... or similar)
     * @param targetResolution - UPSAMPLE_IMAGE_RESOLUTION_2K or UPSAMPLE_IMAGE_RESOLUTION_4K
     * @param projectId - The project ID (UUID format) required for clientContext
     */
    upsampleImage(mediaId: string, targetResolution: "UPSAMPLE_IMAGE_RESOLUTION_2K" | "UPSAMPLE_IMAGE_RESOLUTION_4K", projectId: string, userPaygateTier?: "PAYGATE_TIER_ONE" | "PAYGATE_TIER_TWO"): Promise<any>;
    /**
     * Generate reference images for characters (Imagen/Banana/GemPix)
     * POST /projects/{projectId}/flowMedia:batchGenerateImages
     */
    generateCharacterImages(options: GenerateCharacterImagesOptions): Promise<GeneratedCharacterImageResult[]>;
    /**
     * Generate multiple images with DIFFERENT prompts in a single batch request
     * POST /projects/{projectId}/flowMedia:batchGenerateImages
     * Max 4 prompts per batch for optimal performance
     *
     * This is more efficient than calling generateCharacterImages multiple times
     * because it uses a single reCAPTCHA token for multiple images
     */
    generateBatchImages(options: BatchGenerateImagesOptions): Promise<BatchGeneratedImageResult[]>;
    /**
     * ✅ API: Generate video from start and end images (frame-to-frame)
     * POST /v1/video:batchAsyncGenerateVideoStartAndEndImage
     *
     * Đây là API để tạo video từ ảnh bắt đầu và ảnh kết thúc (frame-to-frame).
     * Sử dụng khi có cả startImageMediaId và endImageMediaId.
     *
     * API spec: Content-Type: text/plain;charset=UTF-8
     *
     * @returns operation name (dùng để poll status)
     */
    batchAsyncGenerateVideoStartAndEndImage(request: GenerateVideoStartImageRequest, // Uses same type frame-to-frame
    onRecaptchaComplete?: () => Promise<void>, onSubmitFired?: () => void): Promise<GenerateVideoResponse>;
    /**
     * Convert Veo 3.1 SUBMIT response shape `{media:[{name, projectId, workflowId,...}]}`
     * sang legacy `operations[{sceneId, status, operation:{name, metadata:{...}}}]` shape.
     *
     * Submit-side: mỗi request chỉ gửi 1 reqItem → 1 `ourSceneId`. Khác poll-side
     * (N requests → N name→sceneId map → dùng `convertMediaArrayToPollOperations`).
     *
     * Pattern lấy từ inline converter cũ ở r2v submit — extract DRY để áp dụng cho
     * t2v / i2v / f2f / upsample (các mode lite tier Google trả `{media:[...]}` thay
     * vì `{operations:[...]}`).
     *
     * Giữ extras `__mediaName / __projectId / __workflowId` cho upstream queue manager
     * lưu `flowWorkflowId` (cần cho upsample request sau này — xem
     * genNormalQueueManager.ts xử lý workflowId).
     */
    private convertMediaArrayToSubmitOperations;
    /**
     * Convert Veo 3.1 `{media:[...]}` response shape into legacy `{operations:[...]}`
     * shape so downstream poll consumers (`processVideoStatusResult`,
     * `processUpsamplingStatusResult`) không phải biết về shape mới.
     *
     * @param mediaArr      `responseData.media` array từ Google response
     * @param nameToSceneId Map: `media.name` (UUID Google sinh) → `sceneId` mình gửi
     *                      (giúp upstream `sceneIdToJob` matching vẫn work)
     */
    private convertMediaArrayToPollOperations;
    /**
     * ✅ API CHÍNH: Check status + lấy video URL
     * POST /v1/video:batchCheckAsyncVideoGenerationStatus
     *
     * Đây là API chính để check status và lấy video URL khi hoàn thành.
     *
     * @returns status và videoUrl (nếu đã hoàn thành)
     */
    batchCheckAsyncVideoGenerationStatus(request: CheckStatusRequest, retryCount?: number, maxRetries?: number): Promise<CheckStatusResponse>;
    /**
     * Resolve a media's playable/download URL. Veo 3.1 (useV2ModelConfig) media
     * poll responses are SUCCESSFUL but carry NO embedded fifeUrl — the real
     * browser fetches the URL separately from this labs.google trpc endpoint,
     * which 302-redirects to a signed `flow-content.google/video/<id>?…` URL.
     * We read that `Location` header (followRedirects=false) instead of following
     * it (which would download the media bytes). Returns null on failure.
     */
    private static cachedVideoUrlType;
    private static readonly VIDEO_URL_TYPE_CANDIDATES;
    getMediaUrlRedirect(mediaId: string, projectId?: string, mediaUrlType?: string): Promise<string | null>;
    /** One `getMediaUrlRedirect` GET; returns the 3xx `Location` header or null. */
    private fetchMediaUrlRedirect;
    /**
     * ✅ NEW API SHAPE: Veo 3.1 r2v dùng `{media: [{name, projectId}]}` để
     * check status thay vì `{operations: [{operation: {name}, sceneId, status}]}`.
     * Response cũng đổi sang `{media: [{mediaMetadata: {mediaStatus: {mediaGenerationStatus}}, video: {...}}]}`.
     *
     * Method này gửi format mới rồi convert response về LEGACY shape
     * (`{operations: [...]}`) để downstream `processVideoStatusResult` không
     * phải biết về shape mới.
     */
    batchCheckMediaGenerationStatus(items: Array<{
        name: string;
        projectId: string;
        sceneId?: string;
    }>): Promise<CheckStatusResponse>;
    /**
     * ✅ Helper: Poll video status và trả về status + videoUrl
     * Wrapper method để dễ sử dụng hơn
     */
    pollVideoStatus(operationName: string, sceneId: string): Promise<{
        status: string;
        videoUrl: string | null;
        mediaId?: string;
        remainingCredits?: number;
        error?: string;
    }>;
    /**
     * Poll multiple video statuses at once (operations array)
     */
    pollVideoStatuses(operations: Array<{
        operationName: string;
        sceneId: string;
        projectId?: string;
    }>): Promise<Array<{
        operationName: string;
        sceneId: string;
        status: string;
        videoUrl: string | null;
        mediaId?: string;
        remainingCredits?: number;
        error?: string;
    }>>;
    private extractVideoUrlFromOperation;
    /**
     * Extract mediaId (name) from operation response
     * MediaId is in operation.operation.metadata.name
     */
    private extractMediaIdFromOperation;
    /**
     * Helper: Create batch log for VIDEOFX_CREATE_VIDEO event
     */
    createVideoCreateLog(options: {
        sessionId?: string;
        queryId?: string;
        aspectRatio?: string;
        paygateTier?: string;
        promptBoxMode?: string;
        eventTime?: string;
    }): BatchLogRequest;
    /**
     * Helper: Create batch log for PINHOLE_GENERATE_VIDEO event
     */
    createGenerateVideoLog(options: {
        sessionId?: string;
        view?: string;
        aspectRatio?: string;
        paygateTier?: string;
        promptBoxMode?: string;
        eventTime?: string;
    }): BatchLogRequest;
    /**
     * Helper: Create batch log for VIDEO_CREATION_TO_VIDEO_COMPLETION timer event
     */
    createVideoCompletionTimerLog(options: {
        sessionId?: string;
        timerId?: string;
        currentTimeMs?: number;
        eventTime?: string;
    }): BatchLogRequest;
    /**
     * Helper: Convert aspect ratio string to API enum format
     * Converts "16:9", "9:16" to VIDEO_ASPECT_RATIO_* enum
     * @public - Exposed for use by veo3JobProcessorService
     */
    convertAspectRatioToEnum(aspectRatio?: string): string;
    /**
     * Helper: Create generate video request
     */
    createGenerateVideoRequest(options: {
        projectId: string;
        prompt: string;
        aspectRatio?: string;
        seed?: number;
        videoModelKey?: string;
        sceneId?: string;
        paygateTier?: string;
        sessionId?: string;
    }): GenerateVideoRequest;
    /**
     * Lấy lý do hỏng thật của một operation bằng shape `{media:[...]}`.
     *
     * Hai shape bù trừ nhau: `{operations:[...]}` trả `fifeUrl` nhưng KHÔNG kèm lý do hỏng;
     * `{media:[...]}` trả lý do hỏng (vd `PUBLIC_ERROR_AUDIO_FILTERED`) nhưng không có URL.
     * Poll chính dùng shape đầu để lấy URL, nên chỉ gọi hàm này khi gặp FAILED mà thiếu lý do.
     *
     * Không bao giờ throw ra ngoài — lỗi thì trả null để caller giữ nguyên hành vi cũ.
     */
    fetchMediaFailureReason(operationName: string, veo3ProjectId: string): Promise<string | null>;
    /**
     * Helper: Create check status request
     */
    createCheckStatusRequest(operationName: string, sceneId: string, status?: string): CheckStatusRequest;
    /**
     * Generate a random ID (similar to UUID format)
     */
    private generateId;
    /**
     * Get headers for image upload requests
     * Based on code sample: content-type is application/json
     */
    private getUploadHeaders;
    /**
     * ✅ API: Upload user image
     * POST /v1:uploadUserImage
     *
     * Upload an image file to Google AI Sandbox for use as reference image in video generation.
     * Based on code sample: body is JSON with imageInput and clientContext structure
     *
     * @param imagePath - Path to the image file to upload
     * @param options - Optional upload options (aspectRatio, mimeType, sessionId)
     * @returns Upload response with mediaGenerationId, width, height
     */
    uploadUserImage(imagePath: string, options?: {
        aspectRatio?: string;
        mimeType?: string;
        sessionId?: string;
        projectId?: string;
    }): Promise<UploadImageResponse>;
    /**
     * ✅ Helper: Upload image and return mediaGenerationId
     * Wrapper method để dễ sử dụng hơn
     *
     * @param imagePath - Path to the image file
     * @returns mediaGenerationId from the upload response
     */
    uploadUserImageAndGetMediaId(imagePath: string): Promise<string>;
    /**
     * Delete Veo3 project
     * POST /api/trpc/project.deleteProject
     *
     * @param projectId - Veo3 project ID to delete
     * @returns true if successful
     */
    deleteProject(projectId: string): Promise<boolean>;
    /**
     * Delete media from Veo3 cloud
     * POST /api/trpc/media.deleteMedia
     *
     * @param mediaNames - Array of media IDs (CAMaJ... format) to delete
     * @returns true if successful
     */
    deleteMedia(mediaNames: string[]): Promise<boolean>;
    /**
     * ✅ Helper: Extract mediaId (CAMaJ... format) from upload response
     * This is the ID needed for referenceImages.mediaId in video generation
     *
     * @param response - UploadImageResponse from uploadUserImage
     * @returns mediaId in CAMaJ... format, or null if not found
     */
    extractMediaIdFromUploadResponse(response: UploadImageResponse): string | null;
    /**
     * Call Veo3 generateExpandedPrompt API
     *
     * This API takes a user prompt and style preamble and returns a professional
     * expanded prompt suitable for video generation.
     *
     * Endpoint: POST https://labs.google/fx/api/trpc/videoFx.generateExpandedPrompt
     *
     * @param userPrompt - Original user prompt (e.g., "Chú sói trắng đang chạy...")
     * @param preamble - Style preamble with guidelines (e.g., Film Noir formatting)
     * @param cookies - Cookie header string for authentication
     * @param sessionId - Optional session ID for tracking
     * @returns Expanded prompt string
     */
    callGenerateExpandedPromptAPI(userPrompt: string, preamble: string, cookies: string, sessionId?: string): Promise<string>;
    /**
     * Upload an image and return its mediaId (UUID preferred, CAMa fallback).
     * Combines `uploadUserImage` + `extractMediaIdFromUploadResponse`.
     */
    uploadImageAndExtractMediaId(imagePath: string, projectId: string, options?: {
        aspectRatio?: string;
        mimeType?: string;
        sessionId?: string;
    }): Promise<string>;
    /**
     * Poll a single video generation status and normalize the Veo3 enum into a
     * caller-friendly shape (PENDING / PROCESSING / COMPLETED / FAILED).
     */
    pollVideoStatusNormalized(operationId: string, sceneId: string): Promise<{
        status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
        videoUrl?: string;
        mediaId?: string;
        error?: string;
        progress: number;
        remainingCredits?: number;
    }>;
    /**
     * Expand a user prompt with a style preamble via Veo3's generateExpandedPrompt
     * API. Falls back to the original prompt on any error.
     */
    expandPromptByStyle(userPrompt: string, stylePreamble: string, sessionId?: string): Promise<string>;
}
export declare const veo3Service: Veo3Service;
//# sourceMappingURL=veo3Service.d.ts.map