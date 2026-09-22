from pathlib import Path
import json
r=Path(__file__).resolve().parent.parent
p=r/'full-source-app/apps/renderer/dist/assets/index-DhSC5-9k.js';s=p.read_text(encoding='utf-8')
s=s.replace('function b5(t) {\n  return', '''function b5(t) {
  if (t.trim().startsWith("[")) { try { const images = JSON.parse(t); if (Array.isArray(images)) return `${images.length} ảnh · ${String(images[0] || "").split(/[\\\\/]/).slice(-2, -1).join("")}`; } catch {} }
  return''')
s=s.replace('children: e.jsx(\n            "video",\n            {\n              src: Lr(h.path),', 'children: e.jsx(\n            /\\.(png|jpe?g|webp|gif)(?:[?#]|$)/i.test(h.path) ? "img" : "video",\n            {\n              alt: "Ảnh kết quả",\n              src: Lr(h.path),',1)
s=s.replace('`Video ${l + 1}/${s.length}` : "Video kết quả"', '`Kết quả ${l + 1}/${s.length}` : "Ảnh / video kết quả"')
s=s.replace('function FolderImportControls({ inputs, onImport })', 'function FolderImportControls({ inputs, onImport, onBusy })')
s=s.replace('      setBusy(true);\n      try {\n        const folder', '      setBusy(true); onBusy(true);\n      try {\n        const folder')
s=s.replace('finally { setBusy(false); }','finally { setBusy(false); onBusy(false); }')
s=s.replace('e.jsx(FolderImportControls, { inputs: ae, onImport:', 'e.jsx(FolderImportControls, { inputs: ae, onBusy: Y, onImport:')
p.write_text(s,encoding='utf-8')
master=(Path('C:/Users/Admin/.codex/attachments/80868367-b298-403e-8ea8-71954dfa592f/Pasted text.txt').read_text(encoding='utf-8').split('Đã hiểu.')[0].strip())
nodes=[
 {'id':'product','type':'upload-image','position':{'x':0,'y':120},'data':{'referenceRole':'garment','batchRole':'input','batchKey':'product','batchLabel':'Ảnh sản phẩm'}},
 {'id':'ai','type':'ai-prompt','position':{'x':320,'y':0},'data':{'model':'','systemMessage':master,'prompt':'Viết một prompt tiếng Anh hoàn chỉnh cho ảnh listing Etsy từ ảnh sản phẩm. Giữ chính xác sản phẩm, dùng ánh sáng mềm và bối cảnh nội thất trung tính cao cấp. Chỉ trả về prompt, không giải thích.','maxTokens':4000,'stream':True}},
 {'id':'image','type':'generate-image','position':{'x':750,'y':100},'data':{'imageMode':'image-to-image','model':'GEM_PIX_2','ratio':'1:1','count':1}},
 {'id':'result','type':'result','position':{'x':1100,'y':100},'data':{'batchRole':'output','batchKey':'image','batchLabel':'Ảnh Etsy'}}]
edges=[]
for i,(source,target,sourceHandle,targetHandle) in enumerate([('product','ai','image-out','image-in'),('product','image','image-out','image-in'),('ai','image','text-out-0','text-in'),('image','result','image-out','image-in')]):
 edges.append(dict(id=f'edge-{i}',source=source,target=target,sourceHandle=sourceHandle,targetHandle=targetHandle))
template=dict(kind='flow-workflow',schemaVersion=1,name='Etsy – Folder ảnh → AI Prompt → Flow',description='Chọn model AI đọc ảnh trước khi chạy. Mở Batch để nhập folder và chọn folder lưu.',viewport={'x':30,'y':30,'zoom':0.65},nodes=nodes,edges=edges)
out=r/'docs/workflows';out.mkdir(exist_ok=True)
(out/'etsy-folder-images.json').write_text(json.dumps(template,ensure_ascii=False,indent=2),encoding='utf-8')
print('Updated batch image preview and created Etsy template')
