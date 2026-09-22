/**
 * Whisper transcription bridge (Node → Python) for the Doodle Video Pipeline.
 * Mirrors frameExtractor.service.ts: spawns a python worker, parses
 * "[PROGRESS] step (NN%)" on stderr and a single JSON result on stdout, and
 * tracks jobs in an in-memory Map polled by the routes.
 */
export interface WhisperSegment {
    start: number;
    end: number;
    text: string;
}
export interface WhisperJob {
    id: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    progress: string;
    segments?: WhisperSegment[];
    segmentCount?: number;
    duration?: number;
    language?: string;
    error?: string;
    startedAt: Date;
    completedAt?: Date;
}
interface TranscribeOptions {
    model?: string;
    language?: string;
}
declare class WhisperTranscribeService {
    private jobs;
    private installedCache;
    private installedCacheUntil;
    /** Check whether faster-whisper is importable in the resolved venv (cached 30s). */
    checkInstalled(): Promise<boolean>;
    startTranscription(audioPath: string, options?: TranscribeOptions): {
        jobId: string;
    };
    getJobStatus(jobId: string): WhisperJob | null;
    private run;
    private extractError;
}
export declare const whisperTranscribeService: WhisperTranscribeService;
export {};
//# sourceMappingURL=whisperTranscribe.service.d.ts.map