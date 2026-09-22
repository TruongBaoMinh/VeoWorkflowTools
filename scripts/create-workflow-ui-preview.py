from pathlib import Path
import shutil
r=Path(__file__).resolve().parent.parent
dest=r/'backups/folder-image-workflow-20260921-120141/ui-preview'
dest.mkdir(exist_ok=True)
bundle=(r/'full-source-app/apps/renderer/dist/assets/index-DhSC5-9k.js').read_text(encoding='utf-8')
end=bundle.rindex('Pj.createRoot(document.getElementById("root"))')
bundle=bundle[:end]+'''
function WorkflowSmokePreview() {
 const [nodes,setNodes]=u.useState([
 {id:"upload",type:"upload-image",position:{x:10,y:10},data:{}},
 {id:"ai",type:"ai-prompt",position:{x:285,y:10},data:{systemMessage:"Preserve the garment.",model:"",maxTokens:4000}},
 {id:"save",type:"save-images",position:{x:655,y:10},data:{}},
 {id:"review",type:"image-review",position:{x:655,y:300},data:{}},
 {id:"folder",type:"folder-input",position:{x:960,y:10},data:{folderPath:"D:/demo-products",outputDir:"D:/demo-results",groupMode:"files"}}
 ]);
 return e.jsx(a8,{onRunFolder:()=>document.getElementById("test-status").textContent="Folder handoff requested",updateNodeData:(id,data)=>setNodes(ns=>ns.map(n=>n.id===id?{...n,data:{...n.data,...data}}:n)),removeNode:()=>{},retryNode:()=>{},pruneNodeEdges:()=>{},children:e.jsxs("div",{children:[
 e.jsx("h1",{children:"Workflow UI verification"}),
 e.jsx("p",{id:"test-status",children:"Preview uses mock picker and mock folder scan, no generation calls."}),
 e.jsx(FolderImportControls,{inputs:[{batchKey:"product",batchInputType:"image",batchLabel:"Ảnh sản phẩm"}],onImport:()=>{},onBusy:()=>{}}),
 e.jsx("div",{style:{height:"1000px",width:"1350px"},children:e.jsx(S9,{nodes,edges:[],nodeTypes:sI,defaultViewport:{x:10,y:10,zoom:0.9}})})
 ]})});
}
window.electronAPI={selectImages:async()=>({canceled:false,paths:["D:/demo-products/a.png","D:/demo-products/b.png"]}),selectFolder:async()=>({canceled:false,path:"D:/demo-products"})};
ye.post=async()=>({data:{products:[{productId:"a.png",paths:["D:/demo-products/a.png"]},{productId:"b.png",paths:["D:/demo-products/b.png"]}],warnings:[]}});
ye.get=async()=>({data:{configured:true}});
Pj.createRoot(document.getElementById("root")).render(e.jsx(Gk,{children:e.jsx(C6,{children:e.jsx(WorkflowSmokePreview,{})})}));
'''
(dest/'preview.js').write_text(bundle,encoding='utf-8')
shutil.copy2(r/'full-source-app/apps/renderer/dist/assets/index-B4IyJRf6.css',dest/'style.css')
(dest/'index.html').write_text('<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="style.css"><div id="root"></div><script type="module" src="preview.js"></script>',encoding='utf-8')
print(dest)
