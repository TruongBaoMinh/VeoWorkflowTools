/**
 * spawnFfmpeg — shared child-process wrapper for the bundled ffmpeg binary.
 *
 * stderr is buffered rather than inherited so a failure surfaces the tail of
 * ffmpeg's own diagnostics (the useful part) instead of an opaque exit code.
 */
export declare function spawnFfmpeg(binary: string, args: string[]): Promise<void>;
//# sourceMappingURL=spawnFfmpeg.d.ts.map