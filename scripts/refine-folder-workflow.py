from pathlib import Path
r=Path(__file__).resolve().parent.parent/'full-source-app/apps/server/src'
p=r/'modules/workflow/nodes/builtinExecutors.js'
s=p.read_text(encoding='utf-8').replace("imagePaths, imageDataUrl", "imagePaths, imageDataUrl, localImagePath").replace("import { pathToFileURL } from 'node:url';\n",'')
a=s.index('const uploadImageExecutor ='); b=s.index('const mergeVideoExecutor =',a)
s=s[:a]+'''const uploadImageExecutor = {
    type: 'upload-image', version: 1,
    async execute({ data, resolved, provider, projectId, isCancelled }) {
        const incoming = resolved.imageResults ?? [];
        const sources = incoming.length ? incoming : imagePaths(data.localPaths?.length ? data.localPaths : data.localPath)
            .map(file => ({ url: `file://${file}`, kind: 'image' }));
        if (sources.length > 8) throw new NonRetryableNodeError('Upload Image: tối đa 8 ảnh.', { code: 'IMAGE_INPUT_LIMIT' });
        for (const source of sources) {
            if (!source.url) throw new NonRetryableNodeError('Ảnh thiếu URL.', { code: 'IMAGE_URL_MISSING' });
            if (source.url.startsWith('file://')) await imageDataUrl(source.url);
        }
        const results = [];
        for (const source of sources) {
            if (isCancelled?.()) throw new Error('Run was cancelled');
            let temporary = null;
            try {
                const local = source.url.startsWith('file://') ? localImagePath(source.url)
                    : (temporary = await downloadImageToTemp(source.url, 'upload-image'));
                const mediaId = await provider.uploadImageAndExtractMediaId(local, projectId);
                results.push({ mediaId, url: source.url, kind: 'image', referenceRole: data.referenceRole || source.referenceRole || 'garment' });
            } finally {
                if (temporary) await unlink(temporary).catch(() => {});
            }
        }
        return { results };
    },
};

'''+s[b:]; p.write_text(s,encoding='utf-8')
p=r/'modules/workflow/lib/saveMedia.js';s=p.read_text(encoding='utf-8').replace("import { pathToFileURL } from 'node:url';\n",'').replace("destination + '.part'", "path.join(folder, `${String(index + 1).padStart(2, '0')}.part${ext}`)").replace('url: pathToFileURL(destination).href','url: `file://${destination}`');p.write_text(s,encoding='utf-8')
print('Refined multi-reference upload and media compatibility')
