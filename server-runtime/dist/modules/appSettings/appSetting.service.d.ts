export interface AppSettingMeta {
    key: string;
    label: string;
    description?: string;
    docsUrl?: string;
    sensitive: boolean;
}
export interface AppSettingState {
    key: string;
    configured: boolean;
    masked: string | null;
    updatedAt: string | null;
    meta: AppSettingMeta;
}
export declare const appSettingService: {
    listMeta(): AppSettingMeta[];
    get(key: string): Promise<AppSettingState>;
    set(key: string, value: string): Promise<AppSettingState>;
    clear(key: string): Promise<AppSettingState>;
};
//# sourceMappingURL=appSetting.service.d.ts.map