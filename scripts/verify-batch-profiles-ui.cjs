const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const bundle = fs.readFileSync(path.join(__dirname, '../full-source-app/apps/renderer/dist/assets/index-DhSC5-9k.js'), 'utf8');
let state = [], cursor = 0;
const element = (type, props) => ({ type, props });
const context = vm.createContext({
  u: { useState(initial) { const index = cursor++; if (!(index in state)) state[index] = initial; return [state[index], value => { state[index] = value; }]; }, useRef: () => ({ current: null }), useEffect() {} },
  e: { jsx: element, jsxs: element },
});
vm.runInContext(bundle.slice(bundle.indexOf('function DI('), bundle.indexOf('\nconst wy =', bundle.indexOf('function DI('))), context);
function flatten(node) {
  if (Array.isArray(node)) return node.flatMap(flatten);
  if (!node || typeof node !== 'object') return [];
  return [node, ...flatten(node.props?.children)];
}
const profiles = [{ id: 'a', name: 'Profile A', isActive: true }, { id: 'b', name: 'Profile B', isActive: true }, { id: 'c', name: 'Profile C', isActive: false }];
let selected = [];
function render(disabled = false) { cursor = 0; return flatten(context.DI({ profiles, selectedIds: selected, onChange: ids => { selected = [...ids]; }, disabled })); }
render().find(node => node.type === 'button').props.onClick();
let nodes = render();
nodes.find(node => node.type === 'button' && node.props.children === 'Chọn tất cả đang bật').props.onClick();
assert.deepEqual(selected, ['a', 'b']);
nodes = render();
const checks = nodes.filter(node => node.type === 'input' && node.props.type === 'checkbox');
assert(checks[0].props.checked && checks[1].props.checked);
assert(checks[2].props.disabled);
checks[0].props.onChange();
assert.deepEqual(selected, ['b']);
nodes = render();
nodes.find(node => node.type === 'input' && node.props.placeholder).props.onChange({ target: { value: 'Profile B' } });
assert.equal(render().filter(node => node.type === 'input' && node.props.type === 'checkbox').length, 1);
assert.equal(render(true).some(node => node.props.role === 'group'), false);
const summary = context.BatchProfileSummary({ profiles, selectedIds: ['a', 'b'], lanes: 2, snapshot: {
  profileIds: ['a', 'b'], profileIssues: { b: 'quota' }, items: [
    { profileId: 'a', status: 'RUNNING' }, { profileId: 'a', status: 'DONE' }, { profileId: 'b', status: 'ERROR' },
  ],
} });
const text = JSON.stringify(summary);
assert(text.includes('1 đang chạy · 1 xong · 0 lỗi'));
assert(text.includes('Đã dừng nhận job'));
assert(bundle.includes('profileId:') || bundle.includes('Re.profileId'));
console.log('PASS: multi-select, select active profiles, toggle, search, locked selection and per-profile progress (component harness, no API).');
