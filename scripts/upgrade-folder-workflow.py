from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'full-source-app'
def edit(relative, old, new, count=1):
    p = ROOT / relative
    text = p.read_text(encoding='utf-8')
    if text.count(old) < count: raise RuntimeError(f'Missing anchor: {relative}: {old[:80]}')
    p.write_text(text.replace(old, new, count), encoding='utf-8')

base = 'apps/server/src/modules/workflow/'
edit(base+'workflow.batch.orchestrator.js', "import path from 'node:path';", "import path from 'node:path';\nimport { imagePaths } from './lib/imageInputs.js';\nimport { saveMediaBundle } from './lib/saveMedia.js';")
edit(base+'workflow.batch.orchestrator.js', "input.batchInputType === 'text' ? { prompt: value } : { localPath: value };", "input.batchInputType === 'text' ? { prompt: value } : { localPath: imagePaths(value)[0], localPaths: imagePaths(value) };")
p = ROOT / (base+'workflow.batch.orchestrator.js')
s = p.read_text(encoding='utf-8')
start = s.index('    async downloadOutputs(')
end = s.index('    /** Compute + persist', start)
s = s[:start] + '''    async downloadOutputs(batch, def, schema, run, item) {
        const results = schema.outputs.flatMap(output => run.nodeStates[output.nodeId]?.results ?? []);
        const prompts = Object.values(run.nodeStates).flatMap(state => state.textValues ?? (state.textValue ? [state.textValue] : []));
        const imageInput = schema.inputs.find(input => input.batchInputType === 'image');
        const source = imageInput && item.inputValues[imageInput.batchKey];
        let product = `row_${padRow(item.rowIndex)}`;
        if (source) {
            const files = imagePaths(source);
            product += '_' + (String(source).trim().startsWith('[') ? path.basename(path.dirname(files[0])) : path.parse(files[0]).name);
        }
        const saved = await saveMediaBundle({ outputDir: batch.outputDir, productId: product, results, prompts,
            metadata: { batchId: batch.id, runId: run.id, rowIndex: item.rowIndex, inputValues: item.inputValues,
                promptSettings: def.nodes.filter(n => n.type === 'ai-prompt').map(n => ({
                    nodeId: n.id, systemMessage: n.data.systemMessage, prompt: n.data.prompt, model: n.data.model,
                })) } });
        return saved.map(result => result.savedPath);
    },
''' + s[end:]
p.write_text(s, encoding='utf-8')
edit(base+'workflow.engine.js', "const isReference = imageMode === 'reference' || imageMode === 'image-to-image';", """const isReference = imageMode === 'reference' || imageMode === 'image-to-image';
                if (!prompt.trim()) throw new NonRetryableError('Generate Image: prompt trống. Kiểm tra node AI Gen Prompt.');
                if (isReference && (!refMediaIds.length || refMediaIds.length !== resolved.imageResults.length))
                    throw new NonRetryableError('Generate Image: thiếu ảnh tham chiếu đã upload. Nối Upload Image vào cổng ảnh.');""")

