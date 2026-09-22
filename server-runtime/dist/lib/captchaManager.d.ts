import type { CaptchaAction, CaptchaCommand, CaptchaResetKind, CaptchaResultPayload, CaptchaToken } from './captchaTypes.js';
declare class CaptchaManager {
    private readonly mintLock;
    private readonly pending;
    private readonly queue;
    private readonly waiters;
    private readonly mintTimeoutMs;
    private consecutiveFailures;
    private pendingReset;
    private lastExtensionSeenAt;
    private lastHasFlowTab;
    private lastHasFlowTabAt;
    private extensionVersion;
    private lastMintAt;
    private lastMintDurationMs;
    constructor();
    requestToken(action: CaptchaAction): Promise<CaptchaToken>;
    drainCommands(maxWaitMs: number): Promise<CaptchaCommand[]>;
    resolveCommand(payload: CaptchaResultPayload): boolean;
    notifySuccess(): void;
    notifyFailure(): void;
    /**
     * Called when the API CONFIRMS the reCAPTCHA score is dead
     * (PUBLIC_ERROR_UNUSUAL_ACTIVITY / "evaluation failed"). Unlike notifyFailure(),
     * this skips the 3/7 consecutive-failure ladder and schedules a hard_reset
     * immediately, so the extension clears the _GRECAPTCHA anchor + reloads the
     * Flow tab on the very first 403 instead of after 3–7 failed jobs.
     */
    notifyRecaptchaScoreDead(): void;
    recordExtensionHeartbeat(payload: {
        type?: string;
        version?: string;
        hasFlowTab?: boolean;
    }): void;
    stats(): {
        pendingCount: number;
        queuedCount: number;
        pollerWaitingCount: number;
        consecutiveFailures: number;
        pendingReset: CaptchaResetKind | null;
        lastExtensionSeenAt: number | null;
        extensionVersion: string | null;
        lastMintAt: number | null;
        lastMintDurationMs: number | null;
        mintTimeoutMs: number;
        hasFlowTab: boolean | null;
        provider: 'extension' | 'cdp';
    };
    extensionLiveness(): 'connected' | 'stale' | 'offline';
    flowTabPresent(): boolean | null;
    /**
     * Provider 'cdp': Electron mints directly, so there is no poll queue and no
     * command id. Resets cannot wait for a poller to pick them up either — they
     * are applied inline, before the mint they were scheduled for.
     */
    private mintViaCdp;
    private mintOnce;
    private consumePendingReset;
    private signalWaiters;
}
export declare const captchaManager: CaptchaManager;
export {};
//# sourceMappingURL=captchaManager.d.ts.map