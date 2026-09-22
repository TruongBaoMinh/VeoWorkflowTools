/**
 * Single source of truth for reading the Flow NextAuth session cookie out of a
 * profile partition.
 *
 * A partition can hold SEVERAL copies of `__Secure-next-auth.session-token`:
 * older app builds imported the cookie host-only (`labs.google`), newer ones
 * domain-scoped (`.labs.google`), and `cookies.set()` only overwrites when
 * name+domain+path all match — so both survive with different expiries.
 * `session.cookies.get({})` gives no ordering guarantee, so returning the first
 * match could report a long-dead copy while a live one sat right next to it:
 * that is what made the Profiles tab flash a red "Hết hạn" pill straight after
 * a successful login. The only safe read is "the copy that expires last".
 */
export declare const SESSION_COOKIE = "__Secure-next-auth.session-token";
/** Hosts that carry the NextAuth session cookie (Google moved Flow in 2026-09). */
export declare const SESSION_DOMAINS: readonly string[];
export interface SessionCookieRead {
    /** Latest expiry across every matching cookie; null when none carries one. */
    expiry: Date | null;
    /** At least one matching session cookie exists in the partition. */
    found: boolean;
    /** Cookie present but session-scoped (no expirationDate) — alive, expiry unknown. */
    sessionScopedOnly: boolean;
    /** Number of matching cookies; >1 means the partition carries duplicates. */
    candidates: number;
}
/** Host-only (`labs.google`) or domain-scoped (`.labs.google`) — nothing else. */
export declare function isSessionCookieDomain(domain: string): boolean;
export declare function readSessionCookie(parsed: unknown[] | null): SessionCookieRead;
/** True when the partition carries a usable labs/flow NextAuth session cookie. */
export declare function hasSessionCookie(parsed: unknown[] | null): boolean;
//# sourceMappingURL=sessionCookie.d.ts.map