import type { FastifyRequest, FastifyReply } from 'fastify';
declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: string;
            email: string;
            name: string | null;
            role: string;
            active: boolean;
        };
    }
}
/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export declare function authenticateUser(request: FastifyRequest, reply: FastifyReply): Promise<never>;
/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export declare function optionalAuthenticateUser(request: FastifyRequest, reply: FastifyReply): Promise<void>;
/**
 * Role-based authorization middleware
 */
export declare function requireRole(...roles: string[]): (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
/**
 * Admin-only middleware
 */
export declare function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<never>;
//# sourceMappingURL=authMiddleware.d.ts.map