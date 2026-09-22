export interface StyleConfig {
    id: string;
    name: string;
    namePreamble: string;
    preamble: string;
}
/**
 * Style configuration service
 * Cung cấp preambles chuyên nghiệp cho từng style để hướng dẫn Gemini tạo prompts phù hợp
 * Preambles này sau đó sẽ được dùng cả cho Gemini generation và Veo3 expansion
 */
export declare class StyleConfigService {
    private static readonly STYLES;
    /**
     * Lấy tất cả styles có sẵn
     */
    static getAllStyles(): StyleConfig[];
    /**
     * Lấy style config theo ID
     */
    static getStyleById(styleId: string): StyleConfig | null;
    /**
     * Lấy preamble cho một style cụ thể
     */
    static getPreambleByStyleId(styleId: string): string;
    /**
     * Validate style ID
     */
    static isValidStyle(styleId: string): boolean;
}
export default StyleConfigService;
//# sourceMappingURL=styleConfig.service.d.ts.map