/**
 * Custom error classes for application-level errors
 */
export declare class AppError extends Error {
    statusCode: number;
    code?: string;
    details?: any;
    constructor(message: string, statusCode?: number, code?: string, details?: any);
    toJSON(): {
        error: string;
        message: string;
        code: string;
        details: any;
        statusCode: number;
    };
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: any);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string, identifier?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class BadRequestError extends AppError {
    constructor(message: string, details?: any);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string);
}
export declare class CaptchaError extends AppError {
    readonly retryable: boolean;
    constructor(message: string, options?: {
        statusCode?: number;
        code?: string;
        retryable?: boolean;
        details?: any;
    });
}
//# sourceMappingURL=errors.d.ts.map