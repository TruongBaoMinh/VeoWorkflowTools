import { z } from 'zod';
export declare const profileSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    cookies: z.ZodOptional<z.ZodString>;
    accessToken: z.ZodOptional<z.ZodString>;
    accessTokenExpires: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    maxConcurrency: z.ZodDefault<z.ZodNumber>;
    maxConcurrentVeo3Jobs: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    dailyQuota: z.ZodOptional<z.ZodNumber>;
    active: z.ZodDefault<z.ZodBoolean>;
    proxyConfig: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type ProfilePayload = z.infer<typeof profileSchema>;
export declare const profileService: {
    list: () => Promise<any[]>;
    getById: (id: string) => Promise<any>;
    create: (payload: ProfilePayload) => Promise<any>;
    update: (id: string, payload: Partial<ProfilePayload>) => Promise<any>;
    delete: (id: string) => Promise<void>;
    getProxyConfig: (id: string) => Promise<string>;
    /**
     * Get proxy config OBJECT (proxyHost/Port/Username/Password) for use with
     * Veo3Service / HttpsProxyAgent. Returns null if profile has no proxy.
     * Unlike getProxyConfig (which returns a string), this returns the shape
     * expected by buildProxyUrl() so the agent can be constructed.
     */
    getProxyConfigObject: (id: string) => Promise<{
        proxyHost: string;
        proxyPort: number;
        proxyUsername: string | null;
        proxyPassword: string | null;
    } | null>;
    /**
     * Clone a profile N times. Each clone gets a fresh DB row with a new cuid()
     * (→ unique fingerprint via getProfileFingerprint), then source cookies are
     * imported into the new Electron partition so the clone shares the source's
     * Google login session without sharing the partition.
     *
     * Stagger 800-1400ms between creates to avoid bulk-pattern signal at Google.
     * Caller-side cap is 1-10; recommended sweet spot is 2-4 per Google account.
     */
    cloneProfile: (sourceId: string, count: number, opts?: {
        namePrefix?: string;
    }) => Promise<any[]>;
};
//# sourceMappingURL=profile.service.d.ts.map