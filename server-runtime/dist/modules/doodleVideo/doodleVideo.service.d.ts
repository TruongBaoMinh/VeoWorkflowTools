/**
 * Doodle Video Pipeline orchestrator (backend).
 *
 * Owns persistence of the DoodleVideoProject, drives the existing GenNormal
 * image/video generation, runs Whisper transcription, and assembles the final
 * timeline-synced video. LLM stages (topics/script/image prompts) run in the
 * renderer via Firebase→OpenRouter; the renderer PATCHes their results here.
 */
import { type WhisperSegment } from './whisperTranscribe.service.js';
import { type SubtitleConfig } from './subtitleLayout.js';
export interface AssemblyJob {
    id: string;
    doodleProjectId: string;
    status: 'RUNNING' | 'COMPLETED' | 'FAILED';
    progress: string;
    progressPct: number;
    finalVideoPath?: string;
    error?: string;
    startedAt: Date;
    completedAt?: Date;
}
interface StartGenerationOptions {
    profileIds: string[];
    outputType: 'IMAGE' | 'VIDEO';
    seedImageMediaId?: string;
    outputDir?: string;
    concurrency?: number;
    delaySeconds?: number;
    batchSize?: number;
    imageModelKey?: string;
    videoModelKey?: string;
}
declare class DoodleVideoService {
    private assemblyJobs;
    createProject(title: string, article: string, opts?: {
        outputDir?: string;
        style?: string;
        aspectRatio?: string;
        language?: string;
        voiceStyle?: string;
        mode?: string;
        storyStyle?: string;
        audioStyle?: string;
        styleSuffix?: string;
        cultureStyle?: string;
        minShotSeconds?: number;
        maxShotSeconds?: number;
    }): Promise<{
        script: string | null;
        updatedAt: Date;
        id: string;
        createdAt: Date;
        status: string;
        mode: string | null;
        aspectRatio: string | null;
        outputDir: string | null;
        stage: string;
        title: string;
        article: string;
        topicOptions: string | null;
        chosenTopicTitle: string | null;
        audioPath: string | null;
        audioDuration: number | null;
        whisperSegments: string | null;
        imagePrompts: string | null;
        outputType: string | null;
        seedImageMediaId: string | null;
        genNormalProjectId: string | null;
        finalVideoPath: string | null;
        style: string | null;
        language: string | null;
        voiceStyle: string | null;
        ttsVoice: string | null;
        ttsRate: string | null;
        ttsPitch: string | null;
        storyStyle: string | null;
        audioStyle: string | null;
        styleSuffix: string | null;
        customTopicsPrompt: string | null;
        customScriptPrompt: string | null;
        customImagePrompt: string | null;
        thumbnailPath: string | null;
        rawWhisperSegments: string | null;
        minShotSeconds: number | null;
        maxShotSeconds: number | null;
        cultureStyle: string | null;
    }>;
    listProjects(): import("@prisma/client").Prisma.PrismaPromise<{
        script: string | null;
        updatedAt: Date;
        id: string;
        createdAt: Date;
        status: string;
        mode: string | null;
        aspectRatio: string | null;
        outputDir: string | null;
        stage: string;
        title: string;
        article: string;
        topicOptions: string | null;
        chosenTopicTitle: string | null;
        audioPath: string | null;
        audioDuration: number | null;
        whisperSegments: string | null;
        imagePrompts: string | null;
        outputType: string | null;
        seedImageMediaId: string | null;
        genNormalProjectId: string | null;
        finalVideoPath: string | null;
        style: string | null;
        language: string | null;
        voiceStyle: string | null;
        ttsVoice: string | null;
        ttsRate: string | null;
        ttsPitch: string | null;
        storyStyle: string | null;
        audioStyle: string | null;
        styleSuffix: string | null;
        customTopicsPrompt: string | null;
        customScriptPrompt: string | null;
        customImagePrompt: string | null;
        thumbnailPath: string | null;
        rawWhisperSegments: string | null;
        minShotSeconds: number | null;
        maxShotSeconds: number | null;
        cultureStyle: string | null;
    }[]>;
    /** Lightweight list for the gallery — excludes large JSON blobs (article/script/segments). */
    listProjectSummaries(): import("@prisma/client").Prisma.PrismaPromise<{
        updatedAt: Date;
        id: string;
        createdAt: Date;
        status: string;
        aspectRatio: string;
        stage: string;
        title: string;
        finalVideoPath: string;
        style: string;
        thumbnailPath: string;
    }[]>;
    getProject(id: string): import("@prisma/client").Prisma.Prisma__DoodleVideoProjectClient<{
        script: string | null;
        updatedAt: Date;
        id: string;
        createdAt: Date;
        status: string;
        mode: string | null;
        aspectRatio: string | null;
        outputDir: string | null;
        stage: string;
        title: string;
        article: string;
        topicOptions: string | null;
        chosenTopicTitle: string | null;
        audioPath: string | null;
        audioDuration: number | null;
        whisperSegments: string | null;
        imagePrompts: string | null;
        outputType: string | null;
        seedImageMediaId: string | null;
        genNormalProjectId: string | null;
        finalVideoPath: string | null;
        style: string | null;
        language: string | null;
        voiceStyle: string | null;
        ttsVoice: string | null;
        ttsRate: string | null;
        ttsPitch: string | null;
        storyStyle: string | null;
        audioStyle: string | null;
        styleSuffix: string | null;
        customTopicsPrompt: string | null;
        customScriptPrompt: string | null;
        customImagePrompt: string | null;
        thumbnailPath: string | null;
        rawWhisperSegments: string | null;
        minShotSeconds: number | null;
        maxShotSeconds: number | null;
        cultureStyle: string | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    deleteProject(id: string): Promise<void>;
    /** Persist LLM artifacts sent from the renderer (topics/script/prompts/stage). */
    updateProject(id: string, patch: Partial<{
        title: string;
        topicOptions: string;
        chosenTopicTitle: string;
        script: string;
        imagePrompts: string;
        outputType: string;
        outputDir: string;
        stage: string;
        status: string;
        style: string;
        aspectRatio: string;
        language: string;
        voiceStyle: string;
        mode: string;
        ttsVoice: string;
        ttsRate: string;
        ttsPitch: string;
        storyStyle: string | null;
        audioStyle: string | null;
        styleSuffix: string | null;
        customTopicsPrompt: string | null;
        customScriptPrompt: string | null;
        customImagePrompt: string | null;
        minShotSeconds: number | null;
        maxShotSeconds: number | null;
        cultureStyle: string | null;
    }>): Promise<{
        script: string | null;
        updatedAt: Date;
        id: string;
        createdAt: Date;
        status: string;
        mode: string | null;
        aspectRatio: string | null;
        outputDir: string | null;
        stage: string;
        title: string;
        article: string;
        topicOptions: string | null;
        chosenTopicTitle: string | null;
        audioPath: string | null;
        audioDuration: number | null;
        whisperSegments: string | null;
        imagePrompts: string | null;
        outputType: string | null;
        seedImageMediaId: string | null;
        genNormalProjectId: string | null;
        finalVideoPath: string | null;
        style: string | null;
        language: string | null;
        voiceStyle: string | null;
        ttsVoice: string | null;
        ttsRate: string | null;
        ttsPitch: string | null;
        storyStyle: string | null;
        audioStyle: string | null;
        styleSuffix: string | null;
        customTopicsPrompt: string | null;
        customScriptPrompt: string | null;
        customImagePrompt: string | null;
        thumbnailPath: string | null;
        rawWhisperSegments: string | null;
        minShotSeconds: number | null;
        maxShotSeconds: number | null;
        cultureStyle: string | null;
    }>;
    setAudioPath(id: string, audioPath: string): Promise<{
        script: string | null;
        updatedAt: Date;
        id: string;
        createdAt: Date;
        status: string;
        mode: string | null;
        aspectRatio: string | null;
        outputDir: string | null;
        stage: string;
        title: string;
        article: string;
        topicOptions: string | null;
        chosenTopicTitle: string | null;
        audioPath: string | null;
        audioDuration: number | null;
        whisperSegments: string | null;
        imagePrompts: string | null;
        outputType: string | null;
        seedImageMediaId: string | null;
        genNormalProjectId: string | null;
        finalVideoPath: string | null;
        style: string | null;
        language: string | null;
        voiceStyle: string | null;
        ttsVoice: string | null;
        ttsRate: string | null;
        ttsPitch: string | null;
        storyStyle: string | null;
        audioStyle: string | null;
        styleSuffix: string | null;
        customTopicsPrompt: string | null;
        customScriptPrompt: string | null;
        customImagePrompt: string | null;
        thumbnailPath: string | null;
        rawWhisperSegments: string | null;
        minShotSeconds: number | null;
        maxShotSeconds: number | null;
        cultureStyle: string | null;
    }>;
    startTranscription(id: string, opts: {
        model?: string;
        language?: string;
    }): Promise<{
        jobId: string;
    }>;
    getTranscribeJobStatus(jobId: string): import("./whisperTranscribe.service.js").WhisperJob;
    applyTranscriptionResult(id: string, segments: WhisperSegment[], duration: number, opts?: {
        minSec?: number | null;
        maxSec?: number | null;
    }): Promise<{
        script: string | null;
        updatedAt: Date;
        id: string;
        createdAt: Date;
        status: string;
        mode: string | null;
        aspectRatio: string | null;
        outputDir: string | null;
        stage: string;
        title: string;
        article: string;
        topicOptions: string | null;
        chosenTopicTitle: string | null;
        audioPath: string | null;
        audioDuration: number | null;
        whisperSegments: string | null;
        imagePrompts: string | null;
        outputType: string | null;
        seedImageMediaId: string | null;
        genNormalProjectId: string | null;
        finalVideoPath: string | null;
        style: string | null;
        language: string | null;
        voiceStyle: string | null;
        ttsVoice: string | null;
        ttsRate: string | null;
        ttsPitch: string | null;
        storyStyle: string | null;
        audioStyle: string | null;
        styleSuffix: string | null;
        customTopicsPrompt: string | null;
        customScriptPrompt: string | null;
        customImagePrompt: string | null;
        thumbnailPath: string | null;
        rawWhisperSegments: string | null;
        minShotSeconds: number | null;
        maxShotSeconds: number | null;
        cultureStyle: string | null;
    }>;
    /**
     * Re-derive the grouped shots from the raw segments with new min/max seconds.
     * Invalidates any existing image prompts (their count would no longer match)
     * and gates on stage — after gen has started the user must reset-gen first.
     */
    regroupSegments(id: string, minSec: number, maxSec: number): Promise<{
        script: string | null;
        updatedAt: Date;
        id: string;
        createdAt: Date;
        status: string;
        mode: string | null;
        aspectRatio: string | null;
        outputDir: string | null;
        stage: string;
        title: string;
        article: string;
        topicOptions: string | null;
        chosenTopicTitle: string | null;
        audioPath: string | null;
        audioDuration: number | null;
        whisperSegments: string | null;
        imagePrompts: string | null;
        outputType: string | null;
        seedImageMediaId: string | null;
        genNormalProjectId: string | null;
        finalVideoPath: string | null;
        style: string | null;
        language: string | null;
        voiceStyle: string | null;
        ttsVoice: string | null;
        ttsRate: string | null;
        ttsPitch: string | null;
        storyStyle: string | null;
        audioStyle: string | null;
        styleSuffix: string | null;
        customTopicsPrompt: string | null;
        customScriptPrompt: string | null;
        customImagePrompt: string | null;
        thumbnailPath: string | null;
        rawWhisperSegments: string | null;
        minShotSeconds: number | null;
        maxShotSeconds: number | null;
        cultureStyle: string | null;
    }>;
    checkWhisperInstalled(): Promise<boolean>;
    startGeneration(id: string, opts: StartGenerationOptions): Promise<{
        genNormalProjectId: string;
        jobCount: number;
    }>;
    /** Stop the running GenNormal gen (cancel active + queued jobs). */
    stopGeneration(id: string): Promise<{
        success: boolean;
    }>;
    /** Reset the gen step so the user can start a fresh run (best-effort stops the old one). */
    resetGeneration(id: string): Promise<{
        script: string | null;
        updatedAt: Date;
        id: string;
        createdAt: Date;
        status: string;
        mode: string | null;
        aspectRatio: string | null;
        outputDir: string | null;
        stage: string;
        title: string;
        article: string;
        topicOptions: string | null;
        chosenTopicTitle: string | null;
        audioPath: string | null;
        audioDuration: number | null;
        whisperSegments: string | null;
        imagePrompts: string | null;
        outputType: string | null;
        seedImageMediaId: string | null;
        genNormalProjectId: string | null;
        finalVideoPath: string | null;
        style: string | null;
        language: string | null;
        voiceStyle: string | null;
        ttsVoice: string | null;
        ttsRate: string | null;
        ttsPitch: string | null;
        storyStyle: string | null;
        audioStyle: string | null;
        styleSuffix: string | null;
        customTopicsPrompt: string | null;
        customScriptPrompt: string | null;
        customImagePrompt: string | null;
        thumbnailPath: string | null;
        rawWhisperSegments: string | null;
        minShotSeconds: number | null;
        maxShotSeconds: number | null;
        cultureStyle: string | null;
    }>;
    /** Normalise the seed reference into GenNormal's Array<Record<profileId,mediaId>>. */
    private buildSeedRefs;
    pollGenStatus(id: string): Promise<{
        jobs: {
            id: any;
            projectId: any;
            profileId: any;
            prompt: any;
            jobIndex: any;
            batchIndex: any;
            mode: any;
            startImageMediaId: any;
            endImageMediaId: any;
            audioMediaId: any;
            referenceImageMediaIds: any;
            startImagePreviewUrl: any;
            endImagePreviewUrl: any;
            referenceImagePreviewUrls: any;
            veo3ProjectId: any;
            status: any;
            progress: any;
            providerJobId: any;
            resultUrl: any;
            error: any;
            retryCount: any;
            maxRetries: any;
            upsamplingJobId: any;
            isUpsampled: any;
            parentJobId: any;
            createdAt: any;
            updatedAt: any;
            startedAt: any;
            completedAt: any;
            profile: {
                id: any;
                name: any;
            };
        }[];
        stats: {
            total: number;
            draft: number;
            queued: number;
            processing: number;
            completed: number;
            failed: number;
            cancelled: number;
        };
        pollWindow: {
            activeJobs: number;
            recentTerminalJobs: number;
            terminalLimit: number;
            truncated: boolean;
        };
        rateLimitInfo: {
            hasRateLimit: boolean;
            profiles: Array<{
                profileId: string;
                isRateLimited: boolean;
                rateLimitType?: "403" | "429" | "500";
                rateLimitUntil?: string;
                remainingSeconds?: number;
                queuedJobs: number;
                runningJobs: number;
            }>;
        };
        timestamp: string;
    }>;
    startAssembly(id: string, opts: {
        burnSubtitles?: boolean;
        resolution?: string;
        fps?: number;
        subtitleConfig?: Partial<SubtitleConfig>;
    }): {
        assemblyJobId: string;
    };
    getAssemblyJobStatus(jobId: string): AssemblyJob | null;
    private runAssembly;
    /**
     * Copy this project's shot assets + narration into FableCut's media dir and
     * return the prefilled project.json document. Called by the Electron main
     * process (which owns the FableCut app dir) before opening the editor.
     */
    prepareFablecut(id: string, mediaDir: string, settings: {
        transitionType?: string;
        transitionDuration?: number;
        includeSubtitles?: boolean;
        kenBurns?: boolean;
        fps?: number;
        subtitleConfig?: Partial<SubtitleConfig>;
    }): Promise<Record<string, unknown>>;
    /** Import a FableCut-exported MP4 back into the project as the final video. */
    finalizeFablecutExport(id: string, exportPath: string): Promise<{
        script: string | null;
        updatedAt: Date;
        id: string;
        createdAt: Date;
        status: string;
        mode: string | null;
        aspectRatio: string | null;
        outputDir: string | null;
        stage: string;
        title: string;
        article: string;
        topicOptions: string | null;
        chosenTopicTitle: string | null;
        audioPath: string | null;
        audioDuration: number | null;
        whisperSegments: string | null;
        imagePrompts: string | null;
        outputType: string | null;
        seedImageMediaId: string | null;
        genNormalProjectId: string | null;
        finalVideoPath: string | null;
        style: string | null;
        language: string | null;
        voiceStyle: string | null;
        ttsVoice: string | null;
        ttsRate: string | null;
        ttsPitch: string | null;
        storyStyle: string | null;
        audioStyle: string | null;
        styleSuffix: string | null;
        customTopicsPrompt: string | null;
        customScriptPrompt: string | null;
        customImagePrompt: string | null;
        thumbnailPath: string | null;
        rawWhisperSegments: string | null;
        minShotSeconds: number | null;
        maxShotSeconds: number | null;
        cultureStyle: string | null;
    }>;
    private downloadTo;
}
export declare const doodleVideoService: DoodleVideoService;
export {};
//# sourceMappingURL=doodleVideo.service.d.ts.map