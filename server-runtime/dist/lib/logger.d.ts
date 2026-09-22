import winston from 'winston';
export declare function runtimeVerboseLogsEnabled(): boolean;
export declare const logger: winston.Logger;
/**
 * Categorized logger helpers
 */
export declare const categorizedLogger: {
    queue: (level: string, message: string, meta?: any) => winston.Logger;
    job: (level: string, message: string, meta?: any) => winston.Logger;
    profile: (level: string, message: string, meta?: any) => winston.Logger;
    script: (level: string, message: string, meta?: any) => winston.Logger;
    provider: (level: string, message: string, meta?: any) => winston.Logger;
    system: (level: string, message: string, meta?: any) => winston.Logger;
    db: (level: string, message: string, meta?: any) => winston.Logger;
};
export declare const log: {
    debug: (message: string, meta?: any) => winston.Logger;
    info: (message: string, meta?: any) => winston.Logger;
    warn: (message: string, meta?: any) => winston.Logger;
    error: (message: string, meta?: any) => winston.Logger;
};
//# sourceMappingURL=logger.d.ts.map