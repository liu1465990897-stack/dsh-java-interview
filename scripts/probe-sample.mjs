// Prove examples/sample-bank.json passes the plugin's own validateImport.
//
// The validator is private to the module, so this script re-evaluates client.js
// with one extra line appended after `TOPIC_IDS`, which exposes the helper to a
// probe object. Everything else runs exactly as it does in the browser.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const code = readFileSync(join(ROOT, 'client.js'), 'utf8');

const ANCHOR = 'const TOPIC_IDS = TOPICS.map((topic) => topic.id);';
if (!code.includes(ANCHOR)) {
  console.error('✗ anchor line not found in client.js; update scripts/probe-sample.mjs');
  process.exit(1);
}
const patched = code.replace(
  ANCHOR,
  ANCHOR + '\n    globalThis.__probe = { validateImport, IMPORT_RULES, TOPIC_IDS };',
);

const noop = () => {};
const React = {
  createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
  Fragment: 'Fragment',
  useState: (v) => [typeof v === 'function' ? v() : v, noop],
  useMemo: (fn) => fn(),
  useCallback: (fn) => fn,
  useEffect: noop,
  useRef: (v) => ({ current: v }),
};

const sandbox = {
  console,
  Math,
  JSON,
  Object,
  Array,
  Map,
  Set,
  String,
  Number,
  Boolean,
  isNaN,
  document: {
    head: { appendChild: noop },
    createElement: () => ({ dataset: {}, textContent: '' }),
    querySelector: () => null,
  },
  __probe: null,
};
sandbox.window = {
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  __ModuleLoader__: { load: (def) => { sandbox.window.__def = def; } },
};
sandbox.globalThis = sandbox;
sandbox.require = (id) => {
  if (id === 'react') return React;
  throw new Error('unexpected require: ' + id);
};

vm.createContext(sandbox);
vm.runInContext(patched, sandbox, { filename: 'client.js' });

// The module only *defines* its factory at load; calling it runs the body,
// which is what installs the probe and registers the slots.
const def = sandbox.window.__def;
if (!def || typeof def.factory !== 'function') {
  console.error('✗ client.js did not register a module factory');
  process.exit(1);
}
def.factory(sandbox.require);

const api = sandbox.__probe;
if (!api || typeof api.validateImport !== 'function') {
  console.error('✗ could not reach validateImport');
  process.exit(1);
}

const sample = JSON.parse(readFileSync(join(ROOT, 'examples', 'sample-bank.json'), 'utf8'));
const outcome = api.validateImport(sample);
if (!outcome.ok) {
  console.error('✗ sample bank rejected by the real validator:');
  for (const e of outcome.errors) {
    console.error('   row ' + (e.index + 1) + ': ' + e.message + (e.limit ? ' (' + e.limit + ')' : ''));
  }
  process.exit(1);
}

const r = api.IMPORT_RULES;
console.log('✓ sample bank accepted by client.js validateImport: ' + outcome.questions.length + ' question(s)');
console.log('  rules: maxQuestions=' + r.maxQuestions + ' maxQuestionLength=' + r.maxQuestionLength
  + ' maxPoints=' + r.maxPoints + ' maxPointLength=' + r.maxPointLength);
console.log('  topics: ' + api.TOPIC_IDS.join(', '));

// The validator must still reject a broken row, or this check proves nothing.
const broken = api.validateImport([{ topic: 'cobol', q: '题干？', a: ['要点'] }]);
if (broken.ok) {
  console.error('✗ validator accepted an unknown topic');
  process.exit(1);
}
console.log('✓ validator still rejects an unknown topic');

const tooLong = api.validateImport([{ topic: 'basic', q: 'x'.repeat(r.maxQuestionLength + 1), a: ['要点'] }]);
if (tooLong.ok) {
  console.error('✗ validator accepted an over-long question');
  process.exit(1);
}
console.log('✓ validator still rejects an over-long question');
