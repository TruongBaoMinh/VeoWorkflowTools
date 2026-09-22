export declare const POLL_JOB_SELECT: {
    id: boolean;
    projectId: boolean;
    profileId: boolean;
    prompt: boolean;
    jobIndex: boolean;
    batchIndex: boolean;
    mode: boolean;
    startImageMediaId: boolean;
    endImageMediaId: boolean;
    audioMediaId: boolean;
    referenceImageMediaIds: boolean;
    startImagePreviewUrl: boolean;
    endImagePreviewUrl: boolean;
    referenceImagePreviewUrls: boolean;
    veo3ProjectId: boolean;
    status: boolean;
    progress: boolean;
    providerJobId: boolean;
    resultUrl: boolean;
    error: boolean;
    retryCount: boolean;
    maxRetries: boolean;
    upsamplingJobId: boolean;
    isUpsampled: boolean;
    parentJobId: boolean;
    createdAt: boolean;
    updatedAt: boolean;
    startedAt: boolean;
    completedAt: boolean;
    profile: {
        select: {
            id: boolean;
            name: boolean;
        };
    };
};
export declare const POLL_TERMINAL_LIMIT: number;
export declare function toClientJob(job: any): {
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
};
export declare const genNormalService: {
    /**
     * List GenNormal projects
     * @param source - Filter by source: 'normal' (default) or 'pro_editor'. If not provided, returns only 'normal' projects.
     */
    listProjects(source?: "normal" | "pro_editor"): Promise<({
        _count: {
            jobs: number;
        };
        profiles: ({
            profile: {
                name: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            profileId: string;
            projectId: string;
            veo3ProjectId: string | null;
        })[];
    } & {
        name: string;
        updatedAt: Date;
        id: string;
        createdAt: Date;
        status: string;
        paygateTier: string | null;
        videoDurationSeconds: number | null;
        startedAt: Date | null;
        completedAt: Date | null;
        source: string;
        inputMethod: string;
        aspectRatio: string;
        outputDir: string;
        concurrency: number;
        batchSize: number;
        delaySeconds: number;
        videoModelKey: string | null;
        imageModelKey: string | null;
        autoDownload: boolean;
        autoUpscaleVideo: boolean;
        autoUpscaleImage: boolean;
        fileNamingTemplate: string | null;
        imageUpscaleRes: string | null;
        videoUpscaleRes: string | null;
        imageUpscaleConcurrency: number | null;
        audioEnabled: boolean;
        totalJobs: number;
        completedJobs: number;
        failedJobs: number;
        processingJobs: number;
    })[]>;
    /**
     * Get project detail with jobs
     * Includes preview URLs for reference images
     */
    getProject(projectId: string): Promise<any>;
    /**
     * Get jobs for a project (without full project details)
     */
    getProjectJobs(projectId: string): Promise<{
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
    }[]>;
    /**
     * Create new GenNormal project
     * Creates Veo3 projects for each selected profile
     */
    createProject(data: {
        name: string;
        profileIds: string[];
        inputMethod?: string;
        aspectRatio?: string;
        outputDir?: string;
        source?: "normal" | "pro_editor";
    }): Promise<{
        jobs: {
            error: string;
            profile: {
                name: string;
                id: string;
            };
            updatedAt: Date;
            id: string;
            createdAt: Date;
            status: string;
            profileId: string;
            projectId: string;
            prompt: string;
            jobIndex: number;
            batchIndex: number;
            mode: string;
            startImageMediaId: string;
            endImageMediaId: string;
            referenceImageMediaIds: import("@prisma/client/runtime/library").JsonValue;
            startImagePreviewUrl: string;
            endImagePreviewUrl: string;
            referenceImagePreviewUrls: import("@prisma/client/runtime/library").JsonValue;
            audioMediaId: string;
            progress: number;
            providerJobId: string;
            veo3ProjectId: string;
            resultUrl: string;
            retryCount: number;
            maxRetries: number;
            upsamplingJobId: string;
            isUpsampled: boolean;
            parentJobId: string;
            upscaledMediaId: string;
            downloadedAt: Date;
            downloadAttempts: number;
            lastDownloadError: string;
            startedAt: Date;
            completedAt: Date;
        }[];
        profiles: ({
            profile: {
                name: string;
                updatedAt: Date;
                id: string;
                active: boolean;
                createdAt: Date;
                description: string | null;
                accessToken: string | null;
                accessTokenExpires: Date | null;
                paygateTier: string | null;
                credits: number | null;
                subscriptionCredits: number | null;
                creditsUpdatedAt: Date | null;
                sessionExpiresAt: Date | null;
                maxConcurrency: number;
                maxConcurrentVeo3Jobs: number;
                dailyQuota: number | null;
                runningJobs: number;
                proxyHost: string | null;
                proxyPort: number | null;
                proxyUsername: string | null;
                proxyPassword: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            profileId: string;
            projectId: string;
            veo3ProjectId: string | null;
        })[];
    } & {
        name: string;
        updatedAt: Date;
        id: string;
        createdAt: Date;
        status: string;
        paygateTier: string | null;
        videoDurationSeconds: number | null;
        startedAt: Date | null;
        completedAt: Date | null;
        source: string;
        inputMethod: string;
        aspectRatio: string;
        outputDir: string;
        concurrency: number;
        batchSize: number;
        delaySeconds: number;
        videoModelKey: string | null;
        imageModelKey: string | null;
        autoDownload: boolean;
        autoUpscaleVideo: boolean;
        autoUpscaleImage: boolean;
        fileNamingTemplate: string | null;
        imageUpscaleRes: string | null;
        videoUpscaleRes: string | null;
        imageUpscaleConcurrency: number | null;
        audioEnabled: boolean;
        totalJobs: number;
        completedJobs: number;
        failedJobs: number;
        processingJobs: number;
    }>;
    /**
     * Ensure Veo3 projects are created for all profiles in the project
     * This is useful when loading an existing project that might not have veo3ProjectIds yet
     */
    ensureVeo3Projects(projectId: string): Promise<{
        jobs: {
            error: string;
            profile: {
                name: string;
                id: string;
            };
            updatedAt: Date;
            id: string;
            createdAt: Date;
            status: string;
            profileId: string;
            projectId: string;
            prompt: string;
            jobIndex: number;
            batchIndex: number;
            mode: string;
            startImageMediaId: string;
            endImageMediaId: string;
            referenceImageMediaIds: import("@prisma/client/runtime/library").JsonValue;
            startImagePreviewUrl: string;
            endImagePreviewUrl: string;
            referenceImagePreviewUrls: import("@prisma/client/runtime/library").JsonValue;
            audioMediaId: string;
            progress: number;
            providerJobId: string;
            veo3ProjectId: string;
            resultUrl: string;
            retryCount: number;
            maxRetries: number;
            upsamplingJobId: string;
            isUpsampled: boolean;
            parentJobId: string;
            upscaledMediaId: string;
            downloadedAt: Date;
            downloadAttempts: number;
            lastDownloadError: string;
            startedAt: Date;
            completedAt: Date;
        }[];
        profiles: ({
            profile: {
                name: string;
                updatedAt: Date;
                id: string;
                active: boolean;
                createdAt: Date;
                description: string | null;
                accessToken: string | null;
                accessTokenExpires: Date | null;
                paygateTier: string | null;
                credits: number | null;
                subscriptionCredits: number | null;
                creditsUpdatedAt: Date | null;
                sessionExpiresAt: Date | null;
                maxConcurrency: number;
                maxConcurrentVeo3Jobs: number;
                dailyQuota: number | null;
                runningJobs: number;
                proxyHost: string | null;
                proxyPort: number | null;
                proxyUsername: string | null;
                proxyPassword: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            profileId: string;
            projectId: string;
            veo3ProjectId: string | null;
        })[];
    } & {
        name: string;
        updatedAt: Date;
        id: string;
        createdAt: Date;
        status: string;
        paygateTier: string | null;
        videoDurationSeconds: number | null;
        startedAt: Date | null;
        completedAt: Date | null;
        source: string;
        inputMethod: string;
        aspectRatio: string;
        outputDir: string;
        concurrency: number;
        batchSize: number;
        delaySeconds: number;
        videoModelKey: string | null;
        imageModelKey: string | null;
        autoDownload: boolean;
        autoUpscaleVideo: boolean;
        autoUpscaleImage: boolean;
        fileNamingTemplate: string | null;
        imageUpscaleRes: string | null;
        videoUpscaleRes: string | null;
        imageUpscaleConcurrency: number | null;
        audioEnabled: boolean;
        totalJobs: number;
        completedJobs: number;
        failedJobs: number;
        processingJobs: number;
    }>;
    /**
     * Update project configuration
     */
    updateProject(projectId: string, data: {
        inputMethod?: string;
        aspectRatio?: string;
        outputDir?: string;
        concurrency?: number;
        delaySeconds?: number;
        videoModelKey?: string;
        imageModelKey?: string;
        paygateTier?: string;
        autoDownload?: boolean;
        autoUpscaleVideo?: boolean;
        autoUpscaleImage?: boolean;
        imageUpscaleRes?: "2K" | "4K" | null;
        videoUpscaleRes?: "1080P" | "4K" | null;
        imageUpscaleConcurrency?: number | null;
        videoDurationSeconds?: number;
        audioEnabled?: boolean;
        fileNamingTemplate?: string | null;
    }): Promise<{
        name: string;
        updatedAt: Date;
        id: string;
        createdAt: Date;
        status: string;
        paygateTier: string | null;
        videoDurationSeconds: number | null;
        startedAt: Date | null;
        completedAt: Date | null;
        source: string;
        inputMethod: string;
        aspectRatio: string;
        outputDir: string;
        concurrency: number;
        batchSize: number;
        delaySeconds: number;
        videoModelKey: string | null;
        imageModelKey: string | null;
        autoDownload: boolean;
        autoUpscaleVideo: boolean;
        autoUpscaleImage: boolean;
        fileNamingTemplate: string | null;
        imageUpscaleRes: string | null;
        videoUpscaleRes: string | null;
        imageUpscaleConcurrency: number | null;
        audioEnabled: boolean;
        totalJobs: number;
        completedJobs: number;
        failedJobs: number;
        processingJobs: number;
    }>;
    /**
     * Delete project and all its jobs
     * Also deletes Veo3 projects for each profile
     */
    /**
     * Delete every gen-normal project that has zero profiles attached. Such
     * projects become orphaned when the user removes the last profile they
     * were bound to; the detail page can't poll credits and the UI shows a
     * persistent error. Returns the IDs that were cleaned up.
     */
    deleteOrphanProjects(): Promise<{
        success: boolean;
        deletedCount: number;
        failedIds: string[];
        orphanIds: string[];
    }>;
    deleteAllProjects(): Promise<{
        success: boolean;
        deletedCount: number;
        failed: number;
    }>;
    deleteProject(projectId: string): Promise<{
        name: string;
        updatedAt: Date;
        id: string;
        createdAt: Date;
        status: string;
        paygateTier: string | null;
        videoDurationSeconds: number | null;
        startedAt: Date | null;
        completedAt: Date | null;
        source: string;
        inputMethod: string;
        aspectRatio: string;
        outputDir: string;
        concurrency: number;
        batchSize: number;
        delaySeconds: number;
        videoModelKey: string | null;
        imageModelKey: string | null;
        autoDownload: boolean;
        autoUpscaleVideo: boolean;
        autoUpscaleImage: boolean;
        fileNamingTemplate: string | null;
        imageUpscaleRes: string | null;
        videoUpscaleRes: string | null;
        imageUpscaleConcurrency: number | null;
        audioEnabled: boolean;
        totalJobs: number;
        completedJobs: number;
        failedJobs: number;
        processingJobs: number;
    }>;
    /**
     * Submit batch - parse prompts and create jobs (as DRAFT)
     */
    submitBatch(projectId: string, promptText: string | string[], aspectRatio?: string, mode?: string, concurrency?: number, delaySeconds?: number, videoModelKey?: string, referenceImageMediaIdsByProfile?: Array<Record<string, string>>, referenceImagePreviewUrlsByProfile?: Array<Record<string, string | null>>, appendJobs?: boolean, audioMediaId?: string | null, videoDurationSeconds?: number, perJobReferenceImageMediaIdsByProfile?: Array<Array<Record<string, string>>>, perJobReferenceImageHandles?: Array<Array<{
        handle: string;
        previewUrl?: string | null;
    }>>): Promise<{
        success: boolean;
        jobsCreated: number;
        prompts: string[];
    }>;
    /**
     * Submit image generation batch - parse prompts and create jobs (as DRAFT)
     * referenceImageMediaIdsByProfile: Array<Record<profileId, mediaId>> - mediaIds cho mỗi ảnh tham chiếu
     */
    submitImageGenerationBatch(projectId: string, promptText: string | string[], aspectRatio: string, referenceImageMediaIdsByProfile: Array<Record<string, string>>, appendJobs?: boolean): Promise<{
        success: boolean;
        jobsCreated: number;
        prompts: string[];
    }>;
    /**
     * Submit a storyboard image-generation batch where each shot gets its OWN
     * ordered list of reference mediaIds (chars first, location last). Differs
     * from `submitImageGenerationBatch` (where all shots share one ref set).
     *
     * `perJobReferenceImageMediaIdsByProfile[i]` = ordered slots for job i.
     * Each slot is a `Record<profileId, mediaId>` describing which mediaId to
     * use on each profile. Cap = 10 slots/shot (enforced again in repository).
     */
    submitStoryboardImageBatch(projectId: string, promptText: string | string[], aspectRatio: string, perJobReferenceImageMediaIdsByProfile: Array<Array<Record<string, string>>>, appendJobs?: boolean, jobsPerProfileBatch?: number): Promise<{
        success: boolean;
        jobsCreated: number;
        prompts: string[];
    }>;
    /**
     * Fetch the preset voice list (used by REFERENCE_TO_VIDEO_AUDIO mode).
     *
     * Voices are returned by Flow's `flow.projectInitialData` TRPC endpoint
     * keyed off a Veo3 project. We use the FIRST profile that already has a
     * `veo3ProjectId` so we get the same identity authenticating against Flow
     * as the rest of the GenNormal pipeline. The voice list itself is the
     * same across an account, so any profile works.
     */
    listFlowVoicePresets(projectId: string): Promise<{
        voices: import("../../services/veo3/veo3Types.js").FlowVoicePreset[];
    }>;
    /**
     * Poll job status
     */
    pollJobs(projectId: string): Promise<{
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
    /**
     * Retry a failed job
     */
    retryJob(projectId: string, jobId: string): Promise<{
        success: boolean;
    }>;
    /**
     * resultUrl (fifeUrl Google ký) có hạn — khi 403/404, lấy link ký MỚI từ
     * mediaId qua getMediaUrlRedirect rồi ghi đè resultUrl trong DB.
     * Job đã upscale ưu tiên upscaledMediaId (bản HD); job upscale cũ trước
     * migration không có field này → fallback mediaId gốc và trả
     * resolution='original' để UI cảnh báo link là bản CHƯA upscale.
     */
    refreshJobResultUrl(jobId: string): Promise<{
        success: boolean;
        freshUrl?: string;
        resolution?: "current" | "original";
        error?: "NOT_FOUND" | "NOT_COMPLETED" | "NO_MEDIA_ID" | "EXPIRED_COOKIES" | "MEDIA_DELETED" | "REFRESH_FAILED";
    }>;
    /**
     * Cancel a job
     */
    cancelJob(jobId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Update job (images, mode, etc.)
     */
    updateJob(jobId: string, data: {
        mode?: string;
        startImageMediaId?: string | null;
        endImageMediaId?: string | null;
        referenceImageMediaIds?: string[] | null;
        prompt?: string;
        startImagePreviewUrl?: string | null;
        endImagePreviewUrl?: string | null;
        referenceImagePreviewUrls?: Array<{
            mediaId: string;
            previewUrl: string;
        }> | null;
    }): Promise<{
        success: boolean;
    }>;
    /**
     * Upsample single job (video to 1080p, image to 2K/4K)
     */
    upsampleJob(jobId: string, resolution?: string): Promise<{
        success: boolean;
        upsamplingJobId: string;
        queueJobId: string;
    }>;
    /**
     * Upsample all completed video jobs in project
     */
    upsampleAllJobs(projectId: string, resolution?: string): Promise<{
        success: boolean;
        count: number;
        message: string;
        created?: undefined;
        errors?: undefined;
        errorDetails?: undefined;
    } | {
        success: boolean;
        count: number;
        created: number;
        errors: number;
        errorDetails: {
            jobId: string;
            error: string;
        }[];
        message?: undefined;
    }>;
    /**
     * Start generation - validate all DRAFT jobs and convert to QUEUED
     */
    startGeneration(projectId: string, concurrency?: number, delaySeconds?: number, videoModelKey?: string, batchSize?: number, imageModelKey?: string, videoDurationSeconds?: number): Promise<{
        success: boolean;
        jobsQueued: number;
    }>;
    /**
     * Delete a job
     */
    deleteJob(jobId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Retry all failed jobs in a project
     */
    retryAllFailedJobs(projectId: string): Promise<{
        success: boolean;
        retriedCount: number;
    }>;
    /**
     * Reset captcha/403 throttle state for every profile in the project and
     * requeue jobs stuck behind repeated reCAPTCHA failures (and any FAILED
     * jobs). Used by the "Reset & tiếp tục" button so a user hammered by 403s
     * can resume immediately instead of waiting out the escalating delay.
     */
    resetCaptchaAndRetry(projectId: string): Promise<{
        success: boolean;
        requeuedCount: number;
    }>;
    /**
     * Delete all video jobs (including COMPLETED) but keep image jobs
     * This is used when resetting video generation to ensure old videos don't show up
     */
    deleteAllVideoJobs(projectId: string): Promise<{
        success: boolean;
        deletedCount: number;
    }>;
    deleteAllCompletedJobs(projectId: string): Promise<{
        success: boolean;
        deletedCount: number;
    }>;
    /**
     * Pause project (stop submitting new jobs)
     */
    pauseProject(projectId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Resume project
     */
    resumeProject(projectId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Stop/cancel entire project
     */
    stopProject(projectId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Cleanup project queue when user navigates away
     * Cancels QUEUED jobs in DB to prevent them from auto-restoring on next startup
     * Also cancels orphaned upsampling queue jobs
     */
    cleanupProject(projectId: string): Promise<{
        success: boolean;
        clearedQueuedCount: number;
        clearedRunningCount: number;
        clearedSubmissionCount: number;
    }>;
    /**
     * Cancel ALL active jobs across all projects (called on app shutdown)
     * Prevents orphaned jobs from auto-restoring on next startup
     */
    cancelAllActiveJobs(): Promise<{
        success: boolean;
        cancelledJobs: number;
        cancelledQueueJobs: number;
        stoppedProjects: number;
    }>;
    /**
     * Merge all completed videos using ffmpeg.
     * customFileName (optional) lets callers (e.g. batch export) set the output
     * file name; otherwise we fall back to `merged_{projectId}_{timestamp}.mp4`.
     */
    mergeVideos(projectId: string, outputDir: string, jobIds?: string[], customFileName?: string): Promise<{
        success: boolean;
        outputPath: string;
        videoCount: number;
        fileName: string;
    }>;
    /**
     * Merge completed videos grouped by their original "Tạo job" batch (batchIndex).
     * Produces one output file per batch. Single-video batches are copied through
     * without re-encoding (ffmpeg concat demuxer needs 2+ inputs in the existing
     * mergeVideos helper).
     */
    mergeVideosByBatch(projectId: string, outputDir: string, fileNamePrefix?: string): Promise<{
        success: boolean;
        batchCount: number;
        results: Array<{
            batchIndex: number;
            fileName: string;
            videoCount: number;
            skipped?: boolean;
            reason?: string;
        }>;
    }>;
    /**
     * Upload image and get mediaId
     * Uses provider API to ensure same profile config for upload and video generation
     * Returns veo3ProjectId to ensure correct project is used for subsequent video generation
     */
    uploadImageAndGetMediaId(imagePath: string, profileId: string, aspectRatio?: string, projectId?: string, retryCount?: number): Promise<{
        mediaId: string;
        previewUrl: string | null;
        veo3ProjectId: string | null;
    }>;
    /**
     * Delete media from Veo3 cloud
     * Uses provider API to ensure same profile config
     */
    deleteMedia(mediaIds: string[], profileId: string): Promise<boolean>;
    /**
     * Create jobs with already-uploaded mediaIds for start/end frames
     * Images are already uploaded to their assigned profiles
     * veo3ProjectId is required to ensure the job uses the same Veo3 project where the image was uploaded
     */
    createJobsWithMediaIds(projectId: string, data: {
        jobs: Array<{
            prompt: string;
            mode: "IMAGE_TO_VIDEO" | "FRAME_TO_FRAME" | "REFERENCE_TO_VIDEO";
            profileId: string;
            jobIndex: number;
            batchIndex?: number;
            startImageMediaId?: string | null;
            endImageMediaId?: string | null;
            startImagePreviewUrl?: string | null;
            endImagePreviewUrl?: string | null;
            referenceImageMediaIds?: string[] | null;
            referenceImagePreviewUrls?: Array<{
                mediaId: string;
                previewUrl: string | null;
            }> | null;
            veo3ProjectId?: string;
        }>;
        aspectRatio: string;
        videoModelKey: string;
        outputDir: string;
        batchIndex?: number;
        videoDurationSeconds?: number;
    }): Promise<{
        success: boolean;
        jobsCreated: number;
        jobs: any[];
    }>;
    /**
     * Edit image - create new job to edit an existing image
     */
    editImage(jobId: string, editPrompt: string): Promise<{
        success: boolean;
        jobId: string;
    }>;
    /**
     * Reuse video - create new job with same configuration but new prompt
     */
    reuseVideo(jobId: string, newPrompt: string): Promise<{
        success: boolean;
        jobId: string;
    }>;
    /**
     * Cleanup stuck PROCESSING jobs (admin/debug tool)
     * Marks jobs that have been processing for > 30 minutes as FAILED
     */
    cleanupStuckJobs(): Promise<{
        success: boolean;
        cleanedCount: number;
        message: string;
        jobIds?: undefined;
    } | {
        success: boolean;
        cleanedCount: number;
        message: string;
        jobIds: string[];
    }>;
    /**
     * Get credits and paygate tier for a project
     */
    getCredits(projectId: string): Promise<import("../../services/veo3/veo3Types.js").CreditsResponse | {
        credits: number;
        userPaygateTier: string;
        sku: string;
        serviceTier: string;
        orphaned: true;
    }>;
};
//# sourceMappingURL=genNormal.service.d.ts.map