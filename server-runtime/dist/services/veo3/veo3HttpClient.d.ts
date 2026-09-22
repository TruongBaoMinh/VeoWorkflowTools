/**
 * Single dispatch point for every outbound request to labs.google /
 * aisandbox-pa.googleapis.com from Veo3Service.
 *
 * All requests go through `tlsFetch` (chrome_131_PSK JA3 + HTTP/2) so the
 * JA3/JA4 fingerprint matches real Chrome — required because Google
 * reCAPTCHA Enterprise scoring penalises Node `undici`'s default
 * fingerprint.
 */
export interface GoogleFetchOptions {
    profileId: string;
    veo3ProjectId?: string;
    locale?: string;
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    timeoutMs?: number;
    /** Default true. Set false to read a 3xx `Location` header (e.g. media URL redirect). */
    followRedirects?: boolean;
}
export interface GoogleFetchResult {
    ok: boolean;
    status: number;
    statusText: string;
    body: string;
    headers: Record<string, string>;
    durationMs?: number;
    text(): Promise<string>;
    json(): Promise<any>;
}
/**
 * Drop-in for `fetch()` that routes ALL Google requests through the
 * TLS-impersonated Node lane. Returns a shape compatible with the legacy
 * browserFetch callers so veo3Service can stay agnostic of the transport.
 *
 * Auth model: `Authorization: Bearer ya29...` on cross-origin
 * `aisandbox-pa.googleapis.com` (cookies stripped to match real Chrome's
 * SameSite=Lax behaviour). labs.google calls send the profile's cookie jar.
 *
 * reCAPTCHA mint context match: sec-ch-ua + sec-ch-ua-platform are derived
 * from the caller's User-Agent (which mirrors the profile UA used to mint
 * the captcha token in the user's Chrome extension). A mismatch between
 * mint context and submit context scores the submit as bot → 403
 * PUBLIC_ERROR_UNUSUAL_ACTIVITY.
 */
export declare function googleFetch(opts: GoogleFetchOptions): Promise<GoogleFetchResult>;
//# sourceMappingURL=veo3HttpClient.d.ts.map