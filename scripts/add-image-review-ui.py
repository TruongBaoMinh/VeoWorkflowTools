from pathlib import Path
r=Path(__file__).resolve().parent.parent
p=r/'full-source-app/apps/renderer/dist/assets/index-DhSC5-9k.js';s=p.read_text(encoding='utf-8')
s=s.replace('    "save-images",','    "save-images",\n    "image-review",',1)
s=s.replace('  "save-images": SaveImagesNode,','  "save-images": SaveImagesNode,\n  "image-review": ImageReviewNode,',1)
s=s.replace('  "save-images": { outputDir:', '  "image-review": { model: "", criteria: "", blockOnReview: true, results: [], runStatus: "idle" },\n  "save-images": { outputDir:',1)
s=s.replace('      type: "save-images", label:', '      type: "image-review", label: "Image Review / Kiểm tra ảnh", Icon: Pn, color: un.image, group: "Process",\n    },\n    {\n      type: "save-images", label:',1)
s=s.replace('function SaveImagesNode({ id, data }) {','''function ImageReviewNode({ id, data }) {
  const { updateNodeData } = fs();
  const disabled = data.runStatus === "running" || data.runStatus === "queued";
  return e.jsxs(Xs, { id, title: "Image Review", accent: "image", status: data.runStatus || "idle", width: 290, children: [
    e.jsx(Kt, { id: "image-in-reference", kind: "image", type: "target", position: _e.Left, top: 42, label: "ảnh sản phẩm gốc" }),
    e.jsx(Kt, { id: "image-in-result", kind: "image", type: "target", position: _e.Left, top: 72, label: "ảnh đã tạo" }),
    e.jsx("input", { className: Xf, disabled, placeholder: "ID model hỗ trợ đọc ảnh", value: data.model || "", onChange: ev => updateNodeData(id, { model: ev.target.value }) }),
    e.jsx("textarea", { className: Xf, rows: 3, disabled, placeholder: "Tiêu chí kiểm tra bổ sung", value: data.criteria || "", onChange: ev => updateNodeData(id, { criteria: ev.target.value }) }),
    e.jsxs("label", { className: "nodrag text-xs", children: [e.jsx("input", { type: "checkbox", checked: data.blockOnReview !== false, disabled, onChange: ev => updateNodeData(id, { blockOnReview: ev.target.checked }) }), " Dừng nếu cần duyệt ảnh"] }),
    e.jsx("p", { className: "text-xs", children: "AI đối chiếu màu và chi tiết sản phẩm. Không tự tạo lại ảnh. Kết quả AI cần được kiểm tra khi có nghi ngờ." }),
    data.error && e.jsx("p", { className: "text-xs text-red-500", role: "alert", children: data.error }),
    e.jsx("p", { className: "text-xs whitespace-pre-wrap", children: data.prompts?.[0] || "Chưa có đánh giá" }),
    e.jsx(Kt, { id: Ut.imageOut, kind: "image", type: "source", position: _e.Right, top: 90, label: "ảnh sau kiểm tra" }),
    e.jsx(Kt, { id: "text-out-0", kind: "text", type: "source", position: _e.Right, top: 120, label: "báo cáo" }),
    e.jsx(Bi, { id, data, role: "output", defaultLabel: "Ảnh kiểm tra" })
  ] });
}
function SaveImagesNode({ id, data }) {''',1)
# New AI nodes require an explicit model for image input instead of implying text-only defaults work.
s=s.replace('  "ai-prompt": {\n    model: "deepseek/deepseek-v3.2",','  "ai-prompt": {\n    model: "",',1)
start=s.index('function AI8(');end=s.index('function _8(',start)
part=s[start:end].replace('placeholder: "deepseek/deepseek-v3.2"','placeholder: "ID model hỗ trợ đọc ảnh"')
s=s[:start]+part+s[end:]
p.write_text(s,encoding='utf-8')
print('Added Image Review node')
