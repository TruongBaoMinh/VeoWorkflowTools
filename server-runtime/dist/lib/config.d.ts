import { z } from 'zod';
/**
 * Application configuration schema with validation
 */
declare const configSchema: z.ZodObject<{
    MAX_CONCURRENT_JOBS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    GLOBAL_RATE_LIMIT_PER_MIN: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DEFAULT_TOKEN_CONCURRENCY: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    JOB_RETRY_ATTEMPTS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    JOB_TIMEOUT_MS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    JOB_POLL_INTERVAL_MS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    SCHEDULER_TICK_INTERVAL_MS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    SCHEDULER_AUTO_START: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
    LOGS_DIR: z.ZodDefault<z.ZodString>;
    DEFAULT_PROVIDER_ID: z.ZodDefault<z.ZodString>;
    MOCK_PROVIDER_ENABLED: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    HOST: z.ZodDefault<z.ZodString>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<{
        error: "error";
        info: "info";
        debug: "debug";
        warn: "warn";
    }>>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        production: "production";
        development: "development";
        test: "test";
    }>>;
    DATABASE_URL: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type AppConfig = z.infer<typeof configSchema>;
/**
 * Configuration manager
 * Loads config from environment variables and database
 */
declare class ConfigManager {
    private config;
    private dbConfig;
    private initialized;
    constructor();
    /**
     * Load configuration from database
     * DB values override env vars
     */
    init(): Promise<void>;
    /**
     * Get configuration value by key
     */
    get<K extends keyof AppConfig>(key: K): AppConfig[K];
    /**
     * Get all configuration
     */
    getAll(): AppConfig;
    /**
     * Update configuration value (in-memory and database)
     */
    set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): Promise<void>;
    /**
     * Update multiple configuration values
     */
    setMany(values: Partial<AppConfig>): Promise<void>;
    /**
     * Reload configuration from database
     */
    reload(): Promise<void>;
}
export declare const config: ConfigManager;
export {};
//# sourceMappingURL=config.d.ts.map