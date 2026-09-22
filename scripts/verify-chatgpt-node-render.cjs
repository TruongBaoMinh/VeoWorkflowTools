const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const file = path.join(__dirname, '../full-source-app/apps/renderer/dist/assets/index-DhSC5-9k.js');
const bundle = fs.readFileSync(file, 'utf8');
const start = bundle.indexOf('function ChatGPTNode(');
const end = bundle.indexOf('\nfunction AI8(', start);
assert(start >= 0 && end > start, 'ChatGPT component must exist');
const element = (type, props) => ({ type, props });
const context = vm.createContext({
  fs: () => ({ updateNodeData() {} }),
  oc: () => ({ success() {}, error() {} }),
  u: { useState: value => [value, () => {}], useEffect() {} },
  e: { jsx: element, jsxs: element },
  Xf: 'field', Xs: 'NodeCard', Kt: 'Port',
  Ut: { textIn: 'text-in', imageIn: 'image-in' },
  _e: { Left: 'left', Right: 'right' },
});
vm.runInContext(bundle.slice(start, end), context);
for (const runStatus of ['idle', 'queued', 'running', 'error']) {
  const result = context.ChatGPTNode({ id: 'test', data: {
    runStatus, prompts: ['Mock output'], error: runStatus === 'error' ? 'Mock error' : undefined,
  } });
  assert.equal(result.props.title, 'ChatGPT API');
  const output = result.props.children.find(child => child?.type === 'textarea');
  assert.equal(output.props.readOnly, true);
  assert.equal(output.props.value, 'Mock output');
}
console.log('ChatGPT node render smoke check passed for idle, queued, running, error (no API calls).');
