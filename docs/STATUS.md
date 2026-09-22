# Status

## Done

- Created `D:\VeoWorkflowTools`.
- Copied backend runtime to `server-runtime`.
- Copied backend dependencies, Prisma schema/template DB, binaries, and Python helper scripts.
- Extracted Electron profile/browser bridge files to `desktop-extracted`.
- Added trimmed tools backend entry:
  - `server-runtime/tools-server.mjs`
- Removed the temporary standalone web UI.
- Extracted the original Veo3Studio renderer bundle from `app.asar`.
- Added standalone Electron desktop app:
  - `desktop-app/main.js`
  - `desktop-app/preload.js`
  - `desktop-app/renderer/`
- Packaged desktop app:
  - `D:\VeoWorkflowTools\release\VeoWorkflowTools-win32-x64\VeoWorkflowTools.exe`
- Added desktop launch script:
  - `scripts/launch-desktop.ps1`
- Added profile login bridge routes for the standalone tool:
  - `POST /api/tools/profiles/:id/login/start`
  - `POST /api/tools/profiles/:id/login/sync`
  - `POST /api/tools/profiles/:id/login/close`
  - `GET /api/tools/profiles/:id/login/status`
  - `GET /api/tools/login/status`
- Added local auth stubs for the copied renderer:
  - `GET /api/auth/me`
  - `GET /api/auth/verify`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `POST /api/auth/refresh`
- Added isolated runtime state:
  - DB: `D:\VeoWorkflowTools\data\veo-workflow-tools.db`
  - user data/logs: `D:\VeoWorkflowTools\user-data\veo3studio`
- Verified:
  - `GET /api/health`
  - `GET /api/auth/me`
  - `GET /api/profiles`
  - `GET /api/workflow`
  - temporary workflow create/update/delete
  - desktop dev app startup
  - packaged `.exe` startup

## Available Commands

```powershell
cd D:\VeoWorkflowTools
npm run server
```

```powershell
cd D:\VeoWorkflowTools
npm run health
```

Open UI:

```powershell
cd D:\VeoWorkflowTools
npm run app
```

Rebuild app:

```powershell
cd D:\VeoWorkflowTools
npm run app:pack
```

Full copied backend:

```powershell
cd D:\VeoWorkflowTools
npm run server:full
```

## Pending

- Trim navigation to only Workflow/Profile if desired.
- Add a batch runner screen later if you want batch workflows outside the original app.
