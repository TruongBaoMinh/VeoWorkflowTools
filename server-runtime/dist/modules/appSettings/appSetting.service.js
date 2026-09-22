import { prisma } from '../../lib/prisma.js';
import { BadRequestError } from '../../lib/errors.js';
const ALLOWED_KEYS = {
    gemini_api_key: {
        key: 'gemini_api_key',
        label: 'Gemini API Key',
        description: 'Google Gemini API key cho image/script generation.',
        docsUrl: 'https://aistudio.google.com/app/apikey',
        sensitive: true,
    },
};
function maskValue(value) {
    if (value.length <= 4)
        return '••••';
    if (value.length <= 12)
        return `${value.slice(0, 2)}${'•'.repeat(value.length - 4)}${value.slice(-2)}`;
    return `${value.slice(0, 4)}${'•'.repeat(8)}${value.slice(-4)}`;
}
function assertAllowed(key) {
    const meta = ALLOWED_KEYS[key];
    if (!meta)
        throw new BadRequestError(`Setting key không hợp lệ: ${key}`);
    return meta;
}
export const appSettingService = {
    listMeta() {
        return Object.values(ALLOWED_KEYS);
    },
    async get(key) {
        const meta = assertAllowed(key);
        const row = await prisma.appSetting.findUnique({ where: { key } });
        if (!row || !row.value) {
            return { key, configured: false, masked: null, updatedAt: null, meta };
        }
        return {
            key,
            configured: true,
            masked: meta.sensitive ? maskValue(row.value) : row.value,
            updatedAt: row.updatedAt.toISOString(),
            meta,
        };
    },
    async set(key, value) {
        const meta = assertAllowed(key);
        const trimmed = value.trim();
        if (!trimmed)
            throw new BadRequestError('Giá trị không được để trống');
        await prisma.appSetting.upsert({
            where: { key },
            update: { value: trimmed },
            create: { key, value: trimmed },
        });
        const row = await prisma.appSetting.findUnique({ where: { key } });
        return {
            key,
            configured: true,
            masked: meta.sensitive ? maskValue(trimmed) : trimmed,
            updatedAt: row?.updatedAt.toISOString() ?? new Date().toISOString(),
            meta,
        };
    },
    async clear(key) {
        const meta = assertAllowed(key);
        await prisma.appSetting.deleteMany({ where: { key } });
        return { key, configured: false, masked: null, updatedAt: null, meta };
    },
};
//# sourceMappingURL=appSetting.service.js.map