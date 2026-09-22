/**
 * Where reCAPTCHA tokens come from.
 *
 *   'extension' — FALLBACK. The user-installed Chrome
 *                 extension long-polls /api/internal/captcha/poll and posts
 *                 tokens back. Proven in production.
 *   'cdp'       — DEFAULT. Electron opens its own real Chrome, parks a Flow
 *                 tab and mints through CDP (`captchaBrowserManager.ts`). No
 *                 extension install for the user.
 *
 * Only the transport differs. The mint mutex, the 3/7 failure ladder and the
 * reset escalation all stay in captchaManager, so both providers are scored and
 * throttled identically.
 */
import { fetchIpcBridge } from './ipcBridgeFetch.js';
import { logger } from './logger.js';
import { CaptchaError } from './errors.js';
/**
 * 'cdp' is the default since 2026-09-19: field-tested with zero 403s and it
 * spares the user the manual extension install. `CAPTCHA_PROVIDER=extension`
 * falls back to the old path, which is kept working for exactly that reason.
 */
function readEnvProvider() {
    return process.env.CAPTCHA_PROVIDER === 'extension' ? 'extension' : 'cdp';
}
let activeProvider = readEnvProvider();
export function getCaptchaProvider() {
    return activeProvider;
}
/**
 * Switching is allowed at runtime so the two paths can be A/B-tested on the same
 * build. In-flight mints keep running on the provider that started them; the
 * mutex in captchaManager means at most one is ever in flight.
 */
export function setCaptchaProvider(next) {
    if (next !== activeProvider) {
        logger.info(`[captcha] provider: ${activeProvider} → ${next}`);
        activeProvider = next;
    }
    return activeProvider;
}
async function callBridge(path, init) {
    let res;
    try {
        res = await fetchIpcBridge(path, init);
    }
    catch (err) {
        // Electron unreachable: the server can run standalone (tests, dev server),
        // in which case the cdp provider simply has no browser to drive.
        throw new CaptchaError(`Không gọi được Electron để mint captcha: ${err instanceof Error ? err.message : String(err)}`, { code: 'CAPTCHA_BRIDGE_UNREACHABLE', retryable: true });
    }
    const body = (await res.json().catch(() => ({})));
    if (!res.ok || body?.ok === false) {
        throw new CaptchaError(`Captcha browser lỗi: ${body?.error ?? `HTTP ${res.status}`}`, {
            code: 'CAPTCHA_FAILED',
            retryable: true,
        });
    }
    return body;
}
export async function cdpMint(action) {
    const { token } = await callBridge('/captcha/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
    });
    if (!token || token.trim().length === 0) {
        throw new CaptchaError('Captcha browser trả về token rỗng', {
            code: 'CAPTCHA_EMPTY',
            retryable: true,
        });
    }
    return token;
}
export async function cdpReset(kind) {
    await callBridge('/captcha/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind }),
    });
}
export async function cdpEnsure() {
    const { status } = await callBridge('/captcha/ensure', {
        method: 'POST',
    });
    return status;
}
/** Never throws — the status panel must render even when Electron is absent. */
export async function cdpStatus() {
    try {
        const { status } = await callBridge('/captcha/status');
        return status;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=captchaProvider.js.map