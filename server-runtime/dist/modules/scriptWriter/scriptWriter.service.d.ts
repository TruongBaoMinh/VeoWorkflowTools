/**
 * Script Writer Service
 * Uses Gemini AI for script rewriting, idea expansion, and scene segmentation
 */
declare class ScriptWriterService {
    /**
     * Expand a brief idea into a full screenplay
     */
    expandIdea(idea: string, options?: {
        targetMinutes?: number;
        style?: string;
    }): Promise<{
        screenplay: string;
        sceneCount: number;
    }>;
    /**
     * Rewrite/enhance an existing script
     */
    rewriteScript(script: string, options?: {
        style?: string;
    }): Promise<{
        originalScript: string;
        rewrittenScript: string;
    }>;
    /**
     * Segment a script/screenplay into timed scenes
     */
    segmentScript(script: string, options?: {
        targetDuration?: number;
    }): Promise<{
        segments: ScriptSegment[];
    }>;
}
export interface ScriptSegment {
    index: number;
    text: string;
    visualDescription: string;
    duration: number;
    narration?: string;
    start?: number;
    end?: number;
}
export declare const scriptWriterService: ScriptWriterService;
export {};
//# sourceMappingURL=scriptWriter.service.d.ts.map