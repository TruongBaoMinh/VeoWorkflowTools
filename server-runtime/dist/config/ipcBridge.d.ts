/**
 * IPC Bridge Configuration
 *
 * Centralized config for Electron IPC Bridge HTTP server.
 * Default port 9223 (next to CDP on 9222). On Windows, port 9223 may be held
 * by a zombie Electron from a prior crashed run — main.ts's startIpcBridge()
 * falls back to 9224..9230 and exports the chosen port via IPC_BRIDGE_PORT,
 * which we read here so the server's fetch targets the right port.
 */
export declare const IPC_BRIDGE_PORT: number;
export declare const IPC_BRIDGE_HOST = "127.0.0.1";
export declare const IPC_BRIDGE_URL: string;
//# sourceMappingURL=ipcBridge.d.ts.map