ui = 'apps/renderer/dist/assets/index-DhSC5-9k.js'
edit(ui, '  "ai-prompt": AI8,', '  "ai-prompt": AI8,\n  "save-images": SaveImagesNode,')
edit(ui, '    "ai-prompt",', '    "ai-prompt",\n    "save-images",')
edit(ui, '  "ai-prompt": {', '  "save-images": { outputDir: "", productName: "product", results: [], runStatus: "idle" },\n  "ai-prompt": {')
edit(ui, '    maxTokens: 1000,', '    maxTokens: 4000,')
edit(ui, '      type: "result",\n      label:', '      type: "save-images", label: "Save Images / Lưu ảnh", Icon: hn, color: un.image, group: "Output",\n    },\n    {\n      type: "result",\n      label:')
edit(ui, 'function AI8({ id: t, data: s }) {', '''function PromptPresetControls({ id, data, disabled }) {
  const { updateNodeData } = fs(), toast = oc();
  const [name, setName] = u.useState("Etsy"), [version, setVersion] = u.useState(0);
  let presets = {}; try { presets = JSON.parse(localStorage.getItem("workflow:prompt-presets") || "{}"); } catch {}
  return e.jsxs("div", { className: "nodrag nowheel my-2 space-y-1", children: [
    e.jsx("input", { className: Xf, value: name, disabled, placeholder: "Tên preset", onChange: ev => setName(ev.target.value) }),
    e.jsx("button", { className: Xf, disabled: disabled || !name.trim(), children: "Lưu master prompt thành preset", onClick: () => {
      try { localStorage.setItem("workflow:prompt-presets", JSON.stringify({ ...presets, [name.trim()]: {
        systemMessage: data.systemMessage || "", prompt: data.prompt || "", model: data.model || "", maxTokens: data.maxTokens || 4000
      } })); setVersion(version + 1); toast.success("Đã lưu preset"); } catch { toast.error("Không lưu được preset"); }
    } }),
    e.jsxs("select", { className: Xf, disabled, value: "", onChange: ev => { const preset = presets[ev.target.value]; if(preset) { updateNodeData(id, preset); setName(ev.target.value); } }, children: [
      e.jsx("option", { value: "", children: "Nạp preset đã lưu…" }), ...Object.keys(presets).map(key => e.jsx("option", { value: key, children: key }, key))
    ] })
  ] });
}
function SaveImagesNode({ id, data }) {
  const { updateNodeData } = fs(), toast = oc();
  const disabled = data.runStatus === "running" || data.runStatus === "queued";
  return e.jsxs(Xs, { id, title: "Save Images", accent: "image", status: data.runStatus || "idle", width: 280, children: [
    e.jsx(Kt, { id: Ut.imageIn, kind: "image", type: "target", position: _e.Left, top: 42, label: "ảnh cần lưu" }),
    e.jsx(Kt, { id: Ut.textIn, kind: "text", type: "target", position: _e.Left, top: 68, label: "prompt cần lưu" }),
    e.jsx("button", { className: Xf, disabled, children: "Chọn folder lưu ảnh", onClick: async () => {
      try { const folder = await window.electronAPI.selectFolder(); if (!folder.canceled && folder.path) updateNodeData(id, { outputDir: folder.path }); } catch { toast.error("Không chọn được folder"); }
    } }),
    e.jsx("input", { className: Xf, disabled, placeholder: "Đường dẫn folder đầu ra", value: data.outputDir || "", onChange: ev => updateNodeData(id, { outputDir: ev.target.value }) }),
    e.jsx("input", { className: Xf, disabled, placeholder: "Tên sản phẩm", value: data.productName || "", onChange: ev => updateNodeData(id, { productName: ev.target.value }) }),
    e.jsx("p", { className: "text-xs", children: "Lưu ảnh + prompts.txt + manifest.json, không ghi đè. Batch có thể tự lưu mà không cần node này." }),
    data.error && e.jsx("p", { role: "alert", className: "text-xs text-red-500", children: data.error }),
    e.jsx("p", { className: "text-xs", children: (data.results || []).map(r => r.savedPath).filter(Boolean).join("\\n") }),
    e.jsx(Bi, { id, data, role: "output", defaultLabel: "Ảnh đã lưu" }),
    e.jsx(Kt, { id: Ut.imageOut, kind: "image", type: "source", position: _e.Right, label: "ảnh đã lưu" })
  ] });
}
function AI8({ id: t, data: s }) {''')
# Work only inside the AI node function, avoiding unrelated components.
p = ROOT / ui
s = p.read_text(encoding='utf-8'); start=s.index('function AI8('); end=s.index('function _8(',start)
part=s[start:end]
part=part.replace('    children: [', '''    children: [
      e.jsx(Kt, { id: Ut.imageIn, kind: "image", type: "target", position: _e.Left, top: 72, label: "ảnh tham chiếu" }),
      e.jsx("p", { className: "text-[10px] text-slate-500", children: "Ảnh: chọn model hỗ trợ thị giác. Vai trò ảnh được đặt tại Upload Image. Master prompt được lưu cùng workflow." }),
      e.jsx(PromptPresetControls, { id: t, data: r, disabled: f }),''',1)
