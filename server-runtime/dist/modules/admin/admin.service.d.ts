export interface SystemStats {
    jobs: {
        total: number;
        byStatus: Record<string, number>;
        last24Hours: number;
        successRate: number;
    };
    profiles: {
        total: number;
        active: number;
        utilizationPercent: number;
    };
}
export declare const adminService: {
    getSystemStats(): Promise<SystemStats>;
};
//# sourceMappingURL=admin.service.d.ts.map