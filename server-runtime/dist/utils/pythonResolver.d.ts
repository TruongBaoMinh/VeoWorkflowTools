/**
 * Resolve Python binary across packaged Electron + dev modes.
 * Tries platform-specific bundled paths first, then any venv layout, then
 * falls back to system Python.
 */
export declare function resolvePythonBinary(): string | null;
/**
 * Resolve a Python script bundled with the server.
 */
export declare function resolvePythonScript(scriptName: string): string | null;
//# sourceMappingURL=pythonResolver.d.ts.map