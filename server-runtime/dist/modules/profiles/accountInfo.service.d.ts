import type { CreditsResponse } from '../../services/veo3/veo3Types.js';
export type DisplayTier = 'ultra' | 'pro' | 'free';
export interface ProfileAccountInfo {
    profileId: string;
    tier: DisplayTier | null;
    credits: number | null;
    subscriptionCredits: number | null;
    /** Expiry of the labs.google session cookie. ISO-8601 or null */
    sessionExpiresAt: string | null;
    /** Expiry of the ya29 access token (JWT). ISO-8601 or null */
    accessTokenExpires: string | null;
    /** ISO-8601 or null */
    creditsUpdatedAt: string | null;
    errorCode: 'NO_COOKIES' | 'UNAUTHORIZED' | 'QUOTA_EXCEEDED' | 'NETWORK' | null;
    error: string | null;
    /** Session cookie present but session-scoped: alive, expiry unknown (not expired). */
    sessionScopedOnly: boolean;
}
export declare function resolveDisplayTier(r: CreditsResponse): DisplayTier;
/**
 * Refresh tier / credits / session expiry for one profile.
 * Never throws — every failure surfaces via errorCode while keeping the
 * last-known cached values so the UI can degrade gracefully.
 */
export declare function refreshProfileAccountInfo(profileId: string, opts?: {
    force?: boolean;
}): Promise<ProfileAccountInfo>;
/**
 * Refresh many profiles (all active ones when profileIds is omitted) with a
 * 3-wide semaphore and an initial stagger so Google never sees a burst.
 */
export declare function refreshManyProfileAccountInfo(profileIds?: string[], force?: boolean): Promise<ProfileAccountInfo[]>;
//# sourceMappingURL=accountInfo.service.d.ts.map