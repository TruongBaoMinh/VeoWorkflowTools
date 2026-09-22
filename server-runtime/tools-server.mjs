import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { initializeDatabase } from './dist/database/initialize.js';
import { logger } from './dist/lib/logger.js';
import { config } from './dist/lib/config.js';
import { errorHandler } from './dist/middleware/errorHandler.js';
import { requestLogger } from './dist/middleware/requestLogger.js';
import { warmUpTlsClient } from './dist/lib/tlsClient.js';

import { registerCaptchaBridgeRoutes } from './dist/modules/captcha/captchaBridge.js';
import { registerProfileRoutes } from './dist/modules/profiles/profile.routes.js';
import { registerSystemRoutes } from './dist/routes/system.routes.js';
import { registerWorkflowRoutes } from './dist/modules/workflow/workflow.routes.js';
import { registerWorkflowBatchRoutes } from './dist/modules/workflow/workflow.batch.routes.js';
import { profileService } from './dist/modules/profiles/profile.service.js';
import { workflowService } from './dist/modules/workflow/workflow.service.js';
import { workflowBatchOrchestrator } from './dist/modules/workflow/workflow.batch.orchestrator.js';

const SERVER_ROOT = path.dirname(fileURLToPath(import.meta.url));
const TOOLS_ROOT = path.resolve(SERVER_ROOT, '..');
const UI_ROOT = path.join(TOOLS_ROOT, 'ui');
const FLOW_LOGIN_URL = 'https://flow.google.com/';
const ACTIVE_PROFILE_LOGINS = new Map();

function contentTypeFor(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
}

async function sendUiFile(reply, filePath) {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(UI_ROOT))) {
    return reply.code(403).send({ error: 'Forbidden' });
  }
  if (!fs.existsSync(resolved)) {
    return reply.code(404).send({ error: 'UI file not found' });
  }
  return reply.type(contentTypeFor(resolved)).send(fs.createReadStream(resolved));
}

function registerUiRoutes(app) {
  app.get('/', async (_request, reply) => sendUiFile(reply, path.join(UI_ROOT, 'index.html')));
  app.get('/app.css', async (_request, reply) => sendUiFile(reply, path.join(UI_ROOT, 'app.css')));
  app.get('/app.js', async (_request, reply) => sendUiFile(reply, path.join(UI_ROOT, 'app.js')));
}

function getWindowsAppDataRoot() {
  if (process.platform === 'win32') {
    return process.env.APPDATA ?? path.join(os.homedir(), 'AppData', 'Roaming');
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support');
  }
  return process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), '.config');
}

function getToolsUserDataDir() {
  return path.join(getWindowsAppDataRoot(), 'veo3studio');
}

function getProfileCookieSnapshotPath(profileId) {
  return path.join(getToolsUserDataDir(), 'profile-cookies', `${profileId}.json`);
}

function getProfileChromeUserDataDir(profileId) {
  return path.join(TOOLS_ROOT, 'user-data', 'tools-chrome-profiles', profileId);
}

function findChromePath() {
  const envPath = process.env.CHROME_PATH || process.env.GOOGLE_CHROME_SHIM;
  const candidates = [
    envPath,
    process.platform === 'win32'
      ? path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe')
      : null,
    process.platform === 'win32'
      ? path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google', 'Chrome', 'Application', 'chrome.exe')
      : null,
    process.platform === 'win32'
      ? path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'Google', 'Chrome', 'Application', 'chrome.exe')
      : null,
    process.platform === 'win32'
      ? path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Microsoft', 'Edge', 'Application', 'msedge.exe')
      : null,
    process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : null,
    process.platform === 'linux' ? '/usr/bin/google-chrome' : null,
    process.platform === 'linux' ? '/usr/bin/chromium-browser' : null,
    process.platform === 'linux' ? '/usr/bin/chromium' : null,
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

async function waitForDebugPort(port, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) {
        return true;
      }
    } catch (err) {
      lastError = err;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  if (lastError) {
    throw lastError;
  }
  return false;
}

async function getDebugVersion(port) {
  const response = await fetch(`http://127.0.0.1:${port}/json/version`);
  if (!response.ok) {
    throw new Error(`Chrome debug endpoint returned ${response.status}`);
  }
  return response.json();
}

function sendCdpCommand(webSocketUrl, method, params = {}) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(webSocketUrl);
    const id = 1;
    const timeout = setTimeout(() => {
      try {
        ws.close();
      } catch {
        /* ignore */
      }
      reject(new Error(`CDP command timed out: ${method}`));
    }, 10000);

    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ id, method, params }));
    });

    ws.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(String(event.data));
        if (message.id !== id) return;
        clearTimeout(timeout);
        ws.close();
        if (message.error) {
          reject(new Error(message.error.message || `CDP command failed: ${method}`));
          return;
        }
        resolve(message.result || {});
      } catch (err) {
        clearTimeout(timeout);
        ws.close();
        reject(err);
      }
    });

    ws.addEventListener('error', () => {
      clearTimeout(timeout);
      reject(new Error(`Could not connect to Chrome debug WebSocket for ${method}`));
    });
  });
}

