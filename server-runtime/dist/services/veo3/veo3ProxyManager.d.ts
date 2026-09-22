/**
 * Veo3 Proxy Agent Manager
 * Manages proxy agent creation, caching, and eviction for Veo3 API requests
 */
import type { ProxyAgentPair } from './veo3Types.js';
export declare function buildProxyAgents(proxyUrl: string): ProxyAgentPair | null;
/** Close and evict agent when proxy URL changes (rotate) or profile is disabled. */
export declare function evictProxyAgent(proxyUrl: string): void;
export declare function applyInterProfileJitter(): Promise<void>;
//# sourceMappingURL=veo3ProxyManager.d.ts.map