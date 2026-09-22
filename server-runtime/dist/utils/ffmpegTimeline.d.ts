/**
 * FFmpeg timeline helpers for the Doodle Video Pipeline.
 *
 * The existing merge primitives (ffmpegUtils.concatVideos / lib/ffmpegConcat)
 * only stitch clips back-to-back in list order. The doodle pipeline needs each
 * shot to occupy an EXACT duration derived from a Whisper segment so the final
 * concat lines up with the original narration audio. These helpers turn one
 * asset (a still image, or a generated video clip) into a silent clip of a
 * precise duration, normalised to a uniform codec so the downstream
 * `concatVideos(..., -c copy)` works without re-encoding.
 */
export interface ClipOptions {
    /** Output frame rate. Must match across all clips for a clean concat. */
    fps?: number;
    /** Output resolution "WxH". Must match across all clips for a clean concat. */
    resolution?: string;
}
/**
 * Render a still image into a silent video clip of EXACTLY `durationSec`.
 * Used for the IMAGE output path — gives frame-accurate timeline sync.
 */
export declare function imageToFixedClip(imagePath: string, durationSec: number, outputPath: string, opts?: ClipOptions): Promise<string>;
/**
 * Fit a generated VIDEO clip to EXACTLY `durationSec` (silent, normalised codec).
 * - clip longer than target → trimmed.
 * - clip shorter than target → looped (`-stream_loop`) then cut at target.
 * Used for the VIDEO output path (approximate per-clip sync).
 */
export declare function trimOrPadClip(clipPath: string, durationSec: number, outputPath: string, opts?: ClipOptions): Promise<string>;
//# sourceMappingURL=ffmpegTimeline.d.ts.map