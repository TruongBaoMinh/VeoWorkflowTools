/**
 * GlobalProxyManager — single rotating SOCKS5 proxy shared by all profiles + HTTP clients.
 *
 * Policy:
 * - One proxy globally at a time (provider: proxyxoay.shop).
 * - Single-flight: concurrent getProxy() calls collapse to one upstream fetch.
 * - minIntervalMs = 60_000 between rotate calls (protects against status=102).
 * - Proactive refresh: 3 consecutive 403s OR remaining TTL < 90s.
 * - Emits 'rotated' with new proxy so browser sessions + HTTP agents can swap.
 */
import { EventEmitter } from 'events';
import { SocksProxyAgent } from 'socks-proxy-agent';
export interface RotatingProxy {
    http: string;
    socks5: string;
    socks5Url: string;
    expiresAt: Date;
}
export interface ProxyStatus {
    enabled: boolean;
    hasProxy: boolean;
    http: string | null;
    socks5: string | null;
    expiresAt: string | null;
    ttlSeconds: number;
    lastError: string | null;
    forbiddenHits: number;
}
interface TopproxyKeyEntry {
    keyxoay: string;
    expired: string;
}
declare class GlobalProxyManagerImpl extends EventEmitter {
    private current;
    private currentAgent;
    private inflight;
    private lastFetchAt;
    private forbiddenHits;
    private lastError;
    private backoffMs;
    private proactiveTimer;
    private periodicRotationTimer;
    /** Cached list of rotating keys from topproxy.vn, with their own expiries. */
    private keyxoayCache;
    private keyxoayCacheAt;
    private readonly KEYXOAY_CACHE_TTL_MS;
    /**
     * Temporary kill-switch: set `PROXY_MANAGER_DISABLED=1` to short-circuit
     * every public entry point. Useful when the upstream rotation API
     * (keyxoay / proxyxoay) is degraded — the manager would otherwise burn
     * 403 streaks trying to rotate a key that no longer exists.
     */
    private isDisabled;
    init(): Promise<void>;
    /** Returns current proxy, fetching if needed. Returns null if disabled. */
    getProxy(): Promise<RotatingProxy | null>;
    /** Returns SOCKS5 agent bound to current proxy (for http.Agent/axios). */
    getAgent(): SocksProxyAgent | null;
    /** Get socks5 rule string for Electron session.setProxy(). */
    getSocks5Rule(): string | null;
    /** Sync getter for server HTTP clients — returns http://host:port or null. */
    getCurrentHttpProxyUrl(): string | null;
    /** True if global rotating proxy is enabled (from loaded settings cache). */
    private _enabledCached;
    refreshEnabledCache(): Promise<void>;
    isEnabled(): boolean;
    /** Force a rotation. Respects minInterval + single-flight. */
    forceRotate(): Promise<RotatingProxy | null>;
    /** Call this when an HTTP request returns 403 through the proxy. */
    reportForbidden(): Promise<void>;
    /** Call this when proxy connection itself fails (ECONNREFUSED, ETIMEOUT, etc.). */
    reportProxyError(): Promise<void>;
    resetForbiddenHits(): void;
    getStatus(): Promise<ProxyStatus>;
    /** Clear cache — called when settings change (key/nhamang/etc.). */
    invalidate(): Promise<void>;
    private rotate;
    /**
     * Fetch list of rotating keys from topproxy.vn using master API key.
     * Cached 5 min to avoid spam. Returns only keys not yet expired.
     */
    fetchKeyxoayList(force?: boolean): Promise<TopproxyKeyEntry[]>;
    private fetchFromProvider;
    private loadSettings;
    /** Start/restart periodic rotation timer based on rotationIntervalMinutes setting. */
    private restartPeriodicRotation;
    private startProactiveTimer;
}
export declare const globalProxyManager: GlobalProxyManagerImpl;
export {};
//# sourceMappingURL=GlobalProxyManager.d.ts.map