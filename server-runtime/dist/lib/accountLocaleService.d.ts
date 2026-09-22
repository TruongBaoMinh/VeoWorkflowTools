export declare class AccountLocaleService {
    private cache;
    private readonly CACHE_TTL_MS;
    private readonly DETECT_TIMEOUT_MS;
    /**
     * Detect Flow AI locale của account qua redirect.
     * Returns cached value nếu còn fresh, otherwise fetch mới.
     */
    getAccountLocale(profileId: string, cookieHeader: string, userAgent?: string, fallback?: string): Promise<string>;
    /**
     * Trả về locale đã cache cho profile (không fetch lại). Trả undefined nếu chưa cache.
     * Dùng khi caller không có cookies trong tay nhưng cần locale (vd. reset + prewarm path).
     */
    getCachedLocale(profileId: string): string | undefined;
    /**
     * Force refresh locale cho 1 profile (vd. sau khi cookies đổi).
     */
    clearCache(profileId?: string): void;
    /**
     * Core detect: fetch flow homepage không locale → đọc Location header.
     *
     * Google thường redirect 302/301 với:
     *   Location: https://labs.google/fx/{locale}/tools/flow
     *
     * Trường hợp không redirect (200 trực tiếp) → không detect được, return null.
     */
    private detectViaRedirect;
    /** Fetch một trang (follow redirect) rồi đọc `<html lang="...">`. */
    private detectLocaleFromPage;
    /** Đọc locale từ thuộc tính `lang` của thẻ `<html>`. */
    private parseLangFromHtml;
    /**
     * Parse `/fx/{locale}/tools/flow...` từ URL.
     * Chấp nhận cả absolute và relative location.
     */
    private extractLocaleFromUrl;
    private normalizeLocale;
}
export declare const accountLocaleService: AccountLocaleService;
//# sourceMappingURL=accountLocaleService.d.ts.map