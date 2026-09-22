from pathlib import Path
from datetime import datetime
import shutil, hashlib, json

root = Path(__file__).resolve().parent.parent
source = root/'full-source-app/apps/server/dist'
backup = root/'backups'/('complete-backend-'+datetime.now().strftime('%Y%m%d-%H%M%S'))
files = [p for p in source.rglob('*') if p.is_file()]
for name, destination in [('release',root/'full-release/Veo Workflow Tools-win32-x64/resources/server/dist'),('resources',root/'full-resources/server/dist')]:
    shutil.copytree(destination,backup/name)
    shutil.copytree(source,destination,dirs_exist_ok=True)
    for file in files:
        target = destination/file.relative_to(source)
        if hashlib.sha256(file.read_bytes()).digest() != hashlib.sha256(target.read_bytes()).digest():
            raise RuntimeError(f'Backend mismatch: {target}')
    print(f'{name}: {len(files)} compiled files synchronized and verified')
print('Backup:',backup)
