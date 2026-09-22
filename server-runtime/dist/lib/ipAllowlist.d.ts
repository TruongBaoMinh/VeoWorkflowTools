/**
 * Tiny CIDR-aware IP allow-list check used by the captcha-bridge route guard.
 *
 * Supports:
 *   - Exact match (`127.0.0.1`, `::1`, `::ffff:127.0.0.1`)
 *   - IPv4 CIDR (`172.28.0.0/16`)
 *
 * IPv6 CIDR is not supported; list `::1` explicitly when needed.
 */
export declare function ipMatchesAllowlist(ip: string, allowlist: readonly string[]): boolean;
//# sourceMappingURL=ipAllowlist.d.ts.map