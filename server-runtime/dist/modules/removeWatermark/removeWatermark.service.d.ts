export type WatermarkJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type MediaType = 'image' | 'video';
export interface WatermarkJob {
    id: string;
    status: WatermarkJobStatus;
    progress: string;
    done: number;
    total: number;
    failed: number;
    /** Absolute paths of successfully cleaned images/videos (thumbnails / list). */
    outputs: string[];
    outputDir: string;
    mediaType: MediaType;
    method?: string;
    videosTotal?: number;
    currentVideoIndex?: number;
    currentVideoName?: string;
    /** True when the parallel pool broke and the job finished sequentially. */
    fallback?: boolean;
    error?: string;
    startedAt: Date;
    completedAt?: Date;
}
export interface ProcessOptions {
    inputPath: string;
    outputDir: string;
    mediaType?: MediaType;
    strength?: number;
    aspectRatio?: string;
    method?: 'calib' | 'fsr' | 'telea';
    quality?: number;
    workers?: number;
    logo?: 'auto' | 'veo' | 'star' | 'both';
    corner?: 'br' | 'bl' | 'tr' | 'tl';
    crf?: number;
    samples?: number;
}
/**
 * Build a child env with the bundled ffmpeg/ffprobe injected by FULL PATH
 * (Electron bundles platform-prefixed names like `win32-x64-ffmpeg.exe`, so a
 * bare `ffmpeg` PATH lookup would fail) plus the dir prepended to PATH.
 */
export declare function buildFfmpegEnv(ffmpegPath: string, ffprobePath: string | null): NodeJS.ProcessEnv;
/**
 * Thư mục user-writable chứa packages cài qua nút "Cài tự động"
 * (pip install --target). Bản cài NSIS per-machine để resources/ read-only
 * lúc runtime nên KHÔNG thể pip install vào bundled site-packages.
 */
export declare function userPythonPackagesDir(): string;
/**
 * Env cho mọi lần spawn Python: prepend PYTHONPATH = userData/python-packages
 * (nếu tồn tại) để packages cài runtime được ưu tiên khi bundle thiếu cv2/numpy.
 */
export declare function buildPythonEnv(base?: NodeJS.ProcessEnv): NodeJS.ProcessEnv;
/**
 * Resolve the alpha map to use: a user-calibrated map wins over a bundled one;
 * `null` means the Python side falls back to fsr/telea.
 */
export declare function resolveAlphaPath(): string | null;
declare class RemoveWatermarkService {
    private jobs;
    private processes;
    startProcessing(opts: ProcessOptions): {
        jobId: string;
    };
    /** Shared pre-flight: refuse output dir == source dir (would overwrite originals). */
    private ensureOutputSafe;
    getJobStatus(jobId: string): WatermarkJob | null;
    cancelJob(jobId: string): boolean;
    isAlphaAvailable(): boolean;
    private runJob;
    private runVideoJob;
    private fail;
    private extractError;
    /** One-shot calibration → writes a user alpha map into userData/watermark/. */
    calibrate(folder: string): Promise<{
        alphaPath: string;
        count: number;
    }>;
    cleanupOldJobs(): void;
}
export declare const removeWatermarkService: RemoveWatermarkService;
export {};
//# sourceMappingURL=removeWatermark.service.d.ts.map