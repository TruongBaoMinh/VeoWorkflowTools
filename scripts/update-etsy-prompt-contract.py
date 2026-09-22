from pathlib import Path
import json

root = Path(__file__).resolve().parent.parent
master_path = root / 'docs/workflows/ETSY-MASTER-PROMPT.md'
master = master_path.read_text(encoding='utf-8-sig') if master_path.exists() else Path(r'C:\Users\Admin\.codex\attachments\27a659ba-90e2-497f-b639-68dfda64460e\Pasted text.txt').read_text(encoding='utf-8-sig')
source = root / 'docs/workflows/ETSY-FOLDER-INPUT.json'
workflow = json.loads(source.read_text(encoding='utf-8-sig'))
ai = next(n for n in workflow['nodes'] if n['type'] == 'ai-prompt')
ai['data'].update(systemMessage=master, outputFormat='etsy-flow-v1', maxTokens=6000,
    prompt='Xử lý riêng sản phẩm hiện tại, áp dụng master prompt và yêu cầu chung. Các ảnh garment là các góc/chi tiết của cùng sản phẩm. Chỉ thay đúng nội dung được yêu cầu. Trả dữ liệu theo output contract Etsy Flow v1 của hệ thống; không giả định lịch sử, model identity hoặc ảnh chưa được cung cấp. Nếu thiếu bằng chứng quan trọng hoặc số liệu không đọc rõ, báo needs_review.')
source.write_text(json.dumps(workflow, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(root / 'docs/workflows/ETSY-MASTER-PROMPT.md').write_text(master, encoding='utf-8')
print(source)
