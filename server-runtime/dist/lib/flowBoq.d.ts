/**
 * Flow (flow.google.com) BOQ `batchexecute` transport.
 *
 * Google retired parts of the labs.google tRPC API in Sept 2026 — `project.createProject`,
 * `videoFx.getVideoModelConfig` and `flow.projectInitialData` now answer 404
 * "Flow RPCs have been deprecated and disabled". The web app moved to the BOQ RPC
 * transport on flow.google.com, which differs in two ways that matter here:
 *
 *   - Wire format: form-encoded `f.req` carrying JSON-inside-JSON, and a response
 *     made of length-prefixed chunks behind an XSSI prefix.
 *   - Auth: plain Google web cookies (the OSID family) plus an XSRF token read from
 *     the page — no ya29 Bearer. The aisandbox-pa video API still uses the Bearer,
 *     so both lanes coexist.
 *
 * The per-session values (`at`, `bl`, `f.sid`) come from `WIZ_global_data` embedded in
 * the flow.google.com HTML, so a bootstrap fetch precedes the first RPC of each session.
 */
/**
 * Flow BOQ methods this app uses. Each id was captured from the live web client;
 * keep new ones here so there is one list to check when Google renames a method.
 * See docs/flow-api-migration.md for how to capture a new id.
 */
export declare const FLOW_RPC: {
    /** Create a project → `["<uuid>", ["<name>"]]` */
    readonly createProject: "jHPbke";
    /** Credits / quota → `[credits, tier, serviceTier, sku, null, subscriptionCredits]` */
    readonly credits: "nzlxg";
    /** Project data incl. the preset voice catalogue → payload[3] is the voice list */
    readonly projectData: "Zzl0ze";
    /** Video model catalogue (replaces videoFx.getVideoModelConfig) */
    readonly videoModelConfig: "HTrJv";
};
/** Flow answered with its logged-out shell — cookies cannot be repaired by retrying. */
export declare class FlowSignedOutError extends Error {
    readonly code = "FLOW_SIGNED_OUT";
    constructor(detail: string);
}
/** The RPC reached Flow but came back without a usable payload. */
export declare class FlowRpcError extends Error {
    readonly code = "FLOW_RPC_ERROR";
    readonly rpcid: string;
    readonly status: number | undefined;
    constructor(rpcid: string, message: string, status?: number);
}
interface FlowBoqSession {
    xsrfToken: string;
    buildLabel: string;
    sessionId: string;
    email: string | null;
    fetchedAt: number;
}
/**
 * Drop the cached bootstrap so the next call re-reads `at`/`bl`/`f.sid`, and the
 * cookie jar with it — a rejected request would otherwise be retried with the
 * very cookies it was just refused for. Scoped to `used` so a slow caller cannot
 * discard a session another call bootstrapped in the meantime.
 */
export declare function invalidateFlowSession(profileId: string, used?: FlowBoqSession): void;
/**
 * Pull the payload for `rpcid` out of a batchexecute response.
 *
 * Shape: an XSSI prefix, then repeating `<byteLength>\n<json chunk>`. The chunk
 * holding the answer is `["wrb.fr", rpcid, "<json string>", …]`; `["er", …]` carries
 * an RPC error. The trailing `["e", 4, …]` row is a normal end-of-stream marker and
 * must NOT be read as a failure.
 *
 * Chunk lengths count BYTES while JS slices UTF-16 units, and real payloads contain
 * multibyte text, so chunks are reassembled by parsing rather than by offset.
 */
export declare function parseBatchExecute(body: string, rpcid: string): unknown;
/**
 * Call one Flow BOQ RPC and return its decoded payload.
 *
 * A rejected or stale session is retried exactly once against a fresh bootstrap;
 * a second failure is surfaced so callers do not spin.
 */
export declare function callFlowRpc(profileId: string, rpcid: string, args: unknown, opts?: {
    userAgent?: string;
    sourcePath?: string;
}): Promise<unknown>;
export {};
//# sourceMappingURL=flowBoq.d.ts.map