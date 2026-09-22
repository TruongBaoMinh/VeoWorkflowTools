/**
 * Veo3 Service Type Definitions
 * All interfaces and types used by Veo3Service
 */
export interface Veo3ServiceConfig {
    accessToken?: string;
    projectId?: string;
    veo3ProjectId?: string;
    locale?: string;
    referer?: string;
    userAgent?: string;
    cookies?: string;
    profileId?: string;
    proxyConfig?: any;
    agent?: any;
    onTokenRefreshed?: (newToken: string) => Promise<void>;
}
export interface VideoModel {
    key: string;
    supportedAspectRatios: string[];
    accessType: string;
    capabilities: string[];
    videoLengthSeconds: number;
    videoGenerationTimeSeconds?: number;
    displayName: string;
    creditCost?: number;
    framesPerSecond: number;
    paygateTier: string;
    modelAccessInfo: Record<string, any>;
    modelMetadata: {
        veoModelName?: string;
        modelQuality?: string;
    };
    modelStatus?: string;
}
export interface VideoModelConfig {
    result: {
        data: {
            json: {
                result: {
                    videoModels: VideoModel[];
                };
                status: number;
                statusText: string;
            };
        };
    };
}
export interface CreditsResponse {
    credits: number;
    userPaygateTier: string;
    sku: string;
    serviceTier: string;
    subscriptionCredits?: number;
}
export interface UserPreferences {
    result: {
        data: {
            json: any;
        };
    };
}
export interface MediaLibraryResponse {
    result?: {
        data?: {
            json?: {
                result?: {
                    userWorkflows?: any[];
                    nextPageToken?: string | null;
                };
                status?: number;
                statusText?: string;
            };
        };
    };
}
export interface MediaDetailResponse {
    name: string;
    image?: {
        encodedImage?: string;
        seed?: number;
        prompt?: string;
        fifeUrl?: string;
        aspectRatio?: string;
        [key: string]: any;
    };
    mediaGenerationId?: {
        mediaType?: string;
        projectId?: string;
        workflowId?: string;
        workflowStepId?: string;
        mediaKey?: string;
    };
    [key: string]: any;
}
export interface SessionResponse {
    user: {
        name: string;
        email: string;
        image: string;
    };
    expires: string;
    access_token: string;
}
export interface BatchLogRequest {
    appEvents: Array<{
        event: string;
        eventMetadata?: {
            sessionId?: string;
        };
        eventProperties?: Array<{
            stringValue?: string;
            intValue?: number;
        }>;
        activeExperiments?: any[];
        eventTime?: string;
    }>;
}
/**
 * Công tắc audio của Flow (khớp payload browser):
 *  - BLOCK_SILENCED_VIDEOS  = audio BẬT  → audio bị content-filter thì Google huỷ luôn video.
 *  - RETURN_SILENCED_VIDEOS = audio TẮT  → trả video câm, job vẫn thành công.
 */
export type AudioFailurePreference = 'BLOCK_SILENCED_VIDEOS' | 'RETURN_SILENCED_VIDEOS';
export interface GenerateVideoRequest {
    useV2ModelConfig?: boolean;
    useNewMedia?: boolean;
    mediaGenerationContext?: {
        batchId: string;
        audioFailurePreference?: AudioFailurePreference;
    };
    clientContext: {
        sessionId?: string;
        projectId: string;
        tool: string;
        userPaygateTier: string;
        recaptchaContext?: {
            token: string;
            applicationType: string;
        };
    };
    requests: Array<{
        clientContext?: {
            recaptchaContext?: {
                token: string;
                applicationType: string;
            };
            sessionId?: string;
            projectId?: string;
            tool?: string;
        };
        aspectRatio: string;
        seed?: number;
        textInput: {
            prompt?: string;
            structuredPrompt?: {
                parts: Array<{
                    text: string;
                }>;
            };
        };
        videoModelKey: string;
        metadata?: {
            sceneId?: string;
        };
    }>;
}
export interface GenerateVideoReferenceImagesRequest {
    useV2ModelConfig?: boolean;
    useNewMedia?: boolean;
    mediaGenerationContext?: {
        batchId: string;
        audioFailurePreference?: AudioFailurePreference;
    };
    clientContext: {
        sessionId?: string;
        projectId: string;
        tool: string;
        userPaygateTier: string;
        recaptchaContext?: {
            token: string;
            applicationType: string;
        };
    };
    requests: Array<{
        clientContext?: {
            recaptchaContext?: {
                token: string;
                applicationType: string;
            };
            sessionId?: string;
            projectId?: string;
            tool?: string;
        };
        aspectRatio: string;
        seed?: number;
        textInput: {
            prompt?: string;
            structuredPrompt?: {
                parts: Array<{
                    text: string;
                }>;
            };
        };
        videoModelKey: string;
        metadata: {
            sceneId?: string;
        };
        referenceImages: Array<{
            imageUsageType?: string;
            mediaId: string;
        }>;
        /**
         * Voice preset(s) for REFERENCE_TO_VIDEO_AUDIO mode.
         * Each entry references a Flow `externalReferenceMedia` audio item
         * (e.g. `{ mediaId: "achernar" }`). The Veo `r2v` model with
         * `outputsAudio: true` uses this to lock the speaking voice and
         * keep tone consistent across the batch.
         */
        referenceAudio?: Array<{
            mediaId: string;
        }>;
    }>;
}
/**
 * One voice preset returned by Flow's `flow.projectInitialData` TRPC call
 * (filtered to `externalReferenceMedia` items with `mediaType === "AUDIO"`).
 * The `mediaId` is what gets passed back to Veo as `referenceAudio[].mediaId`
 * for REFERENCE_TO_VIDEO_AUDIO video generation.
 */
