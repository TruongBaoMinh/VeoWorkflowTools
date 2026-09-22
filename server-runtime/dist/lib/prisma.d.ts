import { PrismaClient } from '@prisma/client';
declare global {
    var __prismaClient: PrismaClient | undefined;
    var __prismaInitialized: boolean | undefined;
}
/**
 * Mark Prisma as initialized (called after database setup)
 */
export declare function markPrismaInitialized(): void;
/**
 * Check if Prisma has been initialized
 */
export declare function isPrismaInitialized(): boolean;
export declare const prisma: PrismaClient;
//# sourceMappingURL=prisma.d.ts.map