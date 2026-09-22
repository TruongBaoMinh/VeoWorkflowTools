/**
 * Boot breadcrumb: update boot-status.json AND append a line SYNCHRONOUSLY to
 * app.log. winston's File transport is buffered, so lines emitted right before
 * an event-loop-blocking hang (and the subsequent kill) never reach disk — that
 * is why failing runs show no "Server listening"/no error. A synchronous append
 * survives, so the LAST `[boot-trace]` line in app.log is exactly the step that
 * blocked. Use for the Fastify ready-phase plugin trace.
 */
export declare function traceBoot(phase: string): void;
export declare function writeBootStatus(phase: string, error?: string): void;
//# sourceMappingURL=bootStatus.d.ts.map