export interface FlowVoicePreset {
    mediaId: string;
    displayName: string;
    description: string;
    audioSamplePath: string;
}
export interface GenerateVideoStartImageRequest {
    useV2ModelConfig?: boolean;
    useNewMedia?: boolean;
    mediaGenerationContext?: {
        batchId: string;
        audioFailurePreference?: AudioFailurePreference;
    };
    clientContext: {
        sessionId?: string;
        projectId: string;
        tool: string;
        userPaygateTier: string;
        recaptchaContext?: {
            token: string;
            applicationType: string;
        };
    };
    requests: Array<{
        clientContext?: {
            recaptchaContext?: {
                token: string;
                applicationType: string;
            };
            sessionId?: string;
            projectId?: string;
            tool?: string;
        };
        aspectRatio: string;
        seed?: number;
        textInput: {
            prompt?: string;
            structuredPrompt?: {
                parts: Array<{
                    text: string;
                }>;
            };
        };
        videoModelKey: string;
        metadata: {
            sceneId: string;
        };
        startImage: {
            mediaId: string;
        };
        endImage?: {
            mediaId: string;
        };
    }>;
}
export interface GenerateVideoUpsampleRequest {
    clientContext?: {
        sessionId?: string;
        projectId?: string;
        tool?: string;
        userPaygateTier?: string;
        recaptchaContext?: {
            token: string;
            applicationType: string;
        };
    };
    mediaGenerationContext?: {
        audioFailurePreference?: AudioFailurePreference;
        batchId?: string;
    };
    useV2ModelConfig?: boolean;
    requests: Array<{
        aspectRatio: string;
        resolution?: string;
        seed?: number;
        videoInput: {
            mediaId: string;
        };
        videoModelKey: string;
        metadata?: {
            sceneId?: string;
            workflowId?: string;
        };
        clientContext?: {
            sessionId?: string;
            projectId?: string;
        };
    }>;
}
export interface GenerateCharacterImagesOptions {
    projectId: string;
    prompt: string;
    imageModelName: string;
    outputs?: number;
    imageAspectRatio?: 'IMAGE_ASPECT_RATIO_SQUARE' | 'IMAGE_ASPECT_RATIO_PORTRAIT' | 'IMAGE_ASPECT_RATIO_LANDSCAPE' | 'IMAGE_ASPECT_RATIO_PORTRAIT_3_4' | 'IMAGE_ASPECT_RATIO_LANDSCAPE_4_3';
    seeds?: number[];
    sessionId?: string;
    timeoutMs?: number;
    referenceImageMediaIds?: string[];
    imageInputType?: 'IMAGE_INPUT_TYPE_REFERENCE' | 'IMAGE_INPUT_TYPE_BASE_IMAGE';
    onSubmitFired?: () => void;
}
export interface BatchGenerateImagesOptions {
    projectId: string;
    imageModelName: string;
    imageAspectRatio?: 'IMAGE_ASPECT_RATIO_SQUARE' | 'IMAGE_ASPECT_RATIO_PORTRAIT' | 'IMAGE_ASPECT_RATIO_LANDSCAPE' | 'IMAGE_ASPECT_RATIO_PORTRAIT_3_4' | 'IMAGE_ASPECT_RATIO_LANDSCAPE_4_3';
    sessionId?: string;
    timeoutMs?: number;
    prompts: Array<{
        prompt: string;
        seed?: number;
        referenceImageMediaIds?: string[];
        imageInputType?: 'IMAGE_INPUT_TYPE_REFERENCE' | 'IMAGE_INPUT_TYPE_BASE_IMAGE';
    }>;
    onRecaptchaComplete?: () => Promise<void>;
    onSubmitFired?: () => void;
}
export interface BatchGeneratedImageResult extends GeneratedCharacterImageResult {
    promptIndex: number;
}
export interface GeneratedCharacterImageResult {
    name?: string;
    seed?: number;
    prompt?: string;
    aspectRatio?: string;
    modelNameType?: string;
    encodedImage?: string;
    fifeUrl?: string;
    mediaGenerationId?: string;
    veoMediaId?: string;
}
export interface GenerateVideoResponse {
    operations: Array<{
        operation: {
            name: string;
        };
        sceneId: string;
        status: string;
    }>;
}
export interface CheckStatusRequest {
    operations: Array<{
        operation: {
            name: string;
        };
        sceneId: string;
        status: string;
    }>;
}
export interface CheckStatusResponse {
    operations: Array<{
        operation: {
            name: string;
            metadata?: {
                '@type'?: string;
                name?: string;
                video?: {
                    seed?: number;
                    mediaGenerationId?: string;
                    prompt?: string;
                    fifeUrl?: string;
                    mediaVisibility?: string;
                    servingBaseUri?: string;
                    model?: string;
                    isLooped?: boolean;
                    aspectRatio?: string;
                };
            };
        };
        sceneId: string;
        mediaGenerationId?: string;
        status: string;
    }>;
    remainingCredits?: number;
}
export interface UploadImageResponse {
    name?: string;
    mediaGenerationId?: {
        mediaGenerationId: string;
    };
    mediaId?: string;
    assetId?: string;
    generatedMedia?: Array<{
        mediaId?: string;
        name?: string;
    }>;
    width?: number;
    height?: number;
    imageUrl?: string;
    imageId?: string;
    [key: string]: any;
}
export interface ProxyAgentPair {
    httpAgent: any;
    dispatcher: any;
}
//# sourceMappingURL=veo3Types.d.ts.map