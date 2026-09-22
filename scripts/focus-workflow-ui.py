from pathlib import Path
import shutil
from datetime import datetime

root = Path(__file__).resolve().parent.parent
file = root / 'full-source-app/apps/renderer/dist/assets/index-DhSC5-9k.js'
s = file.read_text(encoding='utf-8')
backup = root / 'backups' / ('workflow-only-ui-' + datetime.now().strftime('%Y%m%d-%H%M%S'))
backup.mkdir(parents=True, exist_ok=True)
shutil.copy2(file, backup / file.name)
for line in [
    '    { id: "dashboard", label: "Trang chủ", icon: Dy },\n',
    '    { id: "gen-normal", label: "Veo3 Gen", icon: wk },\n',
    '    { id: "prompt-generator", label: "Tiện ích", icon: Bk },\n',
    '    { id: "doodle-video", label: "Doodle Video", icon: Sn },\n',
]:
    assert s.count(line) == 1
    s = s.replace(line, '')
s = s.replace('const Kk = [{ id: "setting", label: "Setting", icon: Xo }]', 'const Kk = [{ id: "setting", label: "Cấu hình chạy Workflow", icon: Xo }]')
start = s.index('function UI() {')
head, app = s[:start], s[start:]
app = app.replace('u.useState("dashboard")', 'u.useState("flow")', 1)
app = app.replace('Yk(Q) || F.includes(Q) ? Q : "dashboard"', 'Yk(Q) || F.includes(Q) ? Q : "flow"', 1)
app = app.replace('m(Ee), s("gen-normal");', 'm(null), s("flow");', 1)
app = app.replace('se === "/" && s("gen-normal");', 'se === "/" && s("flow");', 1)
a = app.index('  if (h)\n    return (')
b = app.index('  if (b)\n', a)
app = app[:a] + app[b:]
a = app.index('      dashboard: e.jsx(g3, {')
b = app.index('      flow: e.jsx(M6, {', a)
app = app[:a] + app[b:]
for line in ['      "prompt-generator": e.jsx(FC, {}),\n', '      "doodle-video": e.jsx(XC, {}),\n']:
    assert line in app
    app = app.replace(line, '')
app = app.replace('onBack: () => s("dashboard")', 'onBack: () => s("flow")')
app = app.replace('children: [de[t], N &&', 'children: [de[t] ?? de.flow, N &&')
file.write_text(head + app, encoding='utf-8')
print(backup)
