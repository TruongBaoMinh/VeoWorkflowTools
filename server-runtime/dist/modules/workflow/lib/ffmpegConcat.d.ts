/**
 * ffmpegConcat — concatenate video files using ffmpeg concat demuxer.
 * No re-encode: streams are copied directly (-c copy). All inputs must share
 * the same codec, resolution, and frame rate (standard for same-model outputs).
 */
/**
 * Stream a remote video to a local temp file. The concat demuxer's protocol
 * whitelist excludes https, and Veo3's signed CDN URLs (Expires/Signature) do
 * not stream reliably through `-c copy` range requests — so we materialize each
 * remote input to disk first. Streamed (not buffered) to handle 4K outputs.
 *
 * `label` prefixes the error so the failing node is identifiable — this helper
 * is shared with extract-endframe, not merge-video alone.
 */
export declare function downloadToTemp(url: string, label: string): Promise<string>;
/**
 * Stream a remote image to a local temp file, preserving the real extension from
 * the response `content-type`. `downloadToTemp` hardcodes `.mp4`, which corrupts
 * the filename the logo-removal Python scripts derive their output name from —
 * they write `<outDir>/<basename(input)>`, so a `.mp4`-named JPEG produces a
 * `.mp4`-named output that the renderer's content-type inference mishandles.
 */
export declare function downloadImageToTemp(url: string, label: string): Promise<string>;
export declare function concatVideos(inputPaths: string[], outputPath: string): Promise<void>;
//# sourceMappingURL=ffmpegConcat.d.ts.map