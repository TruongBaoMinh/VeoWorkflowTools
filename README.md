# Veo Workflow Tools

This is a separated workspace for developing the Profile and Workflow parts of
the installed Veo3Studio app without editing the app in `C:\Program Files`.

## Layout

- `server-runtime/` - copied backend runtime from Veo3Studio.
- `desktop-app/` - standalone Electron shell using the original Veo3Studio renderer UI.
- `release/VeoWorkflowTools-win32-x64/` - packaged desktop app.
- `desktop-extracted/` - Electron main/preload files extracted from `app.asar`.
- `scripts/` - local helper scripts.
- `docs/` - notes for the split.

## First Run

Open PowerShell:

```powershell
cd D:\VeoWorkflowTools
.\scripts\start-server.ps1
```

Or:

```powershell
cd D:\VeoWorkflowTools
npm run server
```

To launch the backend in the background:

```powershell
cd D:\VeoWorkflowTools
npm run launch
```

Then in another PowerShell:

```powershell
cd D:\VeoWorkflowTools
.\scripts\health-check.ps1
```

Open the desktop app:

```powershell
cd D:\VeoWorkflowTools
npm run app
```

Or double-click:

```text
D:\VeoWorkflowTools\release\VeoWorkflowTools-win32-x64\VeoWorkflowTools.exe
```

By default the tools backend runs on `127.0.0.1:4100` and uses:

```text
D:\VeoWorkflowTools\data\veo-workflow-tools.db
```

The script also isolates server user data/logs under:

```text
D:\VeoWorkflowTools\user-data\veo3studio
```

The default start script uses the trimmed tools server:

```text
Desktop UI + Profile + Workflow + Workflow Batch + system health/status
```

To boot the full copied backend instead:

```powershell
.\scripts\start-server.ps1 -Full
```

## Current Status

The Profile and Workflow runtime now has a standalone desktop app on drive D.
The app uses the original Veo3Studio renderer bundle for the Workflow UI and
node editor logic, with a small Electron shell that points it at the tools
backend on port `4100`.

## Profile Login Flow

1. Open `D:\VeoWorkflowTools\release\VeoWorkflowTools-win32-x64\VeoWorkflowTools.exe`.
2. Go to `Profiles` / `Tài khoản Veo3`.
3. Create or edit a profile.
4. Click `Mở Chrome`.
5. Log in to `flow.google.com` in the opened Chrome window.
6. Click `Sync cookies`.
7. Click `Test` or `Auth status`.

Cookies are saved under:

```text
D:\VeoWorkflowTools\user-data\veo3studio\profile-cookies
```

To rebuild the desktop app:

```powershell
cd D:\VeoWorkflowTools
npm run app:pack
```
