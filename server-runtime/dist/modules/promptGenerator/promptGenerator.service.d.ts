/**
 * Prompt Generator Service
 * Generate image and video prompts from Vietnamese scripts using Gemini AI
 */
interface Scene {
    sceneName: string;
    sceneDescription: string;
    imagePrompt: string;
    videoPrompt: string;
}
declare class PromptGeneratorService {
    private genAI;
    private rateLimiter;
    private keyPool;
    private currentKeyIndex;
    private keyQueues;
    private lastRequestKeyId;
    private lastRequestFinishedAt;
    private keyLastFinishedAt;
    private requestCounter;
    /**
     * Normalize style ID: lowercase, trim, replace spaces with hyphens.
     * Maps user-facing style names to internal style config keys.
     */
    private normalizeStyleId;
    /**
     * Initialize Gemini API key pool (load all active keys)
     */
    private initializeKeyPool;
    /**
     * Public wrapper for softenStyle
     */
    getSoftenStyle(style: string): string;
    /**
     * Soften specific style names to avoid safety/copyright filters
     */
    private softenStyle;
    /**
     * Get queue for an API key (create if not exists)
     */
    private getKeyQueue;
    /**
     * Wait for cooldown (5s when switching keys, 10s when reusing same key)
     */
    private waitForKeyCooldown;
    /**
     * Record usage timestamps for an API key
     */
    private recordKeyUsage;
    /**
     * Get next key index for concurrent requests
     * Uses a counter-based approach to distribute keys evenly across parallel requests
     */
    private getNextKeyIndex;
    /**
     * Execute a Gemini request with per-key queue + cooldown logic
     * Similar to aiGeneration.service.ts executeGeminiRequest
     */
    private executeGeminiRequest;
    /**
     * Call Gemini API with retry logic and key rotation
     * Now uses executeGeminiRequest with per-key queue and cooldown
     */
    private callGeminiWithRetry;
    analyzeCharacters(script: string, style?: string): Promise<Array<{
        name: string;
        promptEn: string;
        promptVi: string;
    }>>;
    /**
     * Generate scene breakdowns with image and video prompts
     */
    generateScenes(data: {
        script: string;
        characters: Array<{
            name: string;
            promptEn: string;
        }>;
        style: string;
        aspectRatio: string;
        duration: number;
        sceneCount: number;
    }): Promise<Scene[]>;
    /**
     * Generate video-only scene breakdowns (for detailed scripts with camera movements)
     * Used for "Tạo prompt Veo3 hàng loạt" tool
     */
    generateVideoScenes(data: {
        script: string;
        characters: Array<{
            name: string;
            promptEn: string;
        }>;
        style: string;
    }): Promise<Array<{
        sceneName: string;
        mainEvents: string;
        charactersPresent: string[];
        detailedVideoPrompt: string;
    }>>;
    /**
     * Force reload API key pool (useful when keys are added/removed)
     */
    reloadKeyPool(): Promise<void>;
    /**
     * Generate thumbnail ideas for YouTube video
     * Step 1: Analyze video content and generate 4 thumbnail concepts
     */
    generateThumbnailIdeas(data: {
        title: string;
        content: string;
    }): Promise<{
        ideas: Array<{
            text: string;
            colors: string;
            font: string;
            visual: string;
        }>;
        bestChoiceIndex: number;
        reasoning: string;
    }>;
    /**
     * Generate image prompt for a specific thumbnail idea
     * Step 2: Convert thumbnail concept to image generation prompt
     */
    generateThumbnailPrompt(data: {
        title: string;
        content: string;
        idea: {
            text: string;
            colors: string;
            font: string;
            visual: string;
        };
    }): Promise<string>;
    /**
     * Build prompt template for Gemini browser automation
     * Returns the full prompt to be sent to Gemini via browser
     * Now supports style-based preambles for professional output
     */
    buildGeminiPromptTemplate(data: {
        script: string;
        characters: Array<{
            name: string;
            promptEn: string;
        }>;
        style: string;
        aspectRatio: string;
        duration: number;
        sceneCount: number;
        /** 'image' — CHỈ imagePrompt (no dialogue). 'video' — CHỈ videoPrompt (cinematic + dialogue). 'both' — cả hai. */
        outputType?: 'image' | 'video' | 'both';
    }): Promise<string>;
    /**
     * Build video-only prompt template for Gemini browser automation.
     * Delegates to buildGeminiPromptTemplate with outputType='video' to share the
     * same cinematic 6-BEAT structure, camera rig taxonomy, and vocal direction
     * rules used for combined prompts.
     */
    buildGeminiVideoPromptTemplate(data: {
        script: string;
        characters: Array<{
            name: string;
            promptEn: string;
        }>;
        style: string;
        aspectRatio: string;
        duration: number;
        sceneCount: number;
    }): Promise<string>;
    /**
     * Build prompt template for Gemini browser automation specifically tailored for Short Videos.
     * Short videos have fixed 8-second segments — the 6-BEAT cinematic structure is compressed
     * so it still fits an 8-second window while keeping camera rig + vocal direction rigor.
     * When outputType is set, the corresponding fields are included/omitted.
     */
    buildGeminiShortVideoPromptTemplate(data: {
        script: string;
        style: string;
        aspectRatio: string;
        outputType?: 'image' | 'video' | 'both';
        contentType?: 'affiliate' | 'story' | 'lifestyle' | 'tutorial' | 'dharma' | 'normal';
    }): Promise<string>;
    /**
     * Generate metadata and characters from idea (Pro Editor Step 1)
     */
    generateMetadataFromIdea(data: {
        idea: string;
        genreId: string;
        visualStyleId: string;
        audience: string;
        dialogueLanguage: 'vi-VN' | 'en-US';
        sceneCount: number | 'auto';
    }): Promise<any>;
    /**
     * Generate scene outlines from metadata (Pro Editor Step 2)
     */
    generateSceneOutlines(data: {
        metadata: any;
        idea: string;
        audience: string;
        dialogueLanguage: 'vi-VN' | 'en-US';
        targetSceneCount: number;
    }): Promise<any[]>;
    /**
     * Generate detailed scenes with veoPrompt (Pro Editor Step 3)
     */
    generateDetailedScenes(data: {
        metadata: any;
        sceneOutlines: any[];
        idea: string;
        visualStyleId: string;
        dialogueLanguage: 'vi-VN' | 'en-US';
    }): Promise<any[]>;
    /**
     * Convert raw text to script format (Pro Editor - From Text mode)
     */
    convertTextToScript(data: {
        text: string;
        title: string;
        genreId: string;
        visualStyleId: string;
        audience: string;
    }): Promise<any>;
    /**
     * Expand a prompt using Veo3's generateExpandedPrompt API with style guidelines
     *
     * @param data - User prompt, style, cookies, and optional sessionId
     * @returns Expanded prompt suitable for video generation
     */
    expandPromptByStyle(data: {
        userPrompt: string;
        style: string;
        cookies: string;
        sessionId?: string;
    }): Promise<string>;
    /**
     * Expand all scene prompts with Veo3 style-based expansion
     *
     * @param data - Scenes array, style, cookies, and optional sessionId
     * @returns Scenes with expanded videoPrompts
     */
    expandScenes(data: {
        scenes: Array<{
            sceneName: string;
            sceneDescription: string;
            imagePrompt: string;
            videoPrompt: string;
        }>;
        style: string;
        cookies: string;
        sessionId?: string;
    }): Promise<Array<{
        sceneName: string;
        sceneDescription: string;
        imagePrompt: string;
        videoPrompt: string;
        expandedVideoPrompt?: string;
        expansionError?: string;
    }>>;
    /**
     * Rewrite a prompt to avoid Veo3 content policy violations.
     * Used by Pipeline auto-fix when a job fails due to policy error.
     */
    rewritePromptForPolicy(originalPrompt: string, errorMessage: string): Promise<string>;
}
export declare const promptGeneratorService: PromptGeneratorService;
export {};
//# sourceMappingURL=promptGenerator.service.d.ts.map