/**
 * Directory initialization utilities
 * Cross-platform directory creation with proper error handling
 */
/**
 * Safely create directory with recursive option
 * Works on Windows, macOS, and Linux
 * Enhanced error handling for first-run scenarios
 */
export declare function ensureDirectoryExists(dirPath: string): boolean;
/**
 * Initialize all default directories on server startup
 * In production (packaged app), use user data directory (no admin required)
 * In development, use project directory
 */
export declare function initializeDefaultDirectories(): void;
/**
 * Get base directory for server data
 * In production: User data directory (no admin required)
 * In development: Project directory
 */
export declare function getBaseDirectory(): string;
/**
 * Get app data directory based on platform
 * Returns platform-specific user data directory
 * Enhanced for Windows first-run scenarios
 */
export declare function getAppDataDirectory(): string;
//# sourceMappingURL=directoryInit.d.ts.map