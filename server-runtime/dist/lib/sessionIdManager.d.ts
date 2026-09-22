/**
 * Per-(profile, veo3Project) sessionId manager.
 *
 * Google Flow API (`flowMedia:batchGenerateImages`, `video:batchAsyncGenerateVideoText`,
 * `flow/upsampleImage`...) nh\u1eadn field `clientContext.sessionId` format
 * `";{timestamp}"`. Real browser **gi\u1eef nguy\u00ean** sessionId xuy\u00ean su\u1ed1t browser session
 * tr\u00ean c\u00f9ng 1 tab/project. M\u1ed7i tab/project tr\u00ean labs.google c\u00f3 sessionId
 * ri\u00eang, nh\u01b0ng trong c\u00f9ng 1 tab/project th\u00ec sessionId \u1ed5n \u0111\u1ecbnh.
 *
 * Tr\u01b0\u1edbc \u0111\u00e2y code d\u00f9ng `;${Date.now()}` m\u1ed7i call \u2192 sessionId \u0111\u1ed5i m\u1ed7i request \u2192
 * Google coi m\u1ed7i job = 1 session m\u1edbi \u2192 suspicious \u2192 flag bot.
 *
 * Manager n\u00e0y key theo (profileId, veo3ProjectId):
 *  - Sinh sessionId 1 l\u1ea7n per c\u1eb7p, l\u01b0u in-memory
 *  - Reset khi browser force-recreate ho\u1eb7c TTL h\u1ebft (default 1 gi\u1edd \u2014 kh\u1edbp v\u1edbi
 *    recaptcha browser MAX_BATCHES_PER_BROWSER)
 *  - Reset c\u00f3 th\u1ec3 theo profile (tất c\u1ea3 project của profile) ho\u1eb7c theo c\u1eb7p
 */
declare class SessionIdManager {
    private sessions;
    private ttlMs;
    constructor(ttlMs?: number);
    private makeKey;
    /**
     * Get or create a sessionId for the given (profile, veo3Project).
     * C\u00f9ng c\u1eb7p tr\u1ea3 c\u00f9ng sessionId t\u1edbi khi TTL h\u1ebft ho\u1eb7c reset().
     * N\u1ebfu kh\u00f4ng truy\u1ec1n veo3ProjectId, fallback v\u1ec1 key "_default" per profile.
     */
    get(profileId: string, veo3ProjectId?: string | null): string;
    /**
     * Reset sessionId cho 1 c\u1eb7p (profile, project) c\u1ee5 th\u1ec3.
     */
    resetPair(profileId: string, veo3ProjectId?: string | null): void;
    /**
     * Reset t\u1ea5t c\u1ea3 sessionId thu\u1ed9c 1 profile (d\u00f9ng khi browser force-recreate \u2014
     * session entropy reset to\u00e0n b\u1ed9 profile bao g\u1ed3m m\u1ecdi project).
     */
    reset(profileId: string): void;
    /**
     * Clear all sessions (on app shutdown).
     */
    clear(): void;
}
export declare const sessionIdManager: SessionIdManager;
export {};
//# sourceMappingURL=sessionIdManager.d.ts.map