from pathlib import Path
import shutil, re
from datetime import datetime
root = Path(__file__).resolve().parent.parent
source = root/'full-source-app/apps/server/dist'
backup = root/'backups'/('runtime-dependencies-'+datetime.now().strftime('%Y%m%d-%H%M%S'))
for name, target in [('release',root/'full-release/Veo Workflow Tools-win32-x64/resources/server/dist'),('resources',root/'full-resources/server/dist')]:
    for folder in ['contracts','integrations']:
        if (target/folder).exists(): shutil.copytree(target/folder,backup/name/folder)
        shutil.copytree(source/folder,target/folder,dirs_exist_ok=True)
    # Check every relative ESM dependency, including indirect imports, before startup.
    missing = []
    for file in target.rglob('*.js'):
        for module in re.findall(r'''(?:from\s*|import\s*\(\s*|import\s*)['"](\.[^'"]+)['"]''',file.read_text(encoding='utf-8',errors='replace')):
            dest = (file.parent/module).resolve()
            if not dest.exists(): missing.append(str(dest.relative_to(target.resolve())))
    if missing: raise RuntimeError(f'{name}: unresolved modules: {sorted(set(missing))}')
    print(f'{name}: contracts/integrations synchronized; all relative imports resolve.')
print('Backup:',backup)
