import { storyId } from './storyScenes.js';

// One nonempty line is one scene. Optional prefix: SC001 | prompt with @AN.
export function parsePromptLines(text) {
    if (typeof text !== 'string' || text.length > 1000000) throw new Error('Danh sách prompt không hợp lệ hoặc quá dài.');
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (!lines.length || lines.length > 500) throw new Error('Nhập từ 1 đến 500 prompt, mỗi dòng một cảnh.');
    const seen = new Set();
    return lines.map((line, index) => {
        const match = line.match(/^([A-Za-z0-9_-]+)\s*\|\s*(.+)$/);
        const scene_id = match ? match[1] : `SC${String(index + 1).padStart(3, '0')}`;
        storyId(scene_id);
        if (seen.has(scene_id)) throw new Error(`Trùng mã cảnh ${scene_id}`);
        seen.add(scene_id);
        const prompt_en = match ? match[2] : line;
        const visible_character_ids = [...new Set([...prompt_en.matchAll(/@([A-Za-z][A-Za-z0-9_]*)/g)].map(m => m[1]))];
        return { scene_id, prompt_en, visible_character_ids };
    });
}

export function normalizePromptWorkflow(definition) {
    const def = structuredClone(definition);
    const input = def.nodes.find(n => n.type === 'story-input');
    const refs = def.nodes.find(n => n.type === 'story-references');
    if (!input || !refs) throw new Error('Cần node prompt và node nhân vật.');
    const legacy = input.data.document || refs.data.document;
    const characters = refs.data.characters ?? legacy?.characters ?? [];
    const commonStyle = refs.data.sharedStyle ?? refs.data.characterStyle ?? legacy?.style?.style_prompt_en ?? '';
    if (!commonStyle.trim()) throw new Error('Nhập style chung ở node nhân vật.');
    const style = { ...(legacy?.style || {}), style_id: legacy?.style?.style_id || 'SHARED_STYLE', reference_key: legacy?.style?.reference_key || 'STYLE_SHARED', style_prompt_en: commonStyle };
    if (input.data.promptText === undefined) {
        if (!legacy) throw new Error('Chưa nhập prompt.');
        input.data.document = { ...legacy, characters, style };
    } else {
        const scenes = parsePromptLines(input.data.promptText).map(scene => {
            const outfit_by_character = {}, reference_bindings = [];
            for (const id of scene.visible_character_ids) {
                const matches = characters.filter(c => c.character_id === id);
                if (matches.length !== 1) throw new Error(`Cảnh ${scene.scene_id}: mã @${id} chưa có hoặc bị trùng trong node nhân vật.`);
                const c = matches[0], outfit = c.outfits?.[0];
                if (!outfit) throw new Error(`Nhân vật ${id} thiếu cấu hình trang phục.`);
                outfit_by_character[id] = outfit.outfit_id;
                reference_bindings.push({ role:'character', character_id:id, outfit_id:outfit.outfit_id, reference_key:outfit.reference_key || c.reference_key });
            }
            reference_bindings.push({ role:'style', reference_key:style.reference_key });
            return { ...scene, outfit_by_character, reference_bindings, style_id:style.style_id };
        });
        input.data.document = { schema_version:'story-prompts/v1', timing_mode:'none', title:legacy?.title || 'Bộ ảnh từ prompt', characters, style,
            aspect_ratio: input.data.aspectRatio || legacy?.aspect_ratio || '16:9', scenes };
        input.data.srtText = '';
    }
    refs.data.characterStyle = commonStyle;
    refs.data.document = input.data.document;
    return def;
}
