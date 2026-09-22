import { z } from 'zod';
export declare const apiKeySchema: z.ZodObject<{
    name: z.ZodString;
    key: z.ZodString;
    profileId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type ApiKeyPayload = z.infer<typeof apiKeySchema>;
export declare const apiKeyService: {
    /**
     * List all API keys
     */
    list: () => Promise<ApiKey[]>;
    /**
     * Get API key by ID
     */
    getById: (id: string) => Promise<any>;
    /**
     * Get active API key
     */
    getActive: () => Promise<any>;
    /**
     * Create new API key
     */
    create: (payload: ApiKeyPayload) => Promise<any>;
    /**
     * Update API key
     */
    update: (id: string, payload: Partial<ApiKeyPayload>) => Promise<any>;
    /**
     * Delete API key
     */
    delete: (id: string) => Promise<any>;
    /**
     * Activate API key (deactivate all others)
     */
    activate: (id: string) => Promise<any>;
    /**
     * Test API key validity
     */
    test: (key: string) => Promise<{
        valid: boolean;
        message: string;
        model?: string;
    }>;
    /**
     * Get keys by profile ID
     */
    getByProfileId: (profileId: string) => Promise<ApiKey[]>;
    /**
     * Increment usage count
     */
    incrementUsage: (id: string) => Promise<void>;
};
//# sourceMappingURL=apiKey.service.d.ts.map