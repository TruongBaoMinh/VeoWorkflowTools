const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const server = path.resolve(__dirname, '../full-release/Veo Workflow Tools-win32-x64/resources/server');
const load = relative => import(pathToFileURL(path.join(server, 'dist', relative)).href);
(async () => {
    const { prisma } = await load('lib/prisma.js');
    // In-memory test double: never reads or changes the user's actual settings.
    let row = null;
    prisma.appSetting.findUnique = async () => row;
    prisma.appSetting.upsert = async ({create}) => { row = {...create,updatedAt:new Date()}; return row; };
    const {appSettingService} = await load('modules/appSettings/appSetting.service.js');
    assert.equal(typeof appSettingService.getValue,'function');
    assert(appSettingService.listMeta().some(item=>item.key==='beeknoee_api_key'));
    const Fastify = require(require.resolve('fastify',{paths:[server]}));
    const app = Fastify();
    const {registerAppSettingRoutes} = await load('modules/appSettings/appSetting.routes.js');
    const {registerAiPromptRoutes} = await load('modules/aiPrompt/aiPrompt.routes.js');
    await registerAppSettingRoutes(app); await registerAiPromptRoutes(app);
    const saved = await app.inject({method:'PUT',url:'/api/app-settings/beeknoee_api_key',payload:{value:'test-only-placeholder-key'}});
    assert.equal(saved.statusCode,200); assert.equal(saved.json().configured,true);
    const status = await app.inject({method:'GET',url:'/api/ai-prompt/status'});
    assert.equal(status.statusCode,200); assert.equal(status.json().configured,true);
    assert.equal(await appSettingService.getValue('beeknoee_api_key'),'test-only-placeholder-key');
    assert(fs.readFileSync(path.join(server,'dist/server.js'),'utf8').includes('registerAiPromptRoutes'));
    await app.close(); await prisma.$disconnect();
    console.log('PASS: packaged save-key route, status route, getValue and AI route registration (mock database, no external calls).');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
