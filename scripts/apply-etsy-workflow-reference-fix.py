from pathlib import Path
import sqlite3, json, time

root = Path(__file__).resolve().parent.parent
source = root / 'full-source-app/apps/server/src/modules/workflow/lib/etsyFlowPrompt.js'
code = source.read_text(encoding='utf-8')
start = code.find('SEPARATE MODEL AND GARMENT REFERENCES — interpret')
if start >= 0:
    end = code.index('\n`;', start)
    source.write_text(code[:start] + code[end + 1:], encoding='utf-8')

master = (root / 'docs/workflows/ETSY-MASTER-PROMPT.md').read_text(encoding='utf-8')
heading = '## 27. SEPARATE MODEL AND GARMENT REFERENCES'
addition = '\n\n' + master[master.index(heading):]
database = Path('C:/Users/Admin/AppData/Roaming/Veo Workflow Tools/veo3studio.db')
connection = sqlite3.connect(database, timeout=15)
backup = root / 'backups' / ('workflow-reference-fix-' + str(int(time.time())))
backup.mkdir(parents=True)
with sqlite3.connect(backup / 'before.db') as destination:
    connection.backup(destination)
changed = []
with connection:
    for identifier, name, raw, edges in connection.execute('SELECT id,name,nodes,edges FROM Workflow').fetchall():
        if name not in ('ETSY - Folder quần áo + Người mẫu riêng', 'ETSY - Folder + ChatGPT API'):
            continue
        nodes = json.loads(raw)
        touched = False
        for node in nodes:
            if node['type'] not in ('ai-prompt', 'chatgpt'):
                continue
            data = node.setdefault('data', {})
            current = data.get('systemMessage', '')
            if heading not in current:
                data['systemMessage'] = current.rstrip() + addition
                touched = True
        if touched:
            encoded = json.dumps(nodes, ensure_ascii=False)
            cursor = connection.execute('UPDATE Workflow SET nodes=?,updatedAt=? WHERE id=? AND nodes=?', (encoded, int(time.time()*1000), identifier, raw))
            assert cursor.rowcount == 1, 'Workflow changed during update'
            actual = connection.execute('SELECT nodes FROM Workflow WHERE id=?', (identifier,)).fetchone()[0]
            assert actual == encoded
            changed.append({'id': identifier, 'name': name})
connection.close()
print(json.dumps({'updated': changed, 'backup': str(backup)}, ensure_ascii=False))
