/**
 * Flow Telemetry Buffer
 *
 * Real Flow batches `:batchLog` and `/flow:batchLogFrontendEvents` events
 * across many gens and flushes them PERIODICALLY in single accumulated POSTs
 * (verified via captures/flowai-lifecycle-*.json — one POST contained 12+
 * FLOW_IMAGE_LATENCY events). The previous tool implementation fired 4 POSTs
 * per gen (2× pre + 2× post), producing a per-gen telemetry signature Google's
 * reCAPTCHA Enterprise scoring system flags as bot behaviour.
 *
 * Symptoms before this fix:
 *   - 1 successful gen, then PUBLIC_ERROR_UNUSUAL_ACTIVITY 403 on every
 *     subsequent gen
 *   - Per-gen pattern: log → log → gen → log → log → log → log
 *   - Real Flow pattern: gen → /clr  +  one accumulated batchLog every N gens
 *
 * This buffer:
 *   1. Receives appEvents / frontendEvents per gen (push, no immediate fetch)
 *   2. Schedules a flush after FLUSH_DELAY_MS (default 6s) — coalesces back-
 *      to-back gens into a single POST
 *   3. Force-flushes when buffered events exceed FLUSH_MAX_EVENTS
 *   4. Exposes flushNow(profileId) for shutdown / browser reset
 */
type AppEvent = Record<string, unknown>;
type FrontendEvent = Record<string, unknown>;
/**
 * Push events to the buffer. Schedules a flush if not already pending.
 *
 * @param appEvents      Events for `${baseUrl}:batchLog` (appEvents array)
 * @param frontendEvents Events for `${baseUrl}/flow:batchLogFrontendEvents` (events array)
 */
export declare function pushFlowTelemetry(params: {
    profileId: string;
    baseUrl: string;
    headers: Record<string, string>;
    veo3ProjectId?: string;
    locale?: string;
    appEvents?: AppEvent[];
    frontendEvents?: FrontendEvent[];
}): void;
/**
 * Flush pending events for a profile right now (idempotent / safe to call
 * with empty buffers). Honours MIN_FLUSH_SPACING_MS to avoid burst patterns
 * but never blocks longer than that.
 */
export declare function flushNow(profileId: string): Promise<void>;
export {};
//# sourceMappingURL=flowTelemetryBuffer.d.ts.map