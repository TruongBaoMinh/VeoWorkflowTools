import { z } from 'zod';
import { profileSchema, profileService } from './profile.service.js';
import { refreshAccessTokenFromCookies, validateCookiesWithApi } from '../../providers/utils/cookieAuth.js';
import { logger } from '../../lib/logger.js';
import { refreshProfileAccountInfo, refreshManyProfileAccountInfo } from './accountInfo.service.js';
import { hasSessionCookie, SESSION_COOKIE as REQUIRED_LABS_COOKIE } from './sessionCookie.js';
// labs.google NextAuth session — without this cookie the /api/auth/session
// endpoint returns `{}` and the ya29 access-token refresh fails with the
// misleading "Google returned empty session" error. Surface the real cause
// (incomplete browser login) BEFORE making the network call.
// Matching lives in sessionCookie.ts so this check can never drift from the
// one that computes the expiry shown on the Profiles tab.
function missingLabsSessionError(profileId) {
    logger.warn(`[Profile] ${REQUIRED_LABS_COOKIE} missing in partition for ${profileId.substring(0, 8)} — re-login required`);
    return {
        code: 'LABS_SESSION_COOKIE_MISSING',
        message: 'Profile chưa hoàn tất đăng nhập Flow AI. Phiên làm việc chưa được cấp ' +
            'đầy đủ — không lấy được access token.',
        action: 'Vui lòng đăng nhập lại và GIỮ cửa sổ Chrome mở cho đến khi trang ' +
            'flow.google.com tải xong hoàn toàn rồi mới đóng.',
    };
}
export async function registerProfileRoutes(app) {
    // List all profiles
    app.get('/api/profiles', async (_request, reply) => {
        try {
            const profiles = await profileService.list();
            return reply.send(profiles);
        }
        catch (error) {
            logger.error('Error listing profiles:', error);
            return reply.status(500).send({
                error: 'Failed to list profiles',
                details: error.message || String(error)
            });
        }
    });
    // Get single profile by ID
    // Fetches profile from DB and merges with live cookies from browser partition
    app.get('/api/profiles/:id', async (request, reply) => {
        try {
            const params = z.object({ id: z.string().min(1) }).parse(request.params);
            logger.info(`[Profile] Fetching profile: ${params.id}`);
            const profile = await profileService.getById(params.id);
            if (!profile) {
                logger.info(`[Profile] Profile not found: ${params.id}`);
                return reply.status(404).send({ error: 'Profile not found' });
            }
            // Fetch fresh cookies from browser partition (always up-to-date from warmup)
            try {
                const { getProfileCookiesCompat } = await import('../../utils/profileCookies.js');
                const { cookies: liveCookies, hasCookies } = await getProfileCookiesCompat(profile);
                // Merge live cookies with profile data
                const profileWithCookies = {
                    ...profile,
                    cookies: hasCookies ? liveCookies : profile.cookies || '', // Fallback to DB if partition empty
                };
                logger.info(`[Profile] Fetched profile: ${profile.id}, liveCookies: ${hasCookies}, cookiesLength: ${profileWithCookies.cookies?.length || 0}`);
                return reply.send(profileWithCookies);
            }
            catch (cookieError) {
                // If can't get cookies from partition, return profile with DB cookies
                logger.warn(`[Profile] Could not fetch live cookies, using DB cookies:`, cookieError);
                logger.info(`[Profile] Fetched profile: ${profile.id}, hasCookies: ${!!profile.cookies}`);
                return reply.send(profile);
            }
        }
        catch (error) {
            logger.error('[Profile] Error fetching profile:', error);
            return reply.status(500).send({
                error: 'Failed to fetch profile',
                details: error.message || String(error)
            });
        }
    });
    // Create profile
    app.post('/api/profiles', async (request, reply) => {
        try {
            logger.info('[Profile] Creating profile with payload:', JSON.stringify(request.body, null, 2));
            const payload = profileSchema.parse(request.body);
            logger.info('[Profile] Parsed payload:', JSON.stringify(payload, null, 2));
            const profile = await profileService.create(payload);
            logger.info('[Profile] Created profile:', profile.id);
            // Don't warmup on create — profile has no cookies yet.
            // Warmup will be triggered when cookies are set (via update route)
            // or detected by the health check loop's DB re-scan.
            return reply.code(201).send(profile);
        }
        catch (error) {
            logger.error('[Profile] Error creating profile:', error);
            logger.error('[Profile] Error stack:', error.stack);
            // Check for specific Prisma errors
            if (error.code) {
                logger.error('[Profile] Prisma error code:', error.code);
            }
            return reply.status(500).send({
                error: 'Failed to create profile',
                details: error.message || String(error),
                code: error.code || 'UNKNOWN',
                stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
            });
        }
    });
    // Update profile
    app.put('/api/profiles/:id', async (request, reply) => {
        try {
            const params = z.object({ id: z.string().min(1) }).parse(request.params);
            const payload = profileSchema.partial().parse(request.body);
            const profile = await profileService.update(params.id, payload);
            return reply.send(profile);
        }
        catch (error) {
            logger.error('Error updating profile:', error);
            return reply.status(500).send({
                error: 'Failed to update profile',
                details: error.message || String(error)
            });
        }
    });
    // Delete profile
    app.delete('/api/profiles/:id', async (request, reply) => {
        try {
            const params = z.object({ id: z.string().min(1) }).parse(request.params);
            // Delete from DB first (fast), then cleanup browser async
            await profileService.delete(params.id);
            return reply.code(204).send();
        }
        catch (error) {
            logger.error('Error deleting profile:', error);
            return reply.status(500).send({
                error: 'Failed to delete profile',
                details: error.message || String(error)
            });
        }
    });
    // Lightweight pre-flight check — does NOT hit Google. Just inspects the
    // partition cookies + cached token expiry so the renderer can show a
    // "Profile X needs re-login" modal BEFORE submitting a batch of jobs.
    //
    // Returns:
    //   status='fresh'       cookies present + labs session present + token not expired
    //   status='stale'       cookies present but labs session missing OR token expired
    //   status='no-cookies'  partition empty (never logged in, or wiped)
    //   status='unknown'     profile not found / error reading
    app.get('/api/profiles/:id/auth-status', async (request, reply) => {
        const params = z.object({ id: z.string().min(1) }).parse(request.params);
        try {
            const profile = await profileService.getById(params.id);
            if (!profile)
                return reply.code(404).send({ status: 'unknown', error: 'Profile not found' });
            const { getProfileCookiesCompat } = await import('../../utils/profileCookies.js');
            const { hasCookies, parsed } = await getProfileCookiesCompat(profile);
            if (!hasCookies) {
                return reply.send({ status: 'no-cookies', hasLabsSession: false, tokenExpiresAt: null });
            }
            const labsSession = hasSessionCookie(parsed);
            const tokenExpiry = profile.accessTokenExpires ? new Date(profile.accessTokenExpires) : null;
            const tokenFresh = tokenExpiry ? tokenExpiry.getTime() > Date.now() + 60000 : false; // 60s safety margin
            if (!labsSession || !tokenFresh) {
                return reply.send({
                    status: 'stale',
                    hasLabsSession: labsSession,
                    tokenExpiresAt: tokenExpiry?.toISOString() ?? null,
                });
            }
            return reply.send({
                status: 'fresh',
                hasLabsSession: true,
                tokenExpiresAt: tokenExpiry?.toISOString() ?? null,
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            logger.warn(`[auth-status] check failed for ${params.id.substring(0, 8)}: ${message}`);
            return reply.code(500).send({ status: 'unknown', error: message });
        }
    });
    // Test profile connection (validate cookies and get access token)
    app.post('/api/profiles/:id/test', async (request, reply) => {
        const params = z.object({ id: z.string().min(1) }).parse(request.params);
        try {
            const profile = await profileService.getById(params.id);
            if (!profile) {
                reply.code(404).send({ error: 'Profile not found' });
                return;
            }
            // Get cookies from partition
            const { getProfileCookiesCompat } = await import('../../utils/profileCookies.js');
            const { cookies: profileCookies, hasCookies, parsed } = await getProfileCookiesCompat(profile);
            if (!hasCookies) {
                reply.code(400).send({
                    success: false,
                    error: 'No cookies found in profile. Please add cookies to test connection.'
                });
                return;
            }
            // Pre-check: without the labs.google NextAuth cookie the upstream call
            // will return `{}` with a generic message. Fail fast with actionable text.
            if (!hasSessionCookie(parsed)) {
                const err = missingLabsSessionError(profile.id);
                reply.code(400).send({ success: false, ...err });
                return;
            }
            // Validate cookies and get access token
            const { accessToken, expiresAt } = await refreshAccessTokenFromCookies(profileCookies, profile.id);
            // Update profile with access token only (cookies fetched live from partition)
            await profileService.update(profile.id, {
                accessToken,
                accessTokenExpires: expiresAt,
            });
            reply.send({
                success: true,
                message: 'Connection successful! Access token retrieved and cached.',
                accessToken: `${accessToken.substring(0, 20)}...${accessToken.substring(accessToken.length - 10)}`,
                expiresAt: expiresAt?.toISOString(),
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message || 'Failed to connect. Please check your cookies.',
            });
        }
    });
    // Refresh access token from cookies
    app.post('/api/profiles/:id/refresh-token', async (request, reply) => {
        const params = z.object({ id: z.string().min(1) }).parse(request.params);
        try {
            const profile = await profileService.getById(params.id);
            if (!profile) {
                reply.code(404).send({ error: 'Profile not found' });
                return;
            }
            // Get cookies from partition
            const { getProfileCookiesCompat } = await import('../../utils/profileCookies.js');
            const { cookies: profileCookies, hasCookies, parsed } = await getProfileCookiesCompat(profile);
            if (!hasCookies) {
                reply.code(400).send({
                    success: false,
                    error: 'No cookies found in profile'
                });
                return;
            }
            if (!hasSessionCookie(parsed)) {
                const err = missingLabsSessionError(profile.id);
                reply.code(400).send({ success: false, ...err });
                return;
            }
            // Refresh access token from cookies
            const { accessToken, expiresAt } = await refreshAccessTokenFromCookies(profileCookies, profile.id);
            // Update profile with access token only (cookies fetched live from partition)
            await profileService.update(profile.id, {
                accessToken,
                accessTokenExpires: expiresAt,
            });
            reply.send({
                success: true,
                message: 'Access token refreshed successfully!',
                expiresAt: expiresAt?.toISOString(),
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message || 'Failed to refresh token',
            });
        }
    });
    // Save cookies from browser session to profile
    app.post('/api/profiles/:id/save-cookies', async (request, reply) => {
        const params = z.object({ id: z.string().min(1) }).parse(request.params);
        const body = z.object({ cookies: z.string().min(1) }).parse(request.body);
        try {
            const profile = await profileService.getById(params.id);
            if (!profile) {
                reply.code(404).send({ error: 'Profile not found' });
                return;
            }
            // Update profile with cookies
            await profileService.update(profile.id, {
                cookies: body.cookies,
            });
            reply.send({
                success: true,
                message: 'Cookies saved successfully!',
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message || 'Failed to save cookies',
            });
        }
    });
    // Clone profile — creates N copies with cookies imported into each new Electron partition.
    // Each clone gets a fresh cuid() → unique deterministic fingerprint → distinct
    // Google session score, while sharing the source's login credentials.
    app.post('/api/profiles/:id/clone', async (request, reply) => {
        try {
            const params = z.object({ id: z.string().min(1) }).parse(request.params);
            const body = z.object({
                count: z.number().int().min(1).max(10),
                namePrefix: z.string().max(120).optional(),
            }).parse(request.body);
            const clones = await profileService.cloneProfile(params.id, body.count, {
                namePrefix: body.namePrefix,
            });
            return reply.code(201).send({
                success: true,
                requested: body.count,
                created: clones.length,
                clones,
            });
        }
        catch (error) {
            logger.error('[Profile] Clone failed:', error);
            return reply.status(error.statusCode ?? 500).send({
                error: 'Failed to clone profile',
                details: error.message || String(error),
            });
        }
    });
    // Test proxy connection
    app.post('/api/profiles/test-proxy', async (request, reply) => {
        const body = z.object({
            proxyConfig: z.string().min(1, 'Proxy config is required')
        }).parse(request.body);
        try {
            const { validateProxyFormat, testProxyConnection } = await import('../../utils/proxyUtils.js');
            // Validate format first
            const validation = validateProxyFormat(body.proxyConfig);
            if (!validation.valid) {
                reply.code(400).send({
                    success: false,
                    error: validation.error,
                });
                return;
            }
            // Test actual connection
            const result = await testProxyConnection(body.proxyConfig);
            reply.send(result);
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message || 'Failed to test proxy',
            });
        }
    });
    // Get proxy config for a profile (used by Electron browser manager)
    app.get('/api/profiles/:id/proxy', async (request, reply) => {
        const params = z.object({ id: z.string().min(1) }).parse(request.params);
        try {
            const proxyConfig = await profileService.getProxyConfig(params.id);
            reply.send({
                success: true,
                proxyConfig,
            });
        }
        catch (error) {
            reply.code(400).send({
                success: false,
                error: error.message || 'Failed to get proxy config',
            });
        }
    });
    // Refresh tier / credits / session expiry for many profiles at once.
    // Static path — keep registered before the /:id variant below.
    // Body: { profileIds?: string[], force?: boolean }
    app.post('/api/profiles/refresh-account-info', async (request, reply) => {
        const body = z
            .object({
            profileIds: z.array(z.string().min(1)).optional(),
            force: z.boolean().optional(),
        })
            .parse(request.body ?? {});
        try {
            const results = await refreshManyProfileAccountInfo(body.profileIds, body.force ?? false);
            return reply.send({ success: true, results });
        }
        catch (err) {
            logger.error('[AccountInfo] batch refresh failed:', err);
            return reply.code(500).send({ success: false, error: err?.message ?? String(err) });
        }
    });
    // Refresh account info for a single profile (per-card ↻ button).
    app.post('/api/profiles/:id/refresh-account-info', async (request, reply) => {
        const params = z.object({ id: z.string().min(1) }).parse(request.params);
        const body = z.object({ force: z.boolean().optional() }).parse(request.body ?? {});
        try {
            const info = await refreshProfileAccountInfo(params.id, { force: body.force ?? true });
            return reply.send(info);
        }
        catch (err) {
            logger.error(`[AccountInfo] refresh failed for ${params.id.substring(0, 8)}:`, err);
            return reply.code(500).send({ error: err?.message ?? String(err) });
        }
    });
    app.post('/api/profiles/refresh-all-tokens', async (_request, reply) => {
        try {
            const profiles = await profileService.list();
            const activeProfiles = profiles.filter((p) => p.active);
            if (activeProfiles.length === 0) {
                return reply.send({ success: true, results: [], message: 'No active profiles' });
            }
            const results = [];
            for (const profile of activeProfiles) {
                const cookies = profile.cookies;
                if (!cookies) {
                    results.push({ profileId: profile.id, profileName: profile.name, success: false, error: 'No cookies' });
                    continue;
                }
                try {
                    // refreshAccessTokenFromCookies returns the REAL auth/session expiry
                    // (same helper as /api/profiles/:id/test) instead of a +55min guess.
                    const refreshed = await refreshAccessTokenFromCookies(cookies, profile.id);
                    await profileService.update(profile.id, {
                        accessToken: refreshed.accessToken,
                        accessTokenExpires: refreshed.expiresAt ?? new Date(Date.now() + 55 * 60 * 1000),
                    });
                    results.push({ profileId: profile.id, profileName: profile.name, success: true });
                }
                catch (err) {
                    results.push({ profileId: profile.id, profileName: profile.name, success: false, error: err?.message ?? String(err) });
                }
            }
            const failedProfiles = results.filter(r => !r.success);
            reply.send({
                success: true,
                results,
                summary: { total: results.length, success: results.length - failedProfiles.length, failed: failedProfiles.length },
                failedProfiles,
            });
        }
        catch (error) {
            logger.error('[Profile Routes] refresh-all-tokens failed:', error);
            reply.code(500).send({ success: false, error: error.message || 'Failed to refresh tokens' });
        }
    });
    // Warmup endpoints are kept as no-op stubs so the renderer can call them
    // safely after upgrade. Real warmup is no longer needed in the single-
    // shared-browser model — captcha comes from the user-installed extension.
    app.post('/api/profiles/warmup-all', async (_request, reply) => {
        reply.send({ success: true, message: 'Warmup is a no-op in single-shared-browser mode' });
    });
    // Triggered by Electron after the user closes a profile's Real Chrome.
    // Re-reads the partition (which the CDP poll loop has already updated with
    // the latest cookies) and refreshes the cached ya29 access-token so the
    // next Veo3 API call doesn't fail on a stale token.
    app.post('/api/profiles/warmup-single', async (request, reply) => {
        const body = z
            .object({ profileId: z.string().min(1), force: z.boolean().optional() })
            .parse(request.body);
        try {
            const { getProfileCookies } = await import('../../utils/profileCookies.js');
            // `force` is used to VERIFY a just-minted session: without dropping the
            // cached token first, this would hand back the very token we replaced and
            // report success no matter what happened in the browser.
            if (body.force) {
                const { cookieTokenService } = await import('../../lib/cookieTokenService.js');
                cookieTokenService.clearCache(body.profileId);
            }
            const cookies = await getProfileCookies(body.profileId);
            if (!cookies) {
                return reply.send({
                    success: false,
                    hasAccessToken: false,
                    noCookies: true,
                    error: 'No cookies in partition — user may need to log in again',
                });
            }
            let result;
            try {
                result = await refreshAccessTokenFromCookies(cookies, body.profileId);
            }
            catch (err) {
                if (err?.code === 'FLOW_SESSION_REMINT_REQUIRED') {
                    // Clear the stored expiry so /auth-status stops answering `fresh` off a
                    // token that Google no longer honours — otherwise the warm-up sees a
                    // healthy profile and never engages.
                    await profileService
                        .update(body.profileId, { accessTokenExpires: null })
                        .catch(() => { });
                    return reply.send({
                        success: false,
                        hasAccessToken: false,
                        needsRelogin: true,
                        errorCode: 'FLOW_SESSION_REMINT_REQUIRED',
                        error: err.message,
                    });
                }
                throw err;
            }
            // Persist token + expiry so GET /auth-status (which reads the DB
            // `accessTokenExpires`) flips to `fresh` immediately. Without this the
            // warm-up refreshes the in-memory token but auth-status stays `stale`,
            // so the warm-up loop polls the full 60s timeout before closing Chrome
            // and reports the profile as not-warmed (then re-warms it).
            if (result.accessToken) {
                await profileService.update(body.profileId, {
                    accessToken: result.accessToken,
                    accessTokenExpires: result.expiresAt,
                });
                // The gen-normal queue parks a profile once its cookies die and skips
                // every queued job for it. Nothing used to lift that, so a profile
                // stayed parked until the app restarted even after a good re-login.
                try {
                    const { genNormalQueueManager } = await import('../genNormal/genNormalQueueManager.js');
                    genNormalQueueManager.clearNeedsRelogin(body.profileId);
                }
                catch (err) {
                    logger.warn(`[warmup-single] could not clear needs-relogin for ${body.profileId.substring(0, 8)}: ${err instanceof Error ? err.message : String(err)}`);
                }
            }
            return reply.send({
                success: true,
                hasAccessToken: Boolean(result.accessToken),
                expiresAt: result.expiresAt ?? null,
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            logger.warn(`[warmup-single] refresh failed for ${body.profileId.substring(0, 8)}: ${message}`);
            // Unclassified = transient as far as the caller is concerned: no
            // needsRelogin flag, so the automation retries instead of opening Chrome.
            return reply.send({ success: false, hasAccessToken: false, transient: true, error: message });
        }
    });
    app.get('/api/profiles/warmup-status', async (_request, reply) => {
        reply.send({
            success: true,
            profiles: [],
            isWarmingUp: false,
            profilesNeedingAuth: [],
            browserLimit: 0,
        });
    });
}
//# sourceMappingURL=profile.routes.js.map