part=part.replace('children: "System message"', 'children: "Master prompt / System message"').replace('r.maxTokens ?? 1000','r.maxTokens ?? 4000')
s=s[:start]+part+s[end:]; p.write_text(s,encoding='utf-8')
# Give uploaded references a role that follows them to the AI request.
edit(ui, '      e.jsx(Bi, { id: t, data: r, role: "input", defaultLabel: "Ảnh" }),', '''      e.jsxs("select", { className: Xf, value: r.referenceRole || "garment", onChange: ev => l(t, { referenceRole: ev.target.value }), children:
        [["garment","Ảnh sản phẩm"],["model","Ảnh người mẫu"],["pose","Ảnh tư thế"],["background","Ảnh nền"],["size-chart","Bảng kích thước"]].map(([value,label]) => e.jsx("option", { value, children: label }, value))
      }),
      e.jsx(Bi, { id: t, data: r, role: "input", defaultLabel: "Ảnh" }),''')
edit(ui, '            localPath: f.path,\n            fileName:', '            localPath: f.path,\n            localPaths: [],\n            fileName:')
edit(ui, 'fileName: void 0, previewUrl: void 0, localPath: void 0 });','fileName: void 0, previewUrl: void 0, localPath: void 0, localPaths: [] });')
# Allow image generation to be a batch output directly.
p=ROOT/ui; s=p.read_text(encoding='utf-8'); start=s.index('function $8('); end=s.index('function H8(',start)
part=s[start:end].replace('    children: [','    children: [\n      e.jsx(Bi, { id: t, data: r, role: "output", defaultLabel: "Ảnh tạo" }),',1)
s=s[:start]+part+s[end:]; p.write_text(s,encoding='utf-8')

edit(ui, 'function PI({ workflowId: t, workflowName: s, onBack: r }) {', '''function FolderImportControls({ inputs, onImport }) {
  const toast = oc(), [mode, setMode] = u.useState("files"), [busy, setBusy] = u.useState(false);
  const images = inputs.filter(i => i.batchInputType === "image");
  const [chosen, setChosen] = u.useState("");
  const key = images.some(i => i.batchKey === chosen) ? chosen : images[0]?.batchKey;
  return e.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
    e.jsxs("select", { className: Xf, disabled: busy, value: mode, onChange: ev => setMode(ev.target.value), children: [
      e.jsx("option", { value: "files", children: "Mỗi ảnh = 1 sản phẩm" }),
      e.jsx("option", { value: "subfolders", children: "Mỗi folder con = 1 sản phẩm" })
    ] }),
    e.jsx("select", { className: Xf, disabled: busy, value: key || "", onChange: ev => setChosen(ev.target.value), children: images.map(i => e.jsx("option", { value: i.batchKey, children: i.batchLabel }, i.batchKey)) }),
    e.jsx("button", { className: Xf, disabled: busy || !key, children: busy ? "Đang đọc folder…" : "Nhập folder ảnh", onClick: async () => {
      setBusy(true);
      try {
        const folder = await window.electronAPI.selectFolder(); if (folder.canceled || !folder.path) return;
        const result = Al(await ye.post("/api/workflow/batch/scan-folder", { folder: folder.path, mode }));
        onImport(result.products.map(product => { const row = vy(inputs); row.values[key] = mode === "subfolders" ? JSON.stringify(product.paths) : product.paths[0]; return row; }));
        toast.success(`Đã thêm ${result.products.length} sản phẩm`);
        if (result.warnings?.length) toast.info(result.warnings.join("; "));
      } catch(error) { toast.error(error instanceof Error ? error.message : "Không đọc được folder"); }
      finally { setBusy(false); }
    } })
  ] });
}
function PI({ workflowId: t, workflowName: s, onBack: r }) {''')
edit(ui, '                                onClick: Le,', '                                onClick: Le,')
edit(ui, '''                            children: [
                              e.jsxs("button", {
                                onClick: Le,''', '''                            children: [
                              e.jsx(FolderImportControls, { inputs: ae, onImport: rows => v(previous => [...previous.filter(row => Object.values(row.values).some(value => String(value).trim())), ...rows]) }),
                              e.jsxs("button", {
                                onClick: Le,''')
print('Updated workflow backend and renderer')
