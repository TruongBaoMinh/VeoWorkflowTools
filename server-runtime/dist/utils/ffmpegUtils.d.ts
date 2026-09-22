/**
 * FFmpeg Utilities
 * Functions for video processing using ffmpeg
 */
import type { SubtitleConfig, SubtitleCue } from '../modules/doodleVideo/subtitleLayout.js';
/**
 * Extract the last frame from a video file
 * @param videoUrl - URL or file path to the video
 * @param outputPath - Path where the frame image should be saved
 * @returns Promise<string> - Path to the extracted frame image
 */
export declare function extractLastFrame(videoUrl: string, outputPath: string): Promise<string>;
/**
 * Concatenate multiple video files into a single output video using FFmpeg concat demuxer.
 * @param inputPaths - Ordered list of local video file paths
 * @param outputPath - Path for the merged output video
 * @returns Promise<string> - Path to the merged video
 */
export declare function concatVideos(inputPaths: string[], outputPath: string): Promise<string>;
/**
 * Check if ffmpeg is available in the system
 * @returns Promise<boolean>
 */
export declare function checkFFmpegAvailable(): Promise<boolean>;
/**
 * Get the duration of a media file (audio or video) in seconds
 */
export declare function getMediaDuration(filePath: string): Promise<number>;
/**
 * Mute a video (remove audio track, keep video only)
 */
export declare function muteVideo(inputPath: string, outputPath: string): Promise<string>;
/**
 * Overlay audio onto a video (replace any existing audio)
 */
export declare function overlayAudio(videoPath: string, audioPath: string, outputPath: string, options?: {
    trimToShortest?: boolean;
    audioVolume?: number;
}): Promise<string>;
/**
 * Mix background music with existing audio in a video
 */
export declare function mixBackgroundMusic(videoPath: string, bgmPath: string, outputPath: string, options?: {
    bgmVolume?: number;
    fadeIn?: number;
    fadeOut?: number;
    loop?: boolean;
}): Promise<string>;
/**
 * Burn a subtitle file into a video. Expects a self-describing `.ass` file
 * (see {@link generateASS}) — the ASS carries its own PlayResX/Y and Style, so
 * no `force_style` override is needed and libass renders in real video pixels.
 */
export declare function burnSubtitles(videoPath: string, subtitlePath: string, outputPath: string): Promise<string>;
/**
 * Generate SRT subtitle content from pre-wrapped cues.
 */
export declare function generateSRT(cues: SubtitleCue[]): string;
/**
 * Generate a self-describing ASS subtitle file from pre-wrapped cues.
 *
 * A plain SRT is rendered by libass against its 384×288 default script space,
 * which inflates `FontSize` ~3.75× at 1080p and re-wraps our lines (the "7 lines
 * instead of 2" bug). Declaring `PlayResX/Y` = the real video size makes every
 * unit a video pixel, and `WrapStyle: 2` disables libass auto-wrap — so the
 * ≤maxLines cues from {@link SubtitleCue} render exactly as laid out.
 */
export declare function generateASS(cues: SubtitleCue[], cfg: SubtitleConfig, videoWidth: number, videoHeight: number): string;
/**
 * @deprecated Superseded by {@link generateASS}, which renders in real video
 * pixels via PlayResX/Y. Kept only for the existing unit tests.
 *
 * Build the libass `force_style` string from a SubtitleConfig. Exported for
 * unit-testability.
 *
 * Background mode (cfg.background = true): BorderStyle=3 draws an opaque/alpha
 * box behind the text. OutlineColour becomes the box's border colour and Outline
 * becomes box padding; the glyph stroke is dropped — an accepted tradeoff.
 *
 * Outline mode (cfg.background = false): BorderStyle=1 strokes the glyph edges.
 */
export declare function buildForceStyle(cfg: SubtitleConfig, videoWidth: number, videoHeight: number): string;
//# sourceMappingURL=ffmpegUtils.d.ts.map