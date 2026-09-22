/**
 * Thin re-exports of cookieTokenService methods used by profile routes +
 * genNormalQueueManager. Kept here to avoid churn at the call sites.
 */
import { cookieTokenService } from '../../lib/cookieTokenService.js';
export async function refreshAccessTokenFromCookies(cookiesString, profileId) {
    return cookieTokenService.getAccessTokenFromCookies(cookiesString, profileId);
}
export async function validateCookiesWithApi(cookiesString) {
    return cookieTokenService.validateCookies(cookiesString);
}
//# sourceMappingURL=cookieAuth.js.map