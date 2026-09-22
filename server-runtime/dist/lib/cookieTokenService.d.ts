/**
 * The profile's Flow session still exists, but the OAuth grant inside it has
 * expired and cannot be refreshed — the profile must sign in again to mint a
 * new one. Distinct from "no cookies" and from a transient network failure so
 * callers can drive the re-mint instead of asking the user to fix cookies.
 */
export declare class FlowSessionRemintRequiredError extends Error {
    readonly code = "FLOW_SESSION_REMINT_REQUIRED";
    readonly grantExpiredAt: string | undefined;
    constructor(grantExpiredAt?: string, upstreamError?: string);
}
export declare class CookieTokenService {
    private tokenCache;
    private readonly TOKEN_TTL_MS;
    /**
     * Get access token from cookies by calling Google's /api/auth/session
     * @param cookiesString - Cookie header string (e.g., "name1=value1; name2=value2")
     * @param profileId - Optional profile ID for caching
     * @returns Access token string
     */
    generateSecChUaHeaders(userAgent: string): Record<string, string>;
    getAccessTokenFromCookies(cookiesString: string, profileId?: string, userAgent?: string): Promise<{
        accessToken: string;
        expiresAt?: Date;
    }>;
    /**
     * Get cached token for a profile
     * @param profileId - Profile ID
     * @returns Cached token or null if not found/expired
     */
    getCachedToken(profileId: string): {
        accessToken: string;
        expiresAt: Date;
    } | null;
    /**
     * Check if token is expired or will expire soon (within 5 minutes)
     * @param expiresAt - Expiry date
     * @returns True if token needs refresh
     */
    needsRefresh(expiresAt: Date): boolean;
    /**
     * Clear token cache for a profile
     * @param profileId - Profile ID (optional, clears all if not provided)
     */
    clearCache(profileId?: string): void;
    /**
     * Validate cookies by attempting to get access token
     * @param cookiesString - Cookie header string
     * @returns True if cookies are valid and can get access token
     */
    validateCookies(cookiesString: string): Promise<boolean>;
}
export declare const cookieTokenService: CookieTokenService;
//# sourceMappingURL=cookieTokenService.d.ts.map