# Split Manifest

## Copied Backend Runtime

Source:

```text
C:\Program Files\Veo3Studio\resources\server
```

Destination:

```text
D:\VeoWorkflowTools\server-runtime
```

Copied folders:

- `dist`
- `node_modules`
- `prisma`
- `binaries`
- `python`
- `package.json`

## Extracted Electron Files

Source:

```text
C:\Program Files\Veo3Studio\resources\app.asar
```

Destination:

```text
D:\VeoWorkflowTools\desktop-extracted
```

Important files:

- `apps/electron/dist/main/systemBrowserLogin.js`
- `apps/electron/dist/main/profileBrowserManager.js`
- `apps/electron/dist/main/ipcBridge.js`
- `apps/electron/dist/main/ipcHandlers.js`
- `apps/electron/dist/preload/index.js`
- `apps/electron/dist/main/serverManager.js`

## Profile Feature Surface

Backend APIs:

- `GET /api/profiles`
- `POST /api/profiles`
- `PUT /api/profiles/:id`
- `DELETE /api/profiles/:id`
- `GET /api/profiles/:id`
- `GET /api/profiles/:id/auth-status`
- `POST /api/profiles/:id/test`
- `POST /api/profiles/:id/refresh-token`
- `POST /api/profiles/:id/clone`
- `POST /api/profiles/test-proxy`
- `POST /api/profiles/:id/refresh-account-info`

Electron APIs used by the current UI:

- `profileOpenRealChrome`
- `profileCloseRealChrome`
- `profileGetSessionCookies`
- `profileGetCookiesFromPartition`
- `profileResetProxyState`
- `onProfileRealChromeLoginComplete`
- `onProfileRealChromeLoginTimeout`
- `onProfileCookiesSynced`

## Workflow Feature Surface

Backend APIs:

- `GET /api/workflow`
- `POST /api/workflow`
- `GET /api/workflow/:id`
- `PUT /api/workflow/:id`
- `DELETE /api/workflow/:id`
- `POST /api/workflow/:id/run`
- `GET /api/workflow/runs/:runId`
- `POST /api/workflow/runs/:runId/cancel`
- `GET /api/workflow/runs/:runId/events`
- `GET /api/workflow/:id/batch-schema`
- `POST /api/workflow/batch`
- `POST /api/workflow/batch/:batchId/start`
- `GET /api/workflow/batch/:batchId/poll`

Core backend modules:

- `modules/workflow/workflow.routes.js`
- `modules/workflow/workflow.service.js`
- `modules/workflow/workflow.engine.js`
- `modules/workflow/workflow.repository.js`
- `modules/workflow/workflow.batch.*.js`

## Next Porting Step

Create a clean Electron shell that starts `server-runtime/dist/index.js`, hosts a
new React UI, and wires only the profile/browser bridge APIs needed by Profile
and Workflow.

The current default server entry is:

```text
D:\VeoWorkflowTools\server-runtime\tools-server.mjs
```

Runtime state from `scripts/start-server.ps1` is isolated with:

```text
APPDATA=D:\VeoWorkflowTools\user-data
DATABASE_URL=file:D:/VeoWorkflowTools/data/veo-workflow-tools.db
```

It registers only:

- captcha bridge/status route surface needed by workflow readiness
- profile routes
- system status routes
- workflow routes
- workflow batch routes
