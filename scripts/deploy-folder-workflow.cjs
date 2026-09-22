const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const asar = require('../desktop-app/node_modules/@electron/asar');
const root = path.resolve(__dirname, '..');
const backup = path.join(root, 'backups', `deploy-workflow-${Date.now()}`);
fs.mkdirSync(backup, {recursive:true});
const resources = path.join(root, 'full-release/Veo Workflow Tools-win32-x64/resources');
const archive = path.join(resources, 'app.asar');
const stage = path.join(backup, 'release-stage');
const replacement = path.join(backup, 'updated-app.asar');
const renderer = path.join(root, 'full-source-app/apps/renderer/dist/assets/index-DhSC5-9k.js');

(async () => {
    // Preserve the exact installed archive; patch its current contents, not an old extraction.
    if (!fs.existsSync(path.join(backup, 'original-app.asar'))) fs.copyFileSync(archive, path.join(backup, 'original-app.asar'));
    const unpacked = asar.listPackage(archive).map(name => name.slice(1)).filter(name => {
        const stat = asar.statFile(archive, name); return !stat.files && stat.unpacked;
    });
    if (unpacked.length) throw new Error('Archive has unpacked files; preserve its packing layout before deploying.');
    asar.extractAll(archive, stage);
    for (const relative of ['apps/renderer/dist/assets/index-DhSC5-9k.js', 'apps/electron/dist/renderer/assets/index-DhSC5-9k.js']) {
        const file = path.join(stage, relative);
        if (!fs.existsSync(file)) throw new Error(`Renderer path missing: ${relative}`);
        fs.copyFileSync(renderer, file);
    }
    for (const relative of ['apps/electron/dist/main/ipcHandlers.js','apps/electron/dist/preload/index.js']) {
        fs.copyFileSync(path.join(root,'full-source-app',relative),path.join(stage,relative));
    }
    const themeRelative = 'assets/index-B4IyJRf6.css';
    const theme = fs.readFileSync(path.join(root,'full-source-app/apps/renderer/dist',themeRelative));
    for (const base of ['apps/renderer/dist','apps/electron/dist/renderer']) {
        fs.writeFileSync(path.join(stage,base,themeRelative),theme);
    }
    await asar.createPackage(stage, replacement);
    const expected = crypto.createHash('sha256').update(fs.readFileSync(renderer)).digest('hex');
    for (const base of ['apps/renderer/dist','apps/electron/dist/renderer']) {
        if (!asar.extractFile(replacement,path.normalize(path.join(base,themeRelative))).equals(theme)) throw new Error('Packaged theme mismatch');
    }
    for (const relative of ['apps/renderer/dist/assets/index-DhSC5-9k.js','apps/electron/dist/renderer/assets/index-DhSC5-9k.js']) {
        const actual = crypto.createHash('sha256').update(asar.extractFile(replacement, path.normalize(relative))).digest('hex');
        if (actual !== expected) throw new Error('Packaged renderer verification failed');
    }
    for (const relative of ['apps/electron/dist/main/ipcHandlers.js','apps/electron/dist/preload/index.js']) {
        if (!asar.extractFile(replacement,path.normalize(relative)).equals(fs.readFileSync(path.join(root,'full-source-app',relative))))
            throw new Error(`Packaged Electron file mismatch: ${relative}`);
    }
    // Keep dev renderer, packaged runtime and packaging resources in sync.
    const electronRenderer = path.join(root,'full-source-app/apps/electron/dist/renderer/assets/index-DhSC5-9k.js');
    if (!fs.existsSync(path.join(backup,'electron-renderer.js'))) fs.copyFileSync(electronRenderer,path.join(backup,'electron-renderer.js'));
    fs.copyFileSync(renderer,electronRenderer);
    fs.copyFileSync(path.join(root,'full-source-app/apps/renderer/dist',themeRelative),path.join(root,'full-source-app/apps/electron/dist/renderer',themeRelative));
    for (const [label, server] of [['release', path.join(resources,'server')],['resources',path.join(root,'full-resources/server')]]) {
        // Deploy the complete compiled backend as one unit. Partial module copies
        // left server route registration and appSettings on an incompatible version.
        for (const relative of ['']) {
            const destination = path.join(server,'dist',relative);
            const old = path.join(backup,label,relative);
            if (fs.existsSync(destination) && !fs.existsSync(old)) fs.cpSync(destination,old,{recursive:true});
            fs.cpSync(path.join(root,'full-source-app/apps/server/dist',relative),destination,{recursive:true});
        }
    }
    fs.copyFileSync(replacement,archive);
    console.log(JSON.stringify({ deployed:archive, rendererSha256:expected, backup }));
})().catch(error=>{console.error(error);process.exitCode=1;});
