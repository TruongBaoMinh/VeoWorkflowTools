/**
 * Named reference-image handles for COMPONENTS ("Thành phần") reference-to-video.
 *
 * A prompt addresses specific uploaded images by name:
 *   "wide shot of @BG-01 with @CHAR-04 on camera-left"
 * Each `@Handle` binds one reference image. Flow caps references per request
 * (3 for Veo r2v, 7 for Omni Flash), so the caller passes `maxRefs`.
 *
 * The renderer mirrors the tokenizer half of this file in
 * `apps/renderer/src/utils/referenceHandles.ts` (plus slug helpers it alone
 * needs). The two workspaces share no package and this repo already duplicates
 * small pure utils across them (see `getJobMode`); keep the tokenizer in sync.
 */
/** Matches a whole `@Handle` mention. Kept separate from the tokenizer scan. */
export declare const MENTION_RE: RegExp;
export type PromptPart = {
    text: string;
} | {
    reference: {
        media: {
            mediaId: string;
            handle: string;
        };
    };
};
export interface HandleDefinition {
    /** The handle as the user spelled it — this is what Flow echoes back. */
    canonical: string;
    mediaId: string;
}
export interface TokenizeResult {
    parts: PromptPart[];
    /** Canonical handles in first-appearance order, deduplicated. */
    bound: string[];
    /** Mentioned tokens with no matching image, in appearance order. */
    unknown: string[];
    /** True when the prompt binds more distinct handles than `maxRefs` allows. */
    overflow: boolean;
}
/**
 * Split a prompt into alternating text / reference parts.
 *
 * Scans character-by-character rather than using `MENTION_RE` so a handle token
 * is always consumed greedily: with both `CHAR-1` and `CHAR-10` defined, the
 * text `@CHAR-10` binds `CHAR-10` — a shortest-match or unordered-alternation
 * regex would bind `CHAR-1` and leave a stray `0`.
 *
 * A repeated mention emits a reference part at every position (the model needs
 * the image pinned wherever it is named) but contributes one entry to `bound`,
 * which is what becomes `referenceImages[]`.
 *
 * Unknown handles are left verbatim in the text so the user can still see what
 * they typed; they are reported via `unknown` for the caller to surface.
 */
export declare function tokenizePrompt(raw: string, handleMap: Map<string, HandleDefinition>, maxRefs: number): TokenizeResult;
/**
 * Enforce the prompt character budget across `parts` without ever touching a
 * reference part — trimming one would drop an image binding entirely. Trailing
 * text parts are shortened (and dropped when emptied) until the budget is met.
 */
export declare function clampTextParts(parts: PromptPart[], maxChars: number): PromptPart[];
/**
 * Drop the `@` marker but keep the name: "@BG-01 on the left" → "BG-01 on the
 * left". Used by the flat-prompt path, where the image set is already resolved
 * and the marker would only be noise to the model.
 */
export declare function stripMentionMarkers(raw: string): string;
/** True when the text contains at least one well-formed `@Handle`. */
export declare function hasAnyMention(text: string): boolean;
/** Build the tokenizer's lookup map from stored `{handle, mediaId}` pairs. */
export declare function buildHandleMap(handles: Array<{
    handle: string;
    mediaId: string;
}>): Map<string, HandleDefinition>;
//# sourceMappingURL=referenceHandles.d.ts.map