/**
 * Video Model Resolver
 * Logic để chọn đúng video model key dựa trên generation type và aspect ratio
 * Dựa trên dữ liệu model thực tế từ Veo3 API
 *
 * UPDATED 2026-05-16: Flow API đã bỏ family "Fast [Lower Priority]"
 * (`*_fast_*_ultra_relaxed`). Thay vào đó:
 * - "Lite [Lower Priority]" (`*_lite_low_priority`) là tier free/relaxed mới.
 * - REFERENCE_TO_VIDEO giờ chấp nhận `veo_3_1_r2v_lite` cho cả LANDSCAPE và
 *   PORTRAIT (3 image refs, audio, 8s).
 *
 * Active tiers per mode:
 * - TEXT_TO_VIDEO   : lite | lite_relaxed | fast | quality
 * - IMAGE_TO_VIDEO  : lite | lite_relaxed | fast | quality
 * - FRAME_TO_FRAME  : lite | lite_relaxed | fast | quality
 * - REFERENCE_TO_VIDEO : lite | lite_relaxed | fast  (no Quality from API)
 */
export type AspectRatio = '9:16' | '16:9' | '1:1' | '3:4' | '4:3';
export type GenerationType = 'TEXT_TO_VIDEO' | 'REFERENCE_TO_VIDEO' | 'REFERENCE_TO_VIDEO_AUDIO' | 'IMAGE_TO_VIDEO' | 'FRAME_TO_FRAME' | 'IMAGE_GENERATION';
export type ModelQuality = 'fast' | 'quality' | 'lite' | 'lite_relaxed';
export type UserTier = 'ADVANCED' | 'INTERMEDIATE' | 'ENTRY';
export type ModelFamily = 'veo_3_1' | 'omni_flash';
export declare const OMNI_FLASH_DURATIONS: readonly [4, 6, 8, 10];
export type OmniFlashDuration = (typeof OMNI_FLASH_DURATIONS)[number];
export declare function isOmniFlashKey(key: string | null | undefined): boolean;
/**
 * Image generation model keys
 */
export declare const IMAGE_GENERATION_MODELS: {
    readonly GEM_PIX_2: "GEM_PIX_2";
    readonly NARWHAL: "NARWHAL";
    readonly HARBOR_SEAL: "HARBOR_SEAL";
};
export type ImageModelKey = keyof typeof IMAGE_GENERATION_MODELS;
/**
 * Normalize an image model key from DB / flow-node storage.
 * Removed or unknown keys (e.g. legacy 'R2I', 'IMAGEN_3_5') coerce to 'GEM_PIX_2'
 * so old projects/flows never submit an invalid model to the Flow API.
 */
export declare function normalizeImageModelKey(key: string | null | undefined): string;
/**
 * Model info with credit cost and generation time.
 *
 * Fields after `capabilities` are optional and currently only populated by the
 * Omni Flash family — Veo 3.1 entries leave them undefined so existing clients
 * stay backward-compat.
 */
export interface VideoModelInfo {
    key: string;
    displayName: string;
    creditCost: number;
    videoLengthSeconds: number;
    videoGenerationTimeSeconds: number;
    isRelaxed: boolean;
    capabilities: string[];
    family?: ModelFamily;
    availableDurations?: number[];
    creditByDuration?: Record<number, number>;
    supportedModes?: GenerationType[];
    maxImageInputs?: number;
    maxAudioReferences?: number;
    maxCharacters?: number;
}
/**
 * Bijection: Ultra-only model key → equivalent Pro (INTERMEDIATE/ENTRY) key.
 *
 * Used for tier-based routing at submit time instead of `.replace('_ultra','')`,
 * which is fragile for the F2F keys whose suffix is `_ultra_fl` (the `_ultra`
 * is NOT at the end, so `endsWith('_ultra')` would skip them). Keys absent from
 * this map are tier-invariant (lite, quality, Omni Flash, image gen) and pass
 * through unchanged. Must stay in sync with the `fast` entries of the four
 * *_MODELS maps above.
 */
