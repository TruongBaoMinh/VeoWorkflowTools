/**
 * extractEndFrame — pick the LAST still-sharp frame from the tail of a video.
 *
 * Veo3 clips routinely end on a fade-out or a motion-blurred frame, so the
 * literal final frame makes a poor start-frame for the next clip. Sharpness is
 * scored by JPEG file size at a fixed `-q:v`: at constant quality, size tracks
 * high-frequency detail, and black / faded / blurred frames compress far
 * smaller. That keeps the whole thing dependency-free — no sharp, jimp, opencv
 * or Python needed.
 *
 * Measured on an 8s clip with a 0.8s fade-to-black tail:
 *   literal last frame  → 4,705 B, visually near-black   ← the bug being fixed
 *   ffmpeg thumbnail=45 → 26,856 B but 0.79s before EOF  ← sharp, wrong position
 *   this algorithm      → t=7.458s / 8.0s, visually sharp
 * Control on a clip with no fade: last/max size ratio is 0.984, so the 0.88
 * threshold still returns the true final frame.
 */
/**
 * Extract the last sharp frame of a video and return an absolute path to it.
 *
 * Accepts an https URL, a `file://` URL, or a bare absolute path.
 *
 * The returned JPEG deliberately outlives this call: the renderer streams it
 * through `GET /api/workflow/media` and `mediaResultToBase64` may read it when
 * the node feeds gemini-script. Same lifetime contract as `wf_upscale_*.jpg`.
 *
 * Throws plain `Error` only — `NonRetryableError` is private to the engine, so
 * retry classification stays in the dispatch case.
 */
export declare function extractLastSharpFrame(videoUrl: string, ffmpegBinary: string): Promise<string>;
//# sourceMappingURL=extractEndFrame.d.ts.map