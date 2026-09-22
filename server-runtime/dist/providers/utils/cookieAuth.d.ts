/**
 * Thin re-exports of cookieTokenService methods used by profile routes +
 * genNormalQueueManager. Kept here to avoid churn at the call sites.
 */
export declare function refreshAccessTokenFromCookies(cookiesString: string, profileId?: string): Promise<{
    accessToken: string;
    expiresAt?: Date;
}>;
export declare function validateCookiesWithApi(cookiesString: string): Promise<boolean>;
//# sourceMappingURL=cookieAuth.d.ts.map