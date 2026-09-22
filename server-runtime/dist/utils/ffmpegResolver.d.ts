/**
 * Resolve ffmpeg binary path
 */
export declare function resolveFfmpegBinary(): string | null;
/**
 * Resolve ffprobe binary path
 */
export declare function resolveFfprobeBinary(): string | null;
/**
 * Resolve both ffmpeg and ffprobe binaries
 */
export declare function resolveFFmpegBinaries(): {
    ffmpeg: string | null;
    ffprobe: string | null;
};
export declare function getDefaultMergedOutputDir(projectId: string): string;
//# sourceMappingURL=ffmpegResolver.d.ts.map