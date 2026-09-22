import type { CaptchaAction, CaptchaResetKind } from './captchaTypes.js';
export type CaptchaProviderName = 'extension' | 'cdp';
export interface CdpBrowserStatus {
    running: boolean;
    pageUrl: string | null;
    lastMintAt: number | null;
    lastMintDurationMs: number | null;
    lastError: string | null;
    mintCount: number;
    failureCount: number;
}
export declare function getCaptchaProvider(): CaptchaProviderName;
/**
 * Switching is allowed at runtime so the two paths can be A/B-tested on the same
 * build. In-flight mints keep running on the provider that started them; the
 * mutex in captchaManager means at most one is ever in flight.
 */
export declare function setCaptchaProvider(next: CaptchaProviderName): CaptchaProviderName;
export declare function cdpMint(action: CaptchaAction): Promise<string>;
export declare function cdpReset(kind: CaptchaResetKind): Promise<void>;
export declare function cdpEnsure(): Promise<CdpBrowserStatus>;
/** Never throws — the status panel must render even when Electron is absent. */
export declare function cdpStatus(): Promise<CdpBrowserStatus | null>;
//# sourceMappingURL=captchaProvider.d.ts.map