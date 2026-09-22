/**
 * Profile Cookies Helper
 *
 * Cookies are stored in Electron's persist: partition (not the DB). Server
 * accesses the partition via the IPC Bridge (HTTP server in Electron main
 * process). Auth runs off `accessToken`, refreshed by `cookieTokenService`
 * (tlsClient → labs.google /api/auth/session) when expired.
 */
/**
 * Get cookies for a profile
 *
 * SERVER: Calls Electron IPC Bridge to get cookies from partition
 *
 * @param profileId - Profile ID
 * @returns Cookie string from partition, or empty string if failed
 */
export declare function getProfileCookies(profileId: string): Promise<string>;
/**
 * Check if profile has cookies
 *
 * SERVER: Checks via IPC Bridge
 *
 * @param profileId - Profile ID
 * @returns true if profile has cookies in partition
 */
export declare function hasProfileCookies(profileId: string): Promise<boolean>;
/**
 * Get profile cookies with backward compatibility
 * Drop-in replacement for old `if (profile.cookies)` pattern
 *
 * Replaces old pattern: if (profile.cookies) { ... JSON.parse(profile.cookies) ... }
 * New pattern: const { cookies, hasCookies, parsed } = await getProfileCookiesCompat(profile);
 *
 * SERVER: Gets cookies from partition via IPC Bridge
 *
 * Example OLD code:
 * ```
 * if (profile.cookies && profile.cookies.trim() !== '') {
 *   const parsed = JSON.parse(profile.cookies);
 *   const cookiesString = profile.cookies;
 * }
 * ```
 *
 * Example NEW code:
 * ```
 * const { cookies, hasCookies, parsed } = await getProfileCookiesCompat(profile);
 * if (hasCookies) {
 *   // Use parsed or cookies
 * }
 * ```
 *
 * @param profile - Profile object with id
 * @returns Object with cookies, hasCookies flag, and parsed array
 */
export declare function getProfileCookiesCompat(profile: {
    id: string;
}): Promise<{
    cookies: string;
    hasCookies: boolean;
    parsed: any[] | null;
}>;
//# sourceMappingURL=profileCookies.d.ts.map