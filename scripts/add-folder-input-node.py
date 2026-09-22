from pathlib import Path
root=Path(__file__).resolve().parent.parent
ui=root/'full-source-app/apps/renderer/dist/assets/index-DhSC5-9k.js'
s=ui.read_text(encoding='utf-8')
def replace(old,new):
 global s
 if old not in s: raise RuntimeError('Missing anchor: '+old[:90])
 s=s.replace(old,new,1)
replace('    "upload-image",','    "upload-image",\n    "folder-input",')
replace('  "upload-image": _8,','  "upload-image": _8,\n  "folder-input": FolderInputNode,')
replace('  "upload-image": {','  "folder-input": { folderPath: "", outputDir: "", groupMode: "files", batchRole: "input", batchLabel: "Sản phẩm trong folder", referenceRole: "garment", runStatus: "idle" },\n  "upload-image": {')
replace('      type: "upload-image",\n      label:', '      type: "folder-input", label: "Folder Input / Thư mục sản phẩm", Icon: hn, color: un.image, group: "Input",\n    },\n    {\n      type: "upload-image",\n      label:')
replace('  retryNode: c,\n}) {','  retryNode: c,\n  onRunFolder,\n}) {')
replace('      retryNode: c,\n    }),','      retryNode: c,\n      onRunFolder,\n    }),')
replace('    [s, r, l, o, c],','    [s, r, l, o, c, onRunFolder],')
replace('function oI({ workflowId: t, initialRunId: s, onBack: r, onOpenWorkflow: l }) {','function oI({ workflowId: t, initialRunId: s, onBack: r, onOpenWorkflow: l, onOpenBatch }) {')
# The callback saves all canvas edits before switching to Batch; no data hidden in localStorage.
replace('  const X = async () => {','''  const runFolder = async () => {
    if (U || b) return;
    p(true);
    try {
      if (typeof onOpenBatch !== "function") throw new Error("Không mở được màn hình Batch. Hãy lưu workflow và mở Batch từ danh sách.");
      const payload = h.buildSavePayload();
      await $n.saveWorkflow(payload.id, { name: payload.name, viewport: payload.viewport, nodes: payload.nodes, edges: payload.edges });
      h.markSaved(); onOpenBatch(payload.id, payload.name);
    } catch(error) { c.error(error); } finally { p(false); }
  };
  const X = async () => {''')
replace('    O = async (Q) => {\n      try {','    O = async (Q) => {\n      if (h.nodes.some(node => node.type === "folder-input")) { C(false); await runFolder(); return; }\n      try {')
replace('    retryNode: H,\n    children:', '    retryNode: H,\n    onRunFolder: runFolder,\n    children:')
replace('              workflowId: f.id,\n              initialRunId:', '''              workflowId: f.id,
              onOpenBatch: (id, name) => { p({workflowId:id,workflowName:name}); x(null); window.history.pushState({}, "", `/flow/${id}/batch`); },
              initialRunId:''')
# Load fresh filesystem products when a folder workflow enters Batch.
replace('          f(Re), v(Array.from({ length: LI }, () => vy(Re.inputs)));','''          f(Re);
          if (Re.inputs.some(column => column.folderInput)) {
            Y(true);
            try {
              const prepared = Al(await ye.post(`/api/workflow/${t}/prepare-folder`, {}));
              if (Se) return;
              v(prepared.items.map(item => d0(item.inputValues)));
              if (prepared.outputDir) k(prepared.outputDir);
              M(true);
              if (prepared.warnings?.length) l.info(prepared.warnings.join("; "));
            } finally { if (!Se) Y(false); }
          } else v(Array.from({ length: LI }, () => vy(Re.inputs)));''')
