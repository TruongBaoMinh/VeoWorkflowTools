type ProfileCreateData = any;
type ProfileUpdateData = any;
export declare const profileRepository: {
    list(): Promise<Profile[]>;
    getById(id: string): Promise<Profile | null>;
    create(data: ProfileCreateData): Promise<any>;
    update(id: string, data: ProfileUpdateData): Promise<any>;
    delete(id: string): Promise<void>;
};
export {};
//# sourceMappingURL=profile.repository.d.ts.map