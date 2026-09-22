/**
 * Image Upsampling Handler
 * Processes image upsampling jobs (upsample to 2K/4K).
 * 🔒 SEQUENTIAL: 1 job at a time per profile via static `submissionLocks` Map
 * — tránh 403 captcha overlap khi extension mint cùng lúc cho 2 submit cùng profile.
 */
import { BaseJobHandler } from '../JobHandler.js';
import { JobType } from '../../jobs/JobTypes.js';
import { logger } from '../../../lib/logger.js';
import { prisma } from '../../../lib/prisma.js';
import { genNormalRepository } from '../../../modules/genNormal/genNormal.repository.js';
import { Veo3Service } from '../../../services/veo3/veo3Service.js';
import { genNormalQueueManager } from '../../../modules/genNormal/genNormalQueueManager.js';
// Concurrency configuration. The per-profile limit is now driven by
// `GenNormalProject.imageUpscaleConcurrency` (1..4) chosen by the user in
// "Cài đặt nâng cao". `DEFAULT_PER_PROFILE_LIMIT` is the fall-back when the
// project hasn't been configured.
const DEFAULT_PER_PROFILE_LIMIT = 1;
const MAX_PER_PROFILE_LIMIT = 4;
// 🧊 Hard gap between upscale batches per profile when running serial
// (limit=1) — Google 429 TOO_MUCH_TRAFFIC hits when upscale bursts right
// after gen completes. With higher concurrency the gap is reduced because
// jobs already overlap.
const POST_BATCH_COOLDOWN_MS_SERIAL = 8000;
const POST_BATCH_COOLDOWN_MS_PARALLEL = 2000;
// 🧊 After a 429, freeze profile upscale for 5 min
const POST_429_COOLDOWN_MS = 5 * 60 * 1000;
const profile429Until = new Map();
// Short TTL cache of `imageUpscaleConcurrency` per profile so canProcess
// stays synchronous-cheap (SQLite picker calls it on every job).
const profileLimitCache = new Map();
const LIMIT_CACHE_TTL_MS = 30000;
export class ImageUpsamplingHandler extends BaseJobHandler {
    static effectiveLimit(profileId) {
        const cached = profileLimitCache.get(profileId);
        if (cached && cached.expiresAt > Date.now())
            return cached.limit;
        return DEFAULT_PER_PROFILE_LIMIT;
    }
    static async refreshLimitForJob(profileId, genNormalJobId) {
        try {
            const row = await prisma.genNormalJob.findUnique({
                where: { id: genNormalJobId },
                select: { project: { select: { imageUpscaleConcurrency: true } } },
            });
            const raw = row?.project?.imageUpscaleConcurrency;
            const limit = typeof raw === 'number' && raw >= 1 && raw <= MAX_PER_PROFILE_LIMIT
                ? raw
                : DEFAULT_PER_PROFILE_LIMIT;
            profileLimitCache.set(profileId, { limit, expiresAt: Date.now() + LIMIT_CACHE_TTL_MS });
            return limit;
        }
        catch {
            return DEFAULT_PER_PROFILE_LIMIT;
        }
    }
    getJobType() {
        return JobType.IMAGE_UPSAMPLING;
    }
    /**
     * Pre-check at SQLite queue level: refuse to pull this job into execute()
     * when the profile is already at its configured per-profile parallel limit
     * or sitting in a 429 cool-down. Uses a cached limit (TTL 30s) so this
     * stays cheap; execute() will refresh the cache on first dispatch.
     */
    async canProcess(job) {
        const profileId = job.profileId;
        if (!profileId)
            return true;
        const cooldownUntil = profile429Until.get(profileId) || 0;
        if (cooldownUntil > Date.now()) {
            return false;
        }
        const limit = ImageUpsamplingHandler.effectiveLimit(profileId);
        const inflight = ImageUpsamplingHandler.inflightByProfile.get(profileId) || 0;
        return inflight < limit;
    }
    async execute(job) {
        const { genNormalJobId, resolution } = job.data;
        if (!genNormalJobId) {
            throw new Error('Missing required field: genNormalJobId');
        }
        logger.info(`[ImageUpsamplingHandler] Processing image upsampling job`, {
            queueJobId: job.id,
            genNormalJobId,
            resolution
        });
        // Get upsampling job from database
        const upsamplingJob = await prisma.genNormalJob.findUnique({
            where: { id: genNormalJobId },
            include: {
                project: true,
                profile: true
            }
        });
        if (!upsamplingJob) {
            throw new Error(`Upsampling job not found: ${genNormalJobId}`);
        }
        // 🚫 Check if project has been cancelled
        const projectId = upsamplingJob.projectId;
        if (projectId && genNormalQueueManager.isProjectCancelled(projectId)) {
            logger.info(`[ImageUpsamplingHandler] 🚫 Skipping upsampling - project has been cancelled`, {
                queueJobId: job.id,
                genNormalJobId,
                projectId
            });
            try {
                await prisma.genNormalJob.delete({ where: { id: genNormalJobId } });
            }
            catch (e) {
                if (e.code !== 'P2025')
                    logger.warn(`Failed to delete cancelled upsampling job: ${e.message}`);
            }
            return { success: true, cancelled: true };
        }
        const profileId = upsamplingJob.profileId;
        if (!profileId)
            throw new Error('Upsampling job has no profileId');
        // Refresh the per-profile parallel limit (and cache it for canProcess on
        // subsequent siblings). Then reserve a slot atomically before any await.
        const limit = await ImageUpsamplingHandler.refreshLimitForJob(profileId, genNormalJobId);
        const inflightBefore = ImageUpsamplingHandler.inflightByProfile.get(profileId) || 0;
        if (inflightBefore >= limit) {
            // canProcess raced — the slot was filled between gate and dispatch.
            // Bail out cheaply; SQLite will requeue.
            throw Object.assign(new Error(`Profile ${profileId.substring(0, 8)} upscale slot full (${inflightBefore}/${limit})`), { isRetryable: true, cooldownMs: 1500 });
        }
        ImageUpsamplingHandler.inflightByProfile.set(profileId, inflightBefore + 1);
        // 🧊 If profile hit 429 recently, defer this job — don't burn a captcha/API call now
        const cooldownUntil = profile429Until.get(profileId) || 0;
        if (cooldownUntil > Date.now()) {
            const remainingSec = Math.ceil((cooldownUntil - Date.now()) / 1000);
            logger.warn(`[ImageUpsamplingHandler] 🧊 Profile ${profileId.substring(0, 8)}... in 429 cool-down (${remainingSec}s remaining) — requeueing job ${job.id}`);
            ImageUpsamplingHandler.inflightByProfile.set(profileId, Math.max(0, (ImageUpsamplingHandler.inflightByProfile.get(profileId) || 1) - 1));
            throw Object.assign(new Error(`Profile in 429 cool-down, ${remainingSec}s remaining`), { isRetryable: true, cooldownMs: cooldownUntil - Date.now() });
        }
        try {
            logger.info(`[ImageUpsamplingHandler] 🚀 Processing image upsampling`, {
                profileId: profileId.substring(0, 8) + '...',
                inflight: inflightBefore + 1,
                limit,
            });
            // Single-job execution path (sibling parallel runs come via SQLite
            // queue picking the next job once a slot frees).
            const data = typeof job.data === 'string' ? JSON.parse(job.data) : job.data;
            const resolutionStr = data.resolution || '2K';
            const targetResolution = resolutionStr === '4K' ? 'UPSAMPLE_IMAGE_RESOLUTION_4K' : 'UPSAMPLE_IMAGE_RESOLUTION_2K';
            const batchJobs = [
                {
                    queueJob: job,
                    genNormalJob: upsamplingJob,
                    mediaId: upsamplingJob.providerJobId,
                    targetResolution,
                },
            ];
            return await this.executeConcurrentUpsampling(batchJobs, upsamplingJob, job.id);
        }
        catch (err) {
            // Detect 429 TOO_MUCH_TRAFFIC → freeze profile upscale for POST_429_COOLDOWN_MS
            const errText = err?.errorText || err?.message || '';
            if (err?.response?.status === 429 || /TOO_MUCH_TRAFFIC|RESOURCE_EXHAUSTED/i.test(errText)) {
                const until = Date.now() + POST_429_COOLDOWN_MS;
                profile429Until.set(profileId, until);
                logger.warn(`[ImageUpsamplingHandler] 🧊 Profile ${profileId.substring(0, 8)}... hit 429 → cooling down upscale for ${POST_429_COOLDOWN_MS / 1000}s (until ${new Date(until).toISOString()})`);
            }
            throw err;
        }
        finally {
            // Hold the slot through a short cooldown so the next sibling on this
            // profile doesn't fire immediately. Serial mode (limit=1) keeps the
            // historical 8s gap; parallel mode trims to 2s since jobs already
            // overlap and Google rate-limit risk shifts to total RPS rather than
            // per-profile bursts.
            const cooldown = limit > 1 ? POST_BATCH_COOLDOWN_MS_PARALLEL : POST_BATCH_COOLDOWN_MS_SERIAL;
            await new Promise((resolve) => setTimeout(resolve, cooldown));
            const after = ImageUpsamplingHandler.inflightByProfile.get(profileId) || 1;
            ImageUpsamplingHandler.inflightByProfile.set(profileId, Math.max(0, after - 1));
        }
    }
    async executeConcurrentUpsampling(batchJobs, contextJob, // for credentials
    currentQueueJobId) {
        // Setup provider
        const { getProfileCookiesCompat } = await import('../../../utils/profileCookies.js');
        const { cookies: profileCookiesJson } = await getProfileCookiesCompat(contextJob.profile);
        let cookiesString = undefined;
        if (profileCookiesJson) {
            try {
                const parsed = JSON.parse(profileCookiesJson);
                cookiesString = Array.isArray(parsed)
                    ? parsed.map((c) => `${c.name}=${c.value}`).join('; ')
                    : profileCookiesJson;
            }
            catch {
                cookiesString = profileCookiesJson;
            }
        }
        const veo3Service = new Veo3Service();
        veo3Service.updateConfig({
            accessToken: contextJob.profile.accessToken || undefined,
            cookies: cookiesString,
            profileId: contextJob.profileId,
            onTokenRefreshed: async (newToken) => {
                await prisma.profile.update({
                    where: { id: contextJob.profileId },
                    data: { accessToken: newToken, accessTokenExpires: new Date(Date.now() + 55 * 60 * 1000) }
                });
            }
        });
        const results = await Promise.allSettled(batchJobs.map(async (job) => {
            try {
                logger.info(`[ImageUpsamplingHandler] Submitting request for job ${job.genNormalJob.id}`, {
                    mediaId: job.mediaId,
                    resolution: job.targetResolution
                });
                const response = await veo3Service.upsampleImage(job.mediaId, job.targetResolution, job.genNormalJob.veo3ProjectId || contextJob.projectId);
                // Image upsampling returns SYNCHRONOUS result with base64 encoded image
                // Response format: { encodedImage: "base64string..." }
                const encodedImage = response.encodedImage || response.image?.encodedImage;
                if (encodedImage) {
                    // Synchronous result - decode and save image
                    logger.info(`[ImageUpsamplingHandler] ✅ Received synchronous image result for job ${job.genNormalJob.id}`);
                    // Decode base64 and save to file
                    const fs = await import('fs/promises');
                    const path = await import('path');
                    // Get output directory (use project output folder)
                    const baseDir = process.cwd();
                    const outputDir = path.join(baseDir, 'output');
                    // Ensure output directory exists
                    try {
                        await fs.mkdir(outputDir, { recursive: true });
                    }
                    catch (e) {
                        // Directory might already exist
                    }
                    // Create output filename
                    const timestamp = Date.now();
                    const resolution = job.targetResolution.includes('4K') ? '4k' : '2k';
                    const filename = `upsampled_${resolution}_${timestamp}.png`;
                    const outputPath = path.join(outputDir, filename);
                    // Decode and save
                    const imageBuffer = Buffer.from(encodedImage, 'base64');
                    await fs.writeFile(outputPath, imageBuffer);
                    logger.info(`[ImageUpsamplingHandler] 💾 Saved upsampled image to ${outputPath}`);
                    // Mark upscale clone as COMPLETED, then propagate the new resultUrl
                    // up to the original parent so the FE "Download all" flow picks up the
                    // upscaled file instead of the original CDN URL. Matches the video
                    // upsampling flow in GenNormalStatusPoller (parent.isUpsampled=true +
                    // parent.resultUrl=outputPath, then delete the clone).
                    await prisma.genNormalJob.update({
                        where: { id: job.genNormalJob.id },
                        data: {
                            status: 'COMPLETED',
                            resultUrl: outputPath,
                            progress: 100,
                            completedAt: new Date()
                        }
                    });
                    const parentJobId = job.genNormalJob.parentJobId;
                    if (parentJobId) {
                        try {
                            await prisma.genNormalJob.update({
                                where: { id: parentJobId },
                                data: {
                                    resultUrl: outputPath,
                                    isUpsampled: true,
                                    upsamplingJobId: null,
                                    progress: 100,
                                    status: 'COMPLETED',
                                },
                            });
                            logger.info(`[ImageUpsamplingHandler] 🔗 Parent ${parentJobId} updated with upscaled resultUrl`);
                            // Drop the clone once the parent owns the new resultUrl —
                            // mirrors GenNormalStatusPoller behaviour for video upscale.
                            try {
                                await prisma.genNormalJob.delete({ where: { id: job.genNormalJob.id } });
                            }
                            catch (delErr) {
                                if (delErr.code !== 'P2025') {
                                    logger.warn(`[ImageUpsamplingHandler] Failed to delete upscale clone ${job.genNormalJob.id}: ${delErr.message}`);
                                }
                            }
                        }
                        catch (parentErr) {
                            if (parentErr.code === 'P2025') {
                                logger.warn(`[ImageUpsamplingHandler] Parent job ${parentJobId} not found (deleted?), upscale result stays on clone only`);
                            }
                            else {
                                logger.warn(`[ImageUpsamplingHandler] Failed to update parent ${parentJobId}: ${parentErr.message}`);
                            }
                        }
                    }
                    // Update queue job
                    if (job.queueJob.id !== currentQueueJobId) {
                        await prisma.queueJob.update({
                            where: { id: job.queueJob.id },
                            data: {
                                status: 'completed',
                                result: JSON.stringify({ success: true, resultUrl: outputPath })
                            }
                        });
                    }
                    return { success: true, resultUrl: outputPath, jobId: job.genNormalJob.id };
                }
                else {
                    // Async operation (fallback - shouldn't happen for image upsampling)
                    const operationName = response.operations?.[0]?.name
                        || response.name
                        || response.operation?.name;
                    if (!operationName) {
                        logger.warn(`[ImageUpsamplingHandler] No operation name or encodedImage found for job ${job.genNormalJob.id}, raw keys: ${Object.keys(response).join(',')}`);
                        throw new Error('Invalid response format: missing both encodedImage and operation');
                    }
                    // Update jobs for async polling
                    await prisma.genNormalJob.update({
                        where: { id: job.genNormalJob.id },
                        data: {
                            status: 'PROCESSING',
                            providerJobId: operationName,
                        }
                    });
                    if (job.queueJob.id !== currentQueueJobId) {
                        await prisma.queueJob.update({
                            where: { id: job.queueJob.id },
                            data: { status: 'completed', result: JSON.stringify({ success: true, operationName }) }
                        });
                    }
                    return { success: true, operationName, jobId: job.genNormalJob.id };
                }
            }
            catch (error) {
                const { briefVeo3Error } = await import('../../../services/veo3/veo3ErrorHandler.js');
                logger.error(`[ImageUpsamplingHandler] Job ${job.genNormalJob.id} failed`, briefVeo3Error(error));
                // 🔄 reCAPTCHA 403: xoay proxy + force-reset browser
                const errMsg = error?.message || '';
                const isRecaptcha403 = error?.isRecaptchaFailure === true
                    || errMsg.includes('PUBLIC_ERROR_UNUSUAL_ACTIVITY')
                    || errMsg.includes('reCAPTCHA evaluation failed');
                if (isRecaptcha403) {
                    const pid = job.genNormalJob.profileId || contextJob.profileId;
                    logger.warn(`[ImageUpsamplingHandler] 403 for ${pid.substring(0, 8)} → notify captcha + rotate proxy`);
                    try {
                        const { globalProxyManager } = await import('../../../lib/GlobalProxyManager.js');
                        await globalProxyManager.reportForbidden();
                        const { captchaManager } = await import('../../../lib/captchaManager.js');
                        captchaManager.notifyFailure();
                    }
                    catch (resetErr) {
                        logger.warn(`[ImageUpsamplingHandler] Reset failed: ${resetErr?.message ?? resetErr}`);
                    }
                }
                await prisma.genNormalJob.update({
                    where: { id: job.genNormalJob.id },
                    data: { status: 'FAILED', error: error.message }
                });
                if (job.queueJob.id !== currentQueueJobId) {
                    await prisma.queueJob.update({
                        where: { id: job.queueJob.id },
                        data: { status: 'failed', error: error.message }
                    });
                }
                throw error;
            }
        }));
        // Process results for current job (which triggered this execute)
        // Find result corresponding to THIS execution's job
        const myIndex = batchJobs.findIndex(j => j.queueJob.id === currentQueueJobId);
        const myResult = results[myIndex];
        if (myResult && myResult.status === 'fulfilled') {
            return myResult.value;
        }
        else if (myResult && myResult.status === 'rejected') {
            throw myResult.reason;
        }
        return { success: true, message: 'Batch processed' };
    }
    isRecaptchaError(error) {
        const msg = error.message || '';
        return msg.includes('reCAPTCHA') || msg.includes('recaptcha') || msg.includes('PERMISSION_DENIED')
            || msg.includes('grecaptcha');
    }
    /**
     * Override canRetry — reCAPTCHA errors should retry with longer delay
     */
    canRetry(job, error) {
        // Orphaned job (project deleted) — never retry
        if (error.message.includes('job not found') || error.message.includes('not found:')) {
            return false;
        }
        if (this.isRecaptchaError(error)) {
            return job.attempts < job.maxAttempts;
        }
        return super.canRetry(job, error);
    }
    /**
     * Captcha extension endpoint unreachable (Chrome/extension not running) —
     * don't count as real attempt; retry when extension comes back.
     */
    isTransientWait(error) {
        return error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed');
    }
    /**
     * Retry delay based on error type:
     * - 503 (service unavailable): 5s → 10s → 15s (transient, retry fast)
     * - reCAPTCHA / other: 30s → 60s → 120s (exponential backoff)
     */
    getRetryDelay(attempt, error) {
        if (error && (error.message.includes('503') || error.message.includes('UNAVAILABLE'))) {
            return Math.min(5000 * (attempt + 1), 15000); // 5s, 10s, 15s
        }
        return Math.min(30000 * Math.pow(2, attempt), 120000);
    }
}
// Per-profile in-flight counter — replaces the old single-slot FIFO mutex
// so the user can opt into N concurrent upscales per profile via
// `project.imageUpscaleConcurrency`. SQLite queue gates entry via
// canProcess (counter < limit); execute() increments synchronously before
// its first await and decrements in finally.
ImageUpsamplingHandler.inflightByProfile = new Map();
//# sourceMappingURL=ImageUpsamplingHandler.js.map