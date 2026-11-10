#!/usr/bin/env node
/**
 * Pre-publish self-check for the dsh-java-interview bundle.
 *
 * Verifies the manifest, the Loader patch, the exported locale/icon resources
 * and the files list, so a broken package is caught before it is pushed or
 * installed. Deliberately dependency-free and spawn-free: it only reads files,
 * which keeps it usable inside the Harness file sandbox.
 */
import { readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const notes = [];

const fail = (message) => problems.push(message);
const note = (message) => notes.push(message);
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const exists = (rel) => {
  try {
    return statSync(join(ROOT, rel)).isFile();
  } catch {
    return false;
  }
};

// ---------------------------------------------------------------- manifest
let pkg;
try {
  pkg = JSON.parse(read('package.json'));
} catch (error) {
  console.error('✗ package.json is not valid JSON: ' + error.message);
  process.exit(1);
}

if (!pkg.name) fail('package.json: missing "name"');
if (!pkg.version) fail('package.json: missing "version"');
if (pkg.type !== 'module') fail('package.json: "type" must be "module"');

const patchPath = pkg.dsh && pkg.dsh.bundle && pkg.dsh.bundle.patch;
if (!patchPath) fail('package.json: missing dsh.bundle.patch');

const client = pkg.dsh && pkg.dsh.client;
if (client) {
  if (client.platform !== 'web') fail('package.json: dsh.client.platform must be "web"');
  if (!Array.isArray(client.inject) || client.inject.length === 0) {
    fail('package.json: dsh.client.inject must be a non-empty array');
  }
}

// Every declared export must point at a real file (glob segments are expanded
// by the loader, so only the directory part is checked here).
for (const [key, target] of Object.entries(pkg.exports || {})) {
  if (typeof target !== 'string') {
    fail('package.json: export "' + key + '" is not a string');
    continue;
  }
  if (target.includes('*')) {
    const dir = target.slice(0, target.lastIndexOf('/'));
    if (!exists(dir + '/zh.json') && !exists(dir + '/en.json')) {
      fail('package.json: export "' + key + '" points at empty directory ' + dir);
    }
  } else if (!exists(target)) {
    fail('package.json: export "' + key + '" points at missing file ' + target);
  }
}

// The runtime files must all be listed in `files`, or a packed install drops them.
// Manifests usually write `./x` in dsh.* and `x` in files, so compare normalised.
const normalise = (p) => String(p).replace(/^\.\//, '');
const required = ['index.js', 'client.js', patchPath, 'locale/zh.json', 'locale/en.json', 'icon.svg'];
const listed = Array.isArray(pkg.files) ? pkg.files.map(normalise) : null;
for (const rel of required) {
  const target = normalise(rel);
  if (!exists(target)) fail('missing required file: ' + target);
  if (listed !== null) {
    const covered = listed.some((p) => p === target || (p.includes('*') && target.startsWith(p.slice(0, p.indexOf('*')))));
    if (!covered) fail('files[] does not include ' + target);
  }
}

// -------------------------------------------------------------- loader patch
if (patchPath && exists(patchPath)) {
  const patch = read(patchPath);
  if (!patch.includes('insert:')) fail(patchPath + ': no "insert:" list');
  if (!patch.includes(pkg.name)) fail(patchPath + ': does not reference ' + pkg.name);
  const idMatch = patch.match(/^\s*-\s*id:\s*(\S+)/m);
  if (!idMatch) fail(patchPath + ': no row id found');
  else note('plugin row id: ' + idMatch[1]);
}

// ------------------------------------------------------------------ locales
for (const lang of ['zh', 'en']) {
  const rel = 'locale/' + lang + '.json';
  if (!exists(rel)) continue;
  let doc;
  try {
    doc = JSON.parse(read(rel));
  } catch (error) {
    fail(rel + ' is not valid JSON: ' + error.message);
    continue;
  }
  if (!doc.meta) fail(rel + ': missing "meta"');
  else {
    if (!doc.meta.title) fail(rel + ': missing meta.title');
    if (!doc.meta.description) fail(rel + ': missing meta.description');
  }
}

// -------------------------------------------------------------------- icon
if (exists('icon.svg')) {
  const svg = read('icon.svg');
  const bytes = statSync(join(ROOT, 'icon.svg')).size;
  if (!svg.trimStart().startsWith('<svg')) fail('icon.svg does not start with <svg');
  if (!svg.includes('viewBox')) fail('icon.svg has no viewBox');
  if (bytes > 256 * 1024) fail('icon.svg exceeds the 256 KiB limit (' + bytes + ' bytes)');
  else note('icon.svg: ' + bytes + ' bytes');
}

// ------------------------------------------------------------------ report
for (const n of notes) console.log('  · ' + n);
if (problems.length > 0) {
  for (const p of problems) console.error('✗ ' + p);
  console.error('\n' + problems.length + ' problem(s) found.');
  process.exit(1);
}
console.log('✓ ' + pkg.name + '@' + pkg.version + ' looks publishable.');
