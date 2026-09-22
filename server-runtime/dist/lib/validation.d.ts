import { z } from 'zod';
import { ValidationError } from './errors.js';
/**
 * Validation helpers for Zod schemas
 */
export declare function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T;
export declare function validateDataSafe<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: true;
    data: T;
} | {
    success: false;
    error: ValidationError;
};
/**
 * Common validation schemas
 */
export declare const commonSchemas: {
    id: z.ZodString;
    pagination: z.ZodObject<{
        skip: z.ZodOptional<z.ZodNumber>;
        take: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    dateRange: z.ZodObject<{
        fromDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
        toDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    }, z.core.$strip>;
};
//# sourceMappingURL=validation.d.ts.map