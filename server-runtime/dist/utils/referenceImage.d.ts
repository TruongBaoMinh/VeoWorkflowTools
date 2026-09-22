/**
 * Veo3 image-gen returns mediaIds in two formats:
 *   - UUID: `9f2c9717-1234-...` (from upload, REST media name)
 *   - CAMa: `CAMSJDE1ZGI4NWQy...` (proto-base64 envelope from batchGenerateImages)
 * Veo3's video gen `referenceImages[].mediaId` and image gen `imageInputs[].name`
 * accept UUID only — sending CAMa triggers 500 INTERNAL. The CAMa proto carries
 * the UUID in field 3 (tag 0x1a, length 0x24=36 bytes).
 */
export declare function extractUUIDFromMediaId(mediaId: string | null | undefined): string;
/** A single referenceImages[] entry for the r2v endpoint. */
export interface ReferenceImageInput {
    mediaId?: string | null;
    imageUsageType?: string;
    [key: string]: unknown;
}
/**
 * Normalize a referenceImages[] entry to the proven-working Flow r2v contract:
 *  - mediaId MUST be a flat UUID. Mixing CAMa + UUID in one request → 500 INTERNAL.
 *  - imageUsageType MUST be present. Flow's reference endpoint rejects a bare
 *    { mediaId } with 500 INTERNAL; the UI always tags references ASSET. Default
 *    it here so every caller (workflow engine included) matches genNormal's
 *    working request shape without each caller repeating the contract.
 */
export declare function normalizeReferenceImage(ref: ReferenceImageInput): {
    mediaId: string;
    imageUsageType: string;
};
//# sourceMappingURL=referenceImage.d.ts.map