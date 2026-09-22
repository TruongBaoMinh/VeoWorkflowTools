/**
 * TLS-impersonated HTTP client (Chrome 131 PSK profile).
 *
 * Wraps `node-tls-client` (bogdanfinn/tls-client Go binary). JA3 / JA4 / HTTP/2
 * frame ordering match real Chrome — required because Google reCAPTCHA
 * Enterprise scoring penalises Node `undici`'s default JA3 fingerprint with
 * 403 PUBLIC_ERROR_UNUSUAL_ACTIVITY even when the captcha token itself is high
 * score.
 *
 * Verified JA3 hash on this build (tls.peet.ws):
 *   a19ab9f02aacf42deddc1f2acb3d3f63
 *   JA4: t13d1516h2_8daaf6152771_02713d6af862
 *   HTTP/2 (ALPN h2)
 */
/**
 * Warm-up node-tls-client at app startup so the ~10MB shared library is
 * downloaded + `initTLS()` runs in the background BEFORE the first real TLS
 * request. Fire-and-forget: never blocks boot, never throws (lazy init still
 * covers it if this fails). Idempotent — reuses the same init promise.
 */
export declare function warmUpTlsClient(): void;
export interface TlsFetchOptions {
    profileId: string;
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    cookies?: string;
    proxyUrl?: string;
    timeoutMs?: number;
    /** Default true. Set false to capture a 3xx `Location` header (redirect URLs). */
    followRedirects?: boolean;
}
export interface TlsFetchResult {
    ok: boolean;
    status: number;
    statusText: string;
    body: string;
    headers: Record<string, string>;
    setCookies: string[];
    /** Round-trip duration in ms for telemetry. */
    durationMs: number;
}
/**
 * Single-shot TLS-impersonated request. Cookies must be supplied by the caller
 * (we do not rely on the session's internal jar because Chrome owns the truth
 * — see `cookieJar.ts` for the sync layer).
 */
export declare function tlsFetch(opts: TlsFetchOptions): Promise<TlsFetchResult>;
/**
 * Dispose the TLS session for a profile. Call when the profile is removed,
 * Chrome is torn down, OR after a 403/timeout cascade so the next request
 * opens a fresh HTTP/2 connection (Google may RST_STREAM the existing one
 * after a streak of PUBLIC_ERROR_UNUSUAL_ACTIVITY, leaving subsequent
 * requests on the same connection wedged for the full timeout).
 */
export declare function disposeTlsSession(profileId: string): Promise<void>;
/**
 * Fire-and-forget session recycle — used by `googleFetch` when it sees a 403
 * or a connection-error timeout. Returns immediately; the actual close is
 * scheduled on the next tick so it does not block the current response path.
 */
export declare function recycleTlsSession(profileId: string, reason: string): void;
/**
 * Tear down everything — called at process exit so the Go shared library frees
 * its goroutines / native handles.
 */
export declare function shutdownTlsClient(): Promise<void>;
//# sourceMappingURL=tlsClient.d.ts.map