async function getAllCookiesFromDebugPort(port) {
  const version = await getDebugVersion(port);
  const wsUrl = version.webSocketDebuggerUrl;
  if (!wsUrl) {
    throw new Error('Chrome debug endpoint did not return webSocketDebuggerUrl');
  }
  try {
    const result = await sendCdpCommand(wsUrl, 'Network.getAllCookies');
    return result.cookies || [];
  } catch (firstErr) {
    logger.warn(`[ToolsLogin] Network.getAllCookies failed, trying Storage.getCookies: ${firstErr?.message ?? String(firstErr)}`);
    const result = await sendCdpCommand(wsUrl, 'Storage.getCookies');
    return result.cookies || [];
  }
}

function normalizeCookie(cookie) {
  const normalized = {
    name: cookie.name,
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path || '/',
    secure: Boolean(cookie.secure),
    httpOnly: Boolean(cookie.httpOnly),
  };
  if (cookie.sameSite) {
    normalized.sameSite = cookie.sameSite;
  }
  const expiry = Number(cookie.expirationDate ?? cookie.expires);
  if (Number.isFinite(expiry) && expiry > 0) {
    normalized.expirationDate = expiry;
  }
  return normalized;
}

function hasFlowSessionCookie(cookies) {
  return cookies.some((cookie) => {
    const name = String(cookie.name || '');
    const domain = String(cookie.domain || '').replace(/^\./, '');
    const sessionName =
      name === '__Secure-next-auth.session-token' ||
      name.startsWith('__Secure-next-auth.session-token.');
    const sessionDomain =
      domain === 'labs.google' ||
      domain.endsWith('.labs.google') ||
      domain === 'flow.google.com' ||
      domain.endsWith('.flow.google.com');
    return sessionName && sessionDomain;
  });
}

function summarizeLogin(profileId, state) {
  return {
    profileId,
    active: Boolean(state),
    startedAt: state?.startedAt ?? null,
    port: state?.port ?? null,
    userDataDir: state?.userDataDir ?? null,
  };
}

async function syncProfileCookies(profileId) {
  const state = ACTIVE_PROFILE_LOGINS.get(profileId);
  if (!state) {
    const err = new Error('Chrome login window is not active for this profile');
    err.statusCode = 400;
    throw err;
  }

  const rawCookies = await getAllCookiesFromDebugPort(state.port);
  const cookies = rawCookies.map(normalizeCookie);
  const snapshotPath = getProfileCookieSnapshotPath(profileId);
  fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
  fs.writeFileSync(snapshotPath, JSON.stringify(cookies, null, 2), 'utf8');
  await profileService
    .update(profileId, { cookies: JSON.stringify(cookies) })
    .catch((err) =>
      logger.warn(`[ToolsLogin] Could not persist cookie JSON for ${profileId}: ${err?.message ?? String(err)}`),
    );

  return {
    success: true,
    profileId,
    count: cookies.length,
    hasFlowSession: hasFlowSessionCookie(cookies),
    snapshotPath,
    names: cookies.map((cookie) => cookie.name).slice(0, 30),
  };
}

