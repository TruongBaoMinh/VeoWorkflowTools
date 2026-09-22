export interface RemoteAuthUser {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    role: string;
    licenseKey?: string;
    licenseStatus?: string;
    licenseExpiry?: string;
}
/**
 * Remote Authentication Client
 * Verifies tokens and checks licenses with remote auth server
 */
export declare const remoteAuthClient: {
    /**
     * Verify access token with remote server
     */
    verifyToken(token: string): Promise<RemoteAuthUser | null>;
    /**
     * Validate license key with remote server
     */
    validateLicense(licenseKey: string, machineId: string, deviceId?: string): Promise<{
        valid: boolean;
        license?: {
            type: string;
            status: string;
            expiresAt: string | null;
            features: any;
        };
        error?: string;
    }>;
    /**
     * Get machine ID from remote server
     */
    getMachineId(): Promise<string>;
    /**
     * Login with credentials (redirect to remote server)
     * This should be handled by opening a browser window to remote auth server
     */
    getLoginUrl(callbackUrl?: string): string;
    /**
     * Exchange auth code for token (after OAuth callback)
     */
    exchangeAuthCode(code: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresAt: string;
        user: RemoteAuthUser;
    } | null>;
    /**
     * Refresh access token
     */
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresAt: string;
    } | null>;
    /**
     * Logout (invalidate tokens)
     */
    logout(token: string): Promise<boolean>;
    /**
     * Register device with remote server
     * Sends device info for tracking and license validation
     */
    registerDevice(params: {
        machineId: string;
        deviceName?: string;
        deviceInfo?: {
            platform?: string;
            arch?: string;
            hostname?: string;
            osVersion?: string;
        };
        token?: string;
    }): Promise<{
        success: boolean;
        device?: any;
        error?: string;
    }>;
};
//# sourceMappingURL=remoteAuth.d.ts.map