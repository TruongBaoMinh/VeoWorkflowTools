import { z } from 'zod';
export declare const directoriesSchema: z.ZodObject<{
    downloadsDir: z.ZodDefault<z.ZodString>;
    tempDir: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const defaultsSchema: z.ZodObject<{
    maxConcurrency: z.ZodDefault<z.ZodNumber>;
    autoStartQueue: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const appConfigSchema: z.ZodObject<{
    directories: z.ZodObject<{
        downloadsDir: z.ZodDefault<z.ZodString>;
        tempDir: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>;
    defaults: z.ZodObject<{
        maxConcurrency: z.ZodDefault<z.ZodNumber>;
        autoStartQueue: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type AppConfig = z.infer<typeof appConfigSchema>;
export declare const configService: {
    getConfig(): Promise<AppConfig>;
    updateConfig(input: Partial<AppConfig>): Promise<AppConfig>;
};
//# sourceMappingURL=config.service.d.ts.map