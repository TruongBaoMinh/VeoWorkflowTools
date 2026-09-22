/**
 * removeLogo — workflow-engine helpers for logo/watermark removal.
 *
 * Each helper materialises the upstream media to a local file (downloading
 * remote CDN urls first), runs the shipped Python batch script synchronously
 * (Promise-wrapped `spawn`, NOT detached — the engine awaits it directly, like
 * `spawnFfmpeg`), then copies the single cleaned output to a stable temp path
 * that OUTLIVES this call. The renderer streams that `file://` path through
 * `GET /api/workflow/media`; same lifetime contract as `wf_endframe_*` /
 * `wf_upscale_*`.
 *
 * The per-run scratch dir and any downloaded input are removed in `finally`;
 * the returned output file is written outside that dir so cleanup cannot take
 * it. Callers own the returned file's eventual lifetime (shared with the rest
 * of the engine's temp-file behaviour).
 */
export interface RemoveImageLogoOptions {
    pythonBin: string;
    scriptPath: string;
    method?: 'calib' | 'fsr' | 'telea';
    strength?: number;
}
export interface RemoveVideoLogoOptions {
    pythonBin: string;
    scriptPath: string;
    ffmpegBin: string;
    ffprobeBin: string | null;
    logo?: 'auto' | 'veo' | 'star' | 'both';
    corner?: 'br' | 'bl' | 'tr' | 'tl';
    crf?: number;
    strength?: number;
}
/**
 * Remove the logo/watermark from a single image. Returns an absolute path to the
 * cleaned image. Throws a plain `Error` on failure — the engine case decides
 * retry classification.
 */
export declare function removeImageLogo(url: string, opts: RemoveImageLogoOptions): Promise<string>;
/**
 * Remove the logo/watermark from a single video (short clip or merged output).
 * Returns an absolute path to the cleaned video.
 */
export declare function removeVideoLogo(url: string, opts: RemoveVideoLogoOptions): Promise<string>;
//# sourceMappingURL=removeLogo.d.ts.map