export declare const ULTRA_TO_PRO_KEY: Readonly<Record<string, string>>;
/** Map an Ultra key to its Pro equivalent; pass tier-invariant keys through. */
export declare function toProModelKey(key: string): string;
/**
 * Get available video models for a generation type
 * @param userTier Optional user paygate tier. Affects Lite credit cost (5 for ADVANCED, 10 otherwise).
 */
export declare function getAvailableVideoModels(generationType: GenerationType, aspectRatio: AspectRatio, userTier?: UserTier): VideoModelInfo[];
/**
 * Get available image generation models
 */
export declare function getAvailableImageModels(): Array<{
    key: string;
    displayName: string;
}>;
/**
 * Convert aspect ratio from format (16:9, 1:1, …) to VIDEO enum format.
 * Only 16:9 / 9:16 are valid for video generation; image-only ratios (1:1, 3:4,
 * 4:3) fall back to LANDSCAPE because they must never be passed to the video
 * endpoints — the fallback avoids throwing mid-submit in case of bad input.
 */
export declare function convertAspectRatioToEnum(aspectRatio: AspectRatio): string;
/**
 * Convert aspect ratio from enum format (VIDEO_ASPECT_RATIO_LANDSCAPE) to format (16:9)
 */
export declare function convertAspectRatioFromEnum(aspectRatioEnum: string): AspectRatio;
/**
 * Convert aspect ratio from format (16:9, 1:1, 3:4, 4:3, 9:16) to IMAGE enum format.
 * Used when submitting image-generation jobs to the Flow API.
 */
export declare function convertAspectRatioToImageEnum(aspectRatio: AspectRatio): string;
/**
 * Get the correct model key for a specific generation type, aspect ratio, and quality.
 * This directly looks up the model from the defined model maps (no string manipulation).
 *
 * Use this when you need to convert a project's model key to the correct model
 * based on the ACTUAL job mode (IMAGE_TO_VIDEO vs FRAME_TO_FRAME).
 *
 * @param generationType - IMAGE_TO_VIDEO or FRAME_TO_FRAME
 * @param aspectRatio - 9:16 or 16:9 (or VIDEO_ASPECT_RATIO_* enum)
 * @param quality - fast, quality, lite, or lite_relaxed
 * @returns The correct model key from the model maps
 */
export declare function getModelKeyForGenerationType(generationType: 'IMAGE_TO_VIDEO' | 'FRAME_TO_FRAME' | 'TEXT_TO_VIDEO' | 'REFERENCE_TO_VIDEO' | 'REFERENCE_TO_VIDEO_AUDIO', aspectRatio: AspectRatio | string, quality?: ModelQuality, duration?: number, family?: ModelFamily): string | null;
/**
 * Resolve the correct video model key based on generation type, aspect ratio, and quality
 *
 * @param generationType - TEXT_TO_VIDEO, REFERENCE_TO_VIDEO, IMAGE_TO_VIDEO, or FRAME_TO_FRAME
 * @param aspectRatio - 9:16, 16:9, etc. (format) or VIDEO_ASPECT_RATIO_* (enum format)
 * @param quality - fast or quality (default: fast)
 * @returns Object with modelKey and validation result
 */
export declare function resolveVideoModelKey(generationType: GenerationType, aspectRatio: AspectRatio | string, quality?: ModelQuality, duration?: number, family?: ModelFamily): {
    modelKey: string;
    isValid: boolean;
    error?: string;
    suggestion?: string;
};
/**
 * Validate if a combination of generation type and aspect ratio is supported
 */
export declare function validateGenerationConfig(generationType: GenerationType, aspectRatio: AspectRatio | string): {
    isValid: boolean;
    error?: string;
};
/**
 * Get list of supported aspect ratios for a generation type.
 * Video types: 9:16 + 16:9. Image generation: 5 ratios (1:1, 3:4, 4:3, 9:16, 16:9).
 */
export declare function getSupportedAspectRatios(generationType: GenerationType): AspectRatio[];
//# sourceMappingURL=videoModelResolver.d.ts.map