function registerToolsRoutes(app) {
  const demoUser = {
    id: 'tools-local-user',
    email: 'tester@test.local',
    name: 'tester',
    displayName: 'tester',
    role: 'tester',
  };
  const authPayload = () => ({
    success: true,
    authenticated: true,
    isAuthenticated: true,
    user: demoUser,
    tokens: {
      accessToken: 'tools-local-token',
      refreshToken: 'tools-local-refresh-token',
    },
    token: 'tools-local-token',
    accessToken: 'tools-local-token',
    refreshToken: 'tools-local-refresh-token',
    licenseKey: 'tools-local-license',
    deviceId: 'tools-local-device',
  });

  app.post('/api/auth/login', async () => authPayload());

  app.post('/api/auth/logout', async () => authPayload());
  app.post('/api/auth/refresh', async () => authPayload());
  app.get('/api/auth/me', async () => demoUser);
  app.get('/api/auth/verify', async () => ({ success: true, user: demoUser }));

  app.get('/api/tools/login/status', async () => ({
    success: true,
    sessions: [...ACTIVE_PROFILE_LOGINS.entries()].map(([profileId, state]) =>
      summarizeLogin(profileId, state),
    ),
  }));

  app.get('/api/tools/profiles/:id/login/status', async (request) => {
    const { id } = request.params;
    return { success: true, ...summarizeLogin(id, ACTIVE_PROFILE_LOGINS.get(id)) };
  });

  app.post('/api/tools/profiles/:id/login/start', async (request, reply) => {
    const { id } = request.params;
    const existing = ACTIVE_PROFILE_LOGINS.get(id);
    if (existing) {
      return reply.send({ success: true, reused: true, ...summarizeLogin(id, existing) });
    }

    const chromePath = findChromePath();
    if (!chromePath) {
      return reply.code(500).send({
        success: false,
        error: 'Cannot find Chrome or Edge. Set CHROME_PATH in the tools environment.',
      });
    }

    const port = await getFreePort();
    const userDataDir = getProfileChromeUserDataDir(id);
    fs.mkdirSync(userDataDir, { recursive: true });

    const args = [
      `--remote-debugging-port=${port}`,
      '--remote-debugging-address=127.0.0.1',
      `--user-data-dir=${userDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-default-apps',
      '--disable-sync',
      '--window-size=1280,900',
      FLOW_LOGIN_URL,
    ];

    const child = spawn(chromePath, args, {
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    });
    child.unref();

    const state = {
      proc: child,
      port,
      userDataDir,
      startedAt: new Date().toISOString(),
    };
    ACTIVE_PROFILE_LOGINS.set(id, state);
    child.once('exit', () => ACTIVE_PROFILE_LOGINS.delete(id));

    let debugReady = false;
    try {
      debugReady = await waitForDebugPort(port);
    } catch (err) {
      logger.warn(`[ToolsLogin] Chrome debug port not ready for ${id}: ${err?.message ?? String(err)}`);
    }

    return reply.send({
      success: true,
      reused: false,
      debugReady,
      chromePath,
      ...summarizeLogin(id, state),
    });
  });

  app.post('/api/tools/profiles/:id/login/sync', async (request, reply) => {
    const { id } = request.params;
    try {
      return reply.send(await syncProfileCookies(id));
    } catch (err) {
      return reply.code(err.statusCode ?? 500).send({
        success: false,
        error: err?.message ?? String(err),
      });
    }
  });

  app.post('/api/tools/profiles/:id/login/close', async (request, reply) => {
    const { id } = request.params;
    const state = ACTIVE_PROFILE_LOGINS.get(id);
    if (state?.proc && !state.proc.killed) {
      state.proc.kill();
    }
    ACTIVE_PROFILE_LOGINS.delete(id);
    return reply.send({ success: true, profileId: id });
  });
}

function buildToolsServer() {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL || 'info' },
    disableRequestLogging: true,
    bodyLimit: 50 * 1024 * 1024,
    pluginTimeout: 30000,
  });

  app.register(cors, { origin: true });
  app.addHook('onRequest', requestLogger);
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
    const raw = typeof body === 'string' ? body : body.toString('utf8');
    if (!raw || raw.trim().length === 0) {
      done(null, undefined);
      return;
    }
    try {
      done(null, JSON.parse(raw));
    } catch (err) {
      done(err, undefined);
    }
  });

  app.get('/health', async () => ({ status: 'ok', mode: 'tools', timestamp: new Date().toISOString() }));
  app.get('/api/health', async () => ({ status: 'ok', mode: 'tools', timestamp: new Date().toISOString() }));

  registerUiRoutes(app);
  registerToolsRoutes(app);

  app.register(registerCaptchaBridgeRoutes);
  app.register(registerProfileRoutes);
  app.register(registerSystemRoutes);
  app.register(registerWorkflowRoutes);
  app.register(registerWorkflowBatchRoutes);

  app.setErrorHandler(errorHandler);
  return app;
}

async function start() {
  try {
    logger.info('[ToolsServer] Starting Veo Workflow Tools backend...');

    await initializeDatabase();
    await config.init();

    warmUpTlsClient();
    await workflowService
      .rehydrateRunningRuns()
      .catch((err) => logger.warn('[ToolsServer] Workflow rehydrate skipped:', err));
    await workflowBatchOrchestrator
      .rehydrate()
      .catch((err) => logger.warn('[ToolsServer] Batch rehydrate skipped:', err));

    const app = buildToolsServer();
    const port = Number(process.env.PORT) || 4100;
    const host = process.env.HOST || '127.0.0.1';
    await app.listen({ port, host });
    logger.info(`[ToolsServer] Listening on http://${host}:${port}`);

    const shutdown = async (signal) => {
      logger.info(`[ToolsServer] ${signal} received, shutting down`);
      await app.close().catch(() => {});
      process.exit(0);
    };
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  } catch (err) {
    logger.error('[ToolsServer] Failed to start', { error: err });
    process.exit(1);
  }
}

void start();
