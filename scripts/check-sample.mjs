#!/usr/bin/env node
/**
 * Checks that examples/sample-bank.json actually satisfies the import rules.
 *
 * The rules are read out of client.js rather than duplicated here, so this
 * script fails if the sample drifts from the code — the same way a user's
 * paste would be rejected.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(ROOT, 'client.js'), 'utf8');
const sample = JSON.parse(readFileSync(join(ROOT, 'examples', 'sample-bank.json'), 'utf8'));

/** Pull `const NAME = <literal>;` out of the client source and evaluate it. */
function extractLiteral(name) {
  const start = source.indexOf('const ' + name + ' =');
  if (start < 0) throw new Error('could not find const ' + name + ' in client.js');
  const openIndex = source.indexOf('=', start) + 1;
  let depth = 0;
  let quote = null;
  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (ch === '\\') { i += 1; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '{' || ch === '[') depth += 1;
    else if (ch === '}' || ch === ']') {
      depth -= 1;
      if (depth === 0) {
        // Trim a trailing semicolon; the slice is a pure literal expression.
        return new Function('return (' + source.slice(openIndex, i + 1) + ');')();
      }
    }
  }
  throw new Error('unterminated literal for ' + name);
}

const IMPORT_RULES = extractLiteral('IMPORT_RULES');
const TOPICS = extractLiteral('TOPICS');
const TOPIC_IDS = TOPICS.map((t) => t.id);

const rows = Array.isArray(sample) ? sample : sample.questions;
const problems = [];

if (!Array.isArray(rows)) problems.push('top level is neither an array nor { questions: [...] }');
else if (rows.length === 0) problems.push('array is empty');
else if (rows.length > IMPORT_RULES.maxQuestions) problems.push('too many questions: ' + rows.length);

const seen = new Set();
(rows || []).forEach((row, i) => {
  const at = 'row ' + (i + 1) + ': ';
  if (row === null || typeof row !== 'object' || Array.isArray(row)) {
    problems.push(at + 'not an object');
    return;
  }
  if (!TOPIC_IDS.includes(row.topic)) problems.push(at + 'topic "' + row.topic + '" is not allowed');
  if (typeof row.q !== 'string' || row.q.trim() === '') problems.push(at + 'missing question text');
  else if (row.q.length > IMPORT_RULES.maxQuestionLength) problems.push(at + 'question is too long (' + row.q.length + ')');

  if (!Array.isArray(row.a)) problems.push(at + 'a is not an array');
  else {
    const points = row.a.filter((p) => typeof p === 'string' && p.trim() !== '');
    if (points.length === 0) problems.push(at + 'no answer points');
    if (points.length > IMPORT_RULES.maxPoints) problems.push(at + 'too many answer points (' + points.length + ')');
    for (const p of points) {
      if (p.length > IMPORT_RULES.maxPointLength) problems.push(at + 'answer point is too long (' + p.length + ')');
    }
  }

  for (const key of ['freq', 'diff']) {
    if (row[key] === undefined) continue;
    const v = row[key];
    if (!Number.isInteger(v) || v < 1 || v > 5) problems.push(at + key + ' must be an integer 1-5, got ' + v);
  }

  if (row.id !== undefined) {
    if (typeof row.id !== 'string' || row.id.trim() === '') problems.push(at + 'id must be a non-empty string');
    else if (seen.has(row.id)) problems.push(at + 'duplicate id "' + row.id + '"');
    else seen.add(row.id);
  }
});

if (problems.length > 0) {
  for (const p of problems) console.error('✗ ' + p);
  console.error('\n' + problems.length + ' problem(s) in examples/sample-bank.json');
  process.exit(1);
}
console.log('✓ examples/sample-bank.json: ' + rows.length + ' question(s) conform to the import rules.');
console.log('  topics: ' + [...new Set(rows.map((r) => r.topic))].join(', '));
