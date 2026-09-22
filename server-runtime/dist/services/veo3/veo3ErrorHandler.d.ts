/**
 * Veo3 Error Handler
 * Parses Veo3 API error responses and returns user-friendly error messages
 */
export interface Veo3ErrorResponse {
    error?: {
        code?: number;
        message?: string;
        status?: string;
        details?: Array<{
            '@type'?: string;
            reason?: string;
            [key: string]: any;
        }>;
    };
}
/**
 * Extract a compact log shape from a thrown Veo3 error: `{ code, status, reason }`.
 * Designed to keep noisy reCAPTCHA 403 dumps short — callers should prefer
 * this over passing the raw error object to `logger.error(...)`, which would
 * serialize the full response headers, body, and stack trace.
 */
export declare function briefVeo3Error(error: unknown): {
    code?: number;
    status?: string;
    reason?: string;
};
/**
 * Parse error response from Veo3 API and return user-friendly message
 */
export declare function parseVeo3Error(errorText: string | null | undefined, defaultMessage?: string): string;
/**
 * Extract error reason from Veo3 error response
 */
export declare function getVeo3ErrorReason(errorText: string | null | undefined): string | null;
/**
 * Check if error is a content policy violation
 */
export declare function isContentPolicyError(errorText: string | null | undefined): boolean;
/**
 * Check if error is "generation already in progress" (409 ALREADY_EXISTS)
 * This happens when server restarts and tries to re-submit a job that's still running
 * Should NOT retry - just wait for status polling to pick up the result
 */
export declare function isAlreadyInProgressError(errorText: string | null | undefined): boolean;
/**
 * Check if error is reCAPTCHA evaluation failure
 * These are different from auth errors - they mean reCAPTCHA token was rejected by Google
 * Usually retryable with longer delay
 */
export declare function isRecaptchaEvaluationFailure(errorText: string | null | undefined): boolean;
/**
 * Check if error is retryable (rate limit, reCAPTCHA, 429, 403)
 * Default: NOT retryable - only retry if clear rate limit/reCAPTCHA signals
 * This prevents infinite retry loops for generic generation failures
 */
export declare function isRetryableError(errorText: string | null | undefined): boolean;
/**
 * Check if error should DEFINITELY NOT be retried (content policy violations, etc.)
 */
export declare function isNonRetryableError(errorText: string | null | undefined): boolean;
/**
 * Get user-friendly error message for failed job
 * Returns Vietnamese message that explains the error and suggests action
 */
export declare function getFailedJobDisplayMessage(errorText: string | null | undefined): string;
//# sourceMappingURL=veo3ErrorHandler.d.ts.map