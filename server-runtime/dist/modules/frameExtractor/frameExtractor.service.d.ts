interface ExtractedFrame {
    index: number;
    timestamp: number;
    path: string;
    filename: string;
    sceneId?: string;
    sceneDuration?: number;
}
interface VideoSegment {
    index: number;
    startTime: number;
    endTime: number;
    duration: number;
    path: string;
    filename: string;
}
interface ExtractionJob {
    id: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    progress: string;
    videoPath?: string;
    frames?: ExtractedFrame[];
    frameCount?: number;
    segments?: VideoSegment[];
    segmentCount?: number;
    error?: string;
    outputDir: string;
    startedAt: Date;
    completedAt?: Date;
}
interface ExtractOptions {
    mode: 'interval' | 'split-segments';
    interval?: number;
}
declare class FrameExtractorService {
    private jobs;
    /**
     * Start frame extraction job
     */
    startExtraction(videoSource: string, outputDir: string, options: ExtractOptions): Promise<{
        jobId: string;
    }>;
    /**
     * Get job status
     */
    getJobStatus(jobId: string): ExtractionJob | null;
    /**
     * Run extraction using Python script
     */
    private runExtraction;
    /**
     * Clean up old jobs (older than 1 hour)
     */
    cleanupOldJobs(): void;
}
export declare const frameExtractorService: FrameExtractorService;
export {};
//# sourceMappingURL=frameExtractor.service.d.ts.map