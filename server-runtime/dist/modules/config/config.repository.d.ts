export interface AppSettingRecord {
    key: string;
    value: string;
}
export declare const configRepository: {
    getAll(): Promise<AppSettingRecord[]>;
    upsert(settings: AppSettingRecord[]): Promise<void>;
};
//# sourceMappingURL=config.repository.d.ts.map