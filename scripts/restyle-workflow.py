from pathlib import Path
import re, shutil
from datetime import datetime
root=Path(__file__).resolve().parent.parent
file=root/'full-source-app/apps/renderer/dist/assets/index-B4IyJRf6.css'
backup=root/'backups'/('workflow-theme-'+datetime.now().strftime('%Y%m%d-%H%M%S'))
backup.mkdir(parents=True,exist_ok=True);shutil.copy2(file,backup/file.name)
s=file.read_text(encoding='utf-8').split('/* WORKFLOW TEAL THEME */')[0]
# Replace Tailwind's indigo brand colors only; media and semantic status colors stay intact.
palette={'238 242 255':'239 250 247','224 231 255':'211 242 233','199 210 254':'167 225 211','165 180 252':'112 204 185','129 140 248':'58 177 156','99 102 241':'24 145 128','79 70 229':'15 118 103','67 56 202':'16 94 84','55 48 163':'19 75 69','49 46 129':'19 61 57','30 27 75':'9 37 34'}
for old,new in palette.items(): s=s.replace('rgb('+old,'rgb('+new)
theme='''
/* WORKFLOW TEAL THEME */
:root { --wf-brand:#0f7667; --wf-glow:rgba(15,118,103,.13); color-scheme:light; }
html.dark { --wf-brand:#70ccB9; --wf-glow:rgba(112,204,185,.14); color-scheme:dark; }
body { background:#f3f7f6; }
html.dark body { background:#111a1c; }
aside { background:linear-gradient(175deg,#fbfefd 0%,#eff7f4 100%)!important; border-right-color:#d6e6e0!important; }
html.dark aside { background:linear-gradient(175deg,#192729 0%,#111c1e 100%)!important; border-right-color:#2a4142!important; }
aside nav button { transition:background-color .18s ease,color .18s ease,box-shadow .18s ease; }
aside nav button:hover:not(:disabled) { box-shadow:inset 3px 0 0 var(--wf-brand); }
aside nav button.bg-indigo-50 { background:#dff2eb!important; box-shadow:inset 3px 0 0 #0f7667!important; }
html.dark aside nav button.bg-indigo-50 { background:#203d38!important; color:#9ee1d0!important; }
header { border-bottom-color:#d6e6e0!important; }
html.dark header { border-bottom-color:#2a4142!important; }
button,a,input,select,textarea { transition:background-color .16s ease,border-color .16s ease,box-shadow .16s ease; }
button:focus-visible,a:focus-visible { outline:2px solid var(--wf-brand); outline-offset:3px; }
input:focus,textarea:focus,select:focus { border-color:var(--wf-brand)!important; box-shadow:0 0 0 3px var(--wf-glow); }
button.bg-slate-900,button.bg-indigo-600,button.bg-indigo-500 { background:linear-gradient(135deg,#0f7667,#155e57)!important; color:#fff!important; box-shadow:0 3px 9px rgba(15,94,83,.16); }
button.bg-slate-900:hover:not(:disabled),button.bg-indigo-600:hover:not(:disabled),button.bg-indigo-500:hover:not(:disabled) { background:linear-gradient(135deg,#0c6558,#104d47)!important; box-shadow:0 5px 13px rgba(15,94,83,.24); }
button:disabled { box-shadow:none!important; }
.react-flow__node.selected { filter:drop-shadow(0 0 5px var(--wf-glow)); }
.react-flow__controls { border-radius:12px!important; overflow:hidden; box-shadow:0 4px 18px rgba(14,48,40,.12)!important; }
@media(prefers-reduced-motion:no-preference) {
 aside { animation:wf-enter .24s ease-out both; }
 @keyframes wf-enter { from { opacity:.5; } to { opacity:1; } }
}
@media(prefers-reduced-motion:reduce) {
 button,a,input,select,textarea,aside nav button { transition:none!important; }
}
'''
file.write_text(s+theme,encoding='utf-8')
print(file)
