// Deploy only the multi-profile Batch changes, preserving the installed archive.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const asar = require('../desktop-app/node_modules/@electron/asar');
const root = path.resolve(__dirname, '..');
const backup = path.join(root, 'backups', `deploy-batch-profiles-${Date.now()}`);
const resources = path.join(root, 'full-release/Veo Workflow Tools-win32-x64/resources');
const archive = path.join(resources, 'app.asar');
const rendererRel = 'assets/index-DhSC5-9k.js';
const renderer = fs.readFileSync(path.join(root, 'full-source-app/apps/renderer/dist', rendererRel));
const modules = ['workflow.batch.orchestrator', 'workflow.batch.repository', 'workflow.batch.routes', 'lib/imageGenerationQueue', 'lib/profileJobSlots'];
const same = (a, b) => crypto.createHash('sha256').update(a).digest('hex') === crypto.createHash('sha256').update(b).digest('hex');
(async () => {
  fs.mkdirSync(backup, { recursive: true });
  fs.copyFileSync(archive, path.join(backup, 'original-app.asar'));
  if (asar.listPackage(archive).some(name => { const stat = asar.statFile(archive, name.slice(1)); return !stat.files && stat.unpacked; })) throw new Error('Unexpected unpacked archive layout');
  const stage = path.join(backup, 'stage');
  asar.extractAll(archive, stage);
  const rendererPaths = ['apps/renderer/dist', 'apps/electron/dist/renderer'].map(base => path.join(base, rendererRel));
  for (const relative of rendererPaths) {
    if (!fs.existsSync(path.join(stage, relative))) throw new Error(`Missing ${relative}`);
    fs.writeFileSync(path.join(stage, relative), renderer);
  }
  const replacement = path.join(backup, 'updated-app.asar');
  await asar.createPackage(stage, replacement);
  for (const relative of rendererPaths) {
    if (!same(asar.extractFile(replacement, relative), renderer)) throw new Error(`Renderer mismatch ${relative}`);
  }
  const updates = [];
  for (const server of [path.join(resources, 'server'), path.join(root, 'full-resources/server')]) {
    for (const name of modules) for (const suffix of ['.js', '.js.map', '.d.ts', '.d.ts.map']) {
      const relative = `modules/workflow/${name}${suffix}`;
      updates.push([path.join(server, 'dist', relative), fs.readFileSync(path.join(root, 'full-source-app/apps/server/dist', relative))]);
    }
  }
  updates.push([path.join(root, 'full-source-app/apps/electron/dist/renderer', rendererRel), renderer]);
  updates.push([archive, fs.readFileSync(replacement)]);
  // Read and back up all targets before changing any installed file.
  const originals = updates.map(([file]) => [file, fs.existsSync(file) ? fs.readFileSync(file) : null]);
  for (const [file, bytes] of originals) if (bytes) {
    const dest = path.join(backup, 'originals', path.relative(root, file));
    fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, bytes);
  }
  try {
    for (const [file, bytes] of updates) {
      fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, bytes);
      if (!same(fs.readFileSync(file), bytes)) throw new Error(`Deployed file mismatch ${file}`);
    }
  } catch (error) {
    for (const [file, bytes] of originals) { if (bytes) fs.writeFileSync(file, bytes); else if (fs.existsSync(file)) fs.unlinkSync(file); }
    throw error;
  }
  console.log(JSON.stringify({ deployed: archive, verifiedFiles: updates.length, backup, restartRequired: true }));
})().catch(error => { console.error(error); process.exitCode = 1; });
