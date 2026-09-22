/**
 * Per-profile, URL-scoped cookie cache for tlsFetch.
 *
 * Chrome owns cookie truth (user logs in there, Chrome rotates session tokens
 * frequently). We pull via CDP `Network.getAllCookies` (IPC endpoint
 * `/profile/:id/chrome-cookies`) once per `SYNC_INTERVAL_MS` and cache the
 * full cookie list. Each `getCookieHeader(profileId, url)` call rebuilds a
 * minimal `Cookie:` header containing ONLY:
 *
 *   1. Cookies in the strict allow-list below (auth essentials)
 *   2. Whose `domain` attribute matches the request URL host
 *
 * Why so strict: Google's tRPC + aisandbox-pa endpoints reject requests with
 * a Cookie header > ~4KB (HTTP 431 "Request Header Fields Too Large"). The
 * profile's Chrome may have 50-100+ cookies across google.com / accounts /
 * youtube / labs / etc. — sending all of them blows past the limit and is
 * also useless (most are analytics / preference cookies that the API server
 * ignores).
 *
 * If anything else turns out to be required, add it explicitly to
 * `ESSENTIAL_COOKIE_NAMES` — no wildcard `__Secure-` matching to avoid
 * accidentally pulling in YouTube / Maps / Calendar session cookies.
 */
/**
 * Minimal cookie set required by Flow + aisandbox-pa.
 *
 * Two account types must be supported:
 *
 *   1. Consumer (@gmail.com) — full 1P + 3P SID cookie tree, advanced
 *      session trust cookies (`__Secure-1PSIDTS`, `__Secure-3PSIDTS`).
 *
 *   2. Workspace (user@company.com) — issued through the Workspace SSO flow
 *      (`accounts.google.com/o/oauth2/...`). Workspace sessions ship a
 *      different cookie set:
 *        - `LSID`, `LSOSID`, `OSID`, `__Secure-OSID` — Workspace SSO state
 *        - `S` — session continuation token
 *        - `SIDCC` — SID continuation cookie (Workspace variant)
 *        - `OGPC`, `OGP` — One Google Pass (Workspace cross-app session)
 *        - `ACCOUNT_CHOOSER` — multi-account selector state
 *      Without these in the allow-list, Workspace requests to labs.google
 *      TRPC + auth/session endpoints lack the canonical session state and
 *      Google's NextAuth returns `{}` (logged-out shape).
 *
 *   3. Tracking / continuity (sent by both):
 *        - `NID`, `1P_JAR`, `3P_JAR`, `AEC`, `__Secure-ENID`, `CONSENT`
 *        - `SOCS` (privacy choices), `__Secure-OSID`
 *
 *   4. next-auth session (labs.google only):
 *        - `__Secure-next-auth.session-token`
 *        - `__Secure-next-auth.callback-url`
 *        - `__Host-next-auth.csrf-token`
 *
 * If anything else turns out to be required, add it explicitly here — no
 * wildcard `__Secure-*` matching (that would accidentally pull in
 * YouTube / Maps / Calendar session cookies and overflow the 4KB header).
 */
export declare const ESSENTIAL_COOKIE_NAMES: ReadonlySet<string>;
/**
 * Returns a `Cookie:` header string for the given profile + request URL.
 * The header is built fresh per call but the underlying cookie list is
 * cached per profile for `SYNC_INTERVAL_MS`.
 */
export declare function getCookieHeader(profileId: string, url: string): Promise<string>;
/** Force a refresh on next call. */
export declare function invalidateCookieJar(profileId: string): void;
//# sourceMappingURL=cookieJar.d.ts.map