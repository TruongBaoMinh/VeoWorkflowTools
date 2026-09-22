from pathlib import Path
import json

root = Path(__file__).resolve().parent.parent
master = (root / 'docs/workflows/ETSY-MASTER-PROMPT.md').read_text(encoding='utf-8')
path = root / 'docs/workflows/ETSY-FOLDER-INPUT.json'
workflow = json.loads(path.read_text(encoding='utf-8'))
next(node for node in workflow['nodes'] if node['type'] == 'ai-prompt')['data']['systemMessage'] = master
path.write_text(json.dumps(workflow, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