start=s.index('function _8(');end=s.index('function Ox(',start)
s=s[:start]+'''function FolderInputNode({ id, data }) {
  const { updateNodeData, onRunFolder } = fs(), toast = oc();
  const [products, setProducts] = u.useState([]), [busy,setBusy] = u.useState(false), [error,setError] = u.useState("");
  const disabled = busy || data.runStatus === "running" || data.runStatus === "queued";
  const scan = async (folder, mode) => {
    setBusy(true); setError(""); setProducts([]);
    try {
      const result = Al(await ye.post("/api/workflow/batch/scan-folder", { folder, mode }));
      setProducts(result.products);
      if(result.warnings?.length) toast.info(result.warnings.join("; "));
    } catch(err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  };
  const pick = async (key) => {
    try {
      const selected = await window.electronAPI.selectFolder();
      if(selected.canceled || !selected.path) return;
      updateNodeData(id,{[key]:selected.path});
      if(key === "folderPath") await scan(selected.path,data.groupMode || "files");
    } catch(err) { setError(String(err)); }
  };
  return e.jsxs(Xs,{ id,title:"Folder Input",accent:"image",status:data.runStatus || "idle",width:320,badge:e.jsx(Ui,{role:"input"}),children:[
    e.jsx("p",{className:"text-xs text-slate-500",children:"Mỗi sản phẩm chạy riêng: AI viết prompt → Flow tạo ảnh → lưu về máy."}),
    e.jsx("button",{className:Xf,disabled,onClick:()=>pick("folderPath"),children:"Chọn thư mục sản phẩm"}),
    e.jsx("p",{className:"text-xs break-all",children:data.folderPath || "Chưa chọn thư mục"}),
    e.jsxs("select",{className:Xf,disabled,value:data.groupMode || "files",onChange:ev=>{
      const mode=ev.target.value; updateNodeData(id,{groupMode:mode}); setProducts([]); if(data.folderPath) scan(data.folderPath,mode);
    },children:[e.jsx("option",{value:"files",children:"Mỗi ảnh = 1 sản phẩm"}),e.jsx("option",{value:"subfolders",children:"Mỗi folder con = 1 sản phẩm"})]}),
    e.jsx("button",{className:Xf,disabled:disabled || !data.folderPath,onClick:()=>scan(data.folderPath,data.groupMode || "files"),children:busy ? "Đang quét…" : "Quét / cập nhật danh sách"}),
    e.jsx("p",{className:"text-xs",children:products.length ? `${products.length} sản phẩm · ${products.reduce((n,p)=>n+p.paths.length,0)} ảnh` : "Bấm Quét để xem danh sách. Khi vào Batch, danh sách sẽ được đọc lại."}),
    e.jsx("div",{className:"nodrag nowheel max-h-36 overflow-auto text-xs",children:products.map(product=>e.jsx("p",{children:`${product.productId} — ${product.paths.length} ảnh`},product.productId))}),
    e.jsx("button",{className:Xf,disabled,onClick:()=>pick("outputDir"),children:"Chọn thư mục lưu kết quả"}),
    e.jsx("p",{className:"text-xs break-all",children:data.outputDir || "Chưa chọn thư mục lưu"}),
    e.jsx("button",{className:"nodrag mt-2 w-full rounded bg-violet-600 px-3 py-2 text-xs text-white disabled:opacity-50",disabled:disabled || !data.folderPath || !data.outputDir || !onRunFolder,onClick:()=>onRunFolder(),children:"Chuẩn bị chạy folder"}),
    e.jsx("p",{className:"text-xs text-slate-500",children:"Bước tiếp theo: chọn profile, kiểm tra sản phẩm rồi Chạy Batch. Tự lưu ảnh + prompt theo từng sản phẩm."}),
    (error || data.error) && e.jsx("p",{role:"alert",className:"text-xs text-red-500",children:error || data.error}),
    e.jsx(Kt,{id:Ut.imageOut,kind:"image",type:"source",position:_e.Right,label:"ảnh của từng sản phẩm"})
  ]});
}
function _8({ id: t, data: r }) {
  const { updateNodeData: update } = fs(), toast = oc();
  const connected = C9().some(edge=>edge.target===t && edge.targetHandle===Ut.imageIn);
  const disabled = connected || r.runStatus === "running" || r.runStatus === "queued";
  const files = r.localPaths?.length ? r.localPaths : r.localPath ? [r.localPath] : [];
  const setFiles = next => update(t,{localPaths:next,localPath:next[0] || "",fileName:next.length ? `${next.length} ảnh` : "",previewUrl:next[0] ? Lr(`file://${next[0]}`) : undefined});
  const pick = async () => {
    try {
      if(!window.electronAPI?.selectImages) throw new Error("Hãy đóng và mở lại bản tools mới để chọn nhiều ảnh.");
      const chosen=await window.electronAPI.selectImages();
      if(chosen.canceled) return;
      const next=[...new Set([...files,...chosen.paths])];
      if(next.length>8) throw new Error("Tối đa 8 ảnh của cùng một sản phẩm. Dùng Folder Input để chạy nhiều sản phẩm.");
      setFiles(next);
    } catch(err) { toast.error(err); }
  };
  return e.jsxs(Xs,{id:t,title:"Upload Image",accent:"image",status:r.runStatus || "idle",width:280,badge:e.jsx(Ui,{role:r.batchRole}),children:[
    e.jsx(Kt,{id:Ut.imageIn,kind:"image",type:"target",position:_e.Left,label:"ảnh kết nối"}),
    e.jsx("p",{className:"text-xs text-slate-500",children:connected ? "Đang dùng ảnh từ node kết nối." : "Chọn nhiều ảnh của CÙNG MỘT sản phẩm. Nhiều sản phẩm: dùng Folder Input."}),
    e.jsx("button",{className:Xf,disabled,onClick:pick,children:`Chọn / thêm nhiều ảnh (${files.length}/8)`}),
    e.jsx("div",{className:"nodrag nowheel mt-2 grid grid-cols-2 gap-2 max-h-60 overflow-auto",children:files.map((file,index)=>e.jsxs("div",{className:"relative rounded border p-1",children:[
      e.jsx("img",{src:Lr(`file://${file}`),alt:`Ảnh tham chiếu ${index+1}`,className:"h-20 w-full object-contain"}),
      e.jsx("p",{className:"truncate text-[10px]",title:file,children:file.split(/[\\\\/]/).pop()}),
      e.jsx("button",{className:"absolute right-0 top-0 rounded bg-black/70 px-1 text-white",disabled,onClick:()=>setFiles(files.filter((_,i)=>i!==index)),"aria-label":`Bỏ ảnh ${index+1}`,children:"×"})
    ]},file))}),
    e.jsx("select",{className:Xf,disabled,value:r.referenceRole || "garment",onChange:ev=>update(t,{referenceRole:ev.target.value}),children:[["garment","Ảnh sản phẩm"],["model","Ảnh người mẫu"],["pose","Ảnh tư thế"],["background","Ảnh nền"],["size-chart","Bảng kích thước"]].map(([value,label])=>e.jsx("option",{value,children:label},value))}),
    r.error && e.jsx("p",{role:"alert",className:"text-xs text-red-500",children:r.error}),
    e.jsx(Bi,{id:t,data:r,role:"input",defaultLabel:"Ảnh"}),
    e.jsx(Kt,{id:Ut.imageOut,kind:"image",type:"source",position:_e.Right,label:"bộ ảnh tham chiếu"})
  ]});
}
''' + s[end:]
ui.write_text(s,encoding='utf-8')
preload=root/'full-source-app/apps/electron/dist/preload/index.js';s=preload.read_text(encoding='utf-8')
old='selectImage:()=>o.invoke("dialog:select-image"),'
assert old in s
preload.write_text(s.replace(old,old+'selectImages:()=>o.invoke("dialog:select-images"),',1),encoding='utf-8')
main=root/'full-source-app/apps/electron/dist/main/ipcHandlers.js';s=main.read_text(encoding='utf-8')
old='s.ipcMain.handle("dialog:select-image",'
assert old in s
s=s.replace(old,'s.ipcMain.handle("dialog:select-images",async()=>{const result=await s.dialog.showOpenDialog({properties:["openFile","multiSelections"],filters:[{name:"Images",extensions:["png","jpg","jpeg","webp"]}],title:"Chọn ảnh cùng một sản phẩm (tối đa 8)",buttonLabel:"Chọn ảnh"});return {canceled:result.canceled,paths:result.canceled?[]:result.filePaths}}),'+old,1)
main.write_text(s,encoding='utf-8')
print('Added Folder Input, Batch handoff and native multi-image picker')
