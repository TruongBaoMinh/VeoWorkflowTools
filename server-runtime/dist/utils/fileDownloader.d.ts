/**
 * File Downloader Utility
 * Downloads files from URL and saves to local path.
 *
 * Strategy:
 *   - HEAD probe to discover Content-Length + Accept-Ranges
 *   - If file > CHUNK_SIZE AND server accepts Range → chunked download
 *     (HTTP 206 Partial Content, per-chunk size verify, chunk-level retry)
 *   - Otherwise → single-shot streaming GET with tightened verification
 *   - MP4/MOV files get a structural integrity check (ftyp + moov atoms)
 *     to catch silent truncations that slip past Content-Length checks.
 */
export declare function isRetryableDownloadError(error: unknown): boolean;
/**
 * Structural sanity check for MP4/MOV files. Detects truncated downloads that
 * still happen to land at a byte boundary the size check would otherwise accept
 * (e.g. server closes connection mid-mdat with FIN).
 *
 * Exported for tests.
 */
export declare function verifyMp4Integrity(filePath: string): Promise<{
    valid: boolean;
    reason?: string;
}>;
/**
 * Move a suspect file into a sibling `_quarantine/` folder and drop a sidecar
 * recording why. Returns the resting path. Falls back to leaving the file where
 * it is rather than throwing — losing the diagnostic is better than losing the
 * file, which is the failure mode this whole function exists to prevent.
 */
export declare function quarantineFile(outputPath: string, reason: string): Promise<string>;
/**
 * Return a path that does not yet exist on disk. If `desiredPath` is free it is
 * returned unchanged; otherwise an index suffix (`_1`, `_2`, …) is appended
 * before the extension. Used to keep re-downloads (e.g. a regenerated batch row)
 * from overwriting an earlier file. Same numbering scheme as `quarantineFile`.
 */
export declare function resolveUniquePath(desiredPath: string): string;
/**
 * Public entry point: download a file from URL to local path with retry.
 *
 * @param url        Source URL (http://, https://, file://, or local path)
 * @param outputPath Local path where the file should be saved
 * @returns          The final outputPath when the download succeeds
 */
export declare function downloadFile(url: string, outputPath: string): Promise<string>;
//# sourceMappingURL=fileDownloader.d.ts.map