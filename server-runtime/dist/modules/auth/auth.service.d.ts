export interface AuthSession {
    id: string;
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    user: {
        id: string;
        email: string;
        name: string | null;
        role: string;
    };
}
export interface LoginResult {
    user: {
        id: string;
        email: string;
        name: string | null;
        role: string;
    };
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    sessionId: string;
}
/**
 * Authentication Service
 * Manages sessions and tokens on the backend server
 */
export declare class AuthService {
    /**
     * Login with email and password
     * Creates a session and stores tokens in database
     */
    login(email: string, password: string): Promise<LoginResult>;
    /**
     * Get current session by token
     */
    getSessionByToken(token: string): Promise<AuthSession | null>;
    /**
     * Refresh access token
     */
    refreshToken(refreshToken: string): Promise<LoginResult>;
    /**
     * Logout - delete session
     */
    logout(token: string): Promise<void>;
    /**
     * Get current user from session
     */
    getCurrentUser(token: string): Promise<AuthSession['user'] | null>;
    /**
     * Verify token and return user
     */
    verifyToken(token: string): Promise<AuthSession['user'] | null>;
    /**
     * Clean up expired sessions
     */
    cleanupExpiredSessions(): Promise<number>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map