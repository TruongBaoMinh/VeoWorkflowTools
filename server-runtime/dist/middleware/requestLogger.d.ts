import type { FastifyReply, FastifyRequest } from 'fastify';
/**
 * Request logging middleware
 * Logs incoming requests and responses with timing
 * Excludes frequently polled endpoints to reduce log noise
 */
export declare function requestLogger(request: FastifyRequest, reply: FastifyReply): Promise<void>;
//# sourceMappingURL=requestLogger.d.ts.map