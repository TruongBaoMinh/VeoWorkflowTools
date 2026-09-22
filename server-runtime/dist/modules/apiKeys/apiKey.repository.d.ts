export declare const apiKeyRepository: {
    /**
     * List all API keys
     */
    list: () => Promise<ApiKey[]>;
    /**
     * Get API key by ID
     */
    getById: (id: string) => Promise<ApiKey | null>;
    /**
     * Get active API key
     */
    getActive: () => Promise<ApiKey | null>;
    /**
     * Create API key
     */
    create: (data: any) => Promise<any>;
    /**
     * Update API key
     */
    update: (id: string, data: any) => Promise<any>;
    /**
     * Delete API key
     */
    delete: (id: string) => Promise<any>;
    /**
     * Set active API key (deactivate all others)
     */
    setActive: (id: string) => Promise<any>;
    /**
     * Increment usage count and update last used timestamp
     */
    incrementUsage: (id: string) => Promise<void>;
    /**
     * Get keys by profile ID
     */
    getByProfileId: (profileId: string) => Promise<ApiKey[]>;
};
//# sourceMappingURL=apiKey.repository.d.ts.map