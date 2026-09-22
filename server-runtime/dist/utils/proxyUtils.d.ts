/**
 * Proxy Utils - Parse, validate, encrypt/decrypt proxy configurations
 *
 * Supported proxy formats:
 * 1. host:port:username:password (standard)
 * 2. username:password@host:port (URL-style)
 * 3. host:port (no auth)
 *
 * Example: proxy02058.proxydancu.org:19541:6gn4:1766985303
 * Example: r0s8:r0s8@171.236.42.237:37744
 */
/**
 * Load HttpsProxyAgent constructor, handling both ESM and CJS interop.
 * https-proxy-agent@7.x is ESM-only; when compiled to CJS, the module shape
 * can be `{ HttpsProxyAgent }`, `{ default: { HttpsProxyAgent } }`, or
 * `{ default: HttpsProxyAgent }` depending on bundler / tsconfig.
 */
export declare function loadHttpsProxyAgent(): Promise<new (url: string) => unknown>;
export interface ParsedProxy {
    host: string;
    port: number;
    username: string;
    password: string;
}
export interface ProxyConfig {
    proxyHost: string | null;
    proxyPort: number | null;
    proxyUsername: string | null;
    proxyPassword: string | null;
}
/**
 * Encrypt proxy password
 * NOTE: Now stores plain text for simplicity (local tool, no security concern)
 */
export declare function encryptPassword(password: string): string;
/**
 * Decrypt proxy password
 * NOTE: Now returns plain text directly (local tool, no security concern)
 */
export declare function decryptPassword(encryptedPassword: string): string;
/**
 * Parse proxy string into components
 * Supports multiple formats:
 * 1. host:port:username:password (standard - 4 colons)
 * 2. username:password@host:port (URL-style with @)
 * 3. host:port (no auth - 2 parts)
 *
 * Examples:
 * - 171.236.42.237:37744:r0s8:r0s8
 * - r0s8:r0s8@171.236.42.237:37744
 * - 171.236.42.237:37744
 */
export declare function parseProxyString(proxyString: string): ParsedProxy | null;
/**
 * Normalize proxy string to standard format: host:port:username:password
 * Accepts any supported format and converts to standard
 */
export declare function normalizeProxyString(proxyString: string): string | null;
/**
 * Build proxy string from components
 * Format: host:port:username:password
 */
export declare function buildProxyString(config: ProxyConfig): string | null;
/**
 * Validate proxy string format
 * Supports multiple formats:
 * 1. host:port:username:password
 * 2. username:password@host:port
 * 3. host:port (no auth)
 * Returns { valid: boolean, error?: string, normalized?: string }
 */
export declare function validateProxyFormat(proxyString: string): {
    valid: boolean;
    error?: string;
    normalized?: string;
};
/**
 * Build proxy URL for Electron session.setProxy()
 * Format: http://username:password@host:port
 */
export declare function buildProxyUrl(config: ProxyConfig): string | null;
/**
 * Resolve the effective proxy URL for server-side HTTP clients.
 *
 * Priority:
 *   1. Global rotating proxy (SOCKS5 preferred; HTTP variant as dispatcher-compat fallback)
 *   2. Profile's static proxy (legacy per-profile fallback)
 *
 * Returns HTTP proxy URL (http://host:port) because undici.ProxyAgent and
 * HttpsProxyAgent don't speak SOCKS5. proxyxoay returns BOTH variants; we use
 * the http one for server fetch/axios while Electron browser uses socks5.
 */
export declare function getActiveProxyUrl(fallbackStatic: ProxyConfig | null): Promise<string | null>;
/**
 * Convert ParsedProxy to ProxyConfig for database storage
 * Encrypts password before storage
 */
export declare function toProxyConfig(parsed: ParsedProxy | null): ProxyConfig;
/**
 * Test proxy connection by making request through proxy
 * Returns { success: boolean, message: string, ip?: string }
 */
export declare function testProxyConnection(proxyString: string): Promise<{
    success: boolean;
    message: string;
    ip?: string;
    latencyMs?: number;
}>;
//# sourceMappingURL=proxyUtils.d.ts.map