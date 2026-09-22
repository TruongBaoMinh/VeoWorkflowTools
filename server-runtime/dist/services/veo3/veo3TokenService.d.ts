export declare class Veo3TokenService {
    private tokenCache;
    private refreshInFlight;
    getAccessTokenFromProfile(profileId: string, forceRefresh?: boolean): Promise<string>;
    /** Background refresh if cache is empty or expires within 5 minutes. */
    refreshAccessTokenIfNeeded(profileId: string): Promise<string>;
    clearCache(profileId?: string): void;
    getCachedToken(profileId: string): string | null;
    getAccessTokenFromCookies(cookiesString: string, referer?: string, profileId?: string): Promise<string>;
    refreshTokenFromCookies(cookiesString: string, referer?: string, profileId?: string): Promise<{
        cookies: string;
        accessToken: string;
    }>;
    private callAuthSession;
    private performAuthSession;
    private handleCookieArrayResponse;
}
export declare const veo3TokenService: Veo3TokenService;
//# sourceMappingURL=veo3TokenService.d.ts.map