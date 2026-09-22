/**
 * Gemini Official API Service
 * Uses @google/genai SDK for direct API access
 * Supports text generation with streaming, image analysis
 *
 * Auto-fallback: gemini-2.5-flash (20 RPD) → gemini-2.5-flash-lite (500 RPD)
 * Tracks daily usage per model, auto-switches when quota exhausted
 */
export declare const AVAILABLE_MODELS: readonly [{
    readonly id: "gemini-2.5-flash";
    readonly name: "Gemini 2.5 Flash";
    readonly rpm: 5;
    readonly rpd: 20;
    readonly tpm: 250000;
    readonly description: "Mạnh nhất, suy luận tốt (mặc định)";
}, {
    readonly id: "gemini-2.5-flash-lite";
    readonly name: "Gemini 2.5 Flash Lite";
    readonly rpm: 15;
    readonly rpd: 500;
    readonly tpm: 250000;
    readonly description: "Nhanh, 500 req/ngày (auto-fallback)";
}];
interface VideoMeta {
    startOffset?: string;
    endOffset?: string;
    fps?: number;
}
interface GenerateOptions {
    prompt: string;
    model?: string;
    base64Images?: string[];
    fileUri?: string;
    videoMetadata?: VideoMeta;
    responseJsonSchema?: Record<string, unknown>;
    systemInstruction?: string;
    maxTokens?: number;
}
interface GenerateResult {
    success: boolean;
    text?: string;
    model?: string;
    error?: string;
}
declare class GeminiApiService {
    private client;
    private apiKey;
    private dailyUsage;
    private getClient;
    /**
     * Get today's date string for usage tracking
     */
    private getToday;
    /**
     * Load daily usage from database
     */
    private loadDailyUsage;
    /**
     * Save daily usage to database
     */
    private saveDailyUsage;
    /**
     * Record a request for a model
     */
    private recordUsage;
    /**
     * Get the best available model based on daily usage
     * Returns DEFAULT_MODEL if under quota, FALLBACK_MODEL if exhausted
     */
    private pickModel;
    /**
     * Get current usage stats
     */
    getUsageStats(): Promise<{
        date: string;
        models: Array<{
            id: string;
            name: string;
            used: number;
            limit: number;
        }>;
    }>;
    getApiKey(): Promise<string | null>;
    saveApiKey(apiKey: string): Promise<void>;
    validateApiKey(apiKey: string): Promise<{
        valid: boolean;
        error?: string;
    }>;
    /**
     * Generate content — auto-picks model and falls back on 429
     */
    generate(options: GenerateOptions): Promise<GenerateResult>;
    /**
     * Generate content with streaming — auto-picks model and falls back on 429
     */
    generateStream(options: GenerateOptions, onChunk: (text: string) => void): Promise<GenerateResult>;
}
export declare const geminiApiService: GeminiApiService;
export {};
//# sourceMappingURL=geminiApi.service.d.ts.map