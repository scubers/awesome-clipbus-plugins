'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.resolve(root, 'manifest.json'), 'utf8'));

// ── manifest ─────────────────────────────────────────────────────────────────

test('manifest declares the 4 action ids', () => {
  const ids = manifest.actions.map((a) => a.id);
  assert.ok(ids.includes('text-sort'), 'missing text-sort');
  assert.ok(ids.includes('text-dedup'), 'missing text-dedup');
  assert.ok(ids.includes('text-trim'), 'missing text-trim');
  assert.ok(ids.includes('text-strip-ansi'), 'missing text-strip-ansi');
  assert.equal(ids.length, 4);
});

test('all actions are lifecycle auto-run', () => {
  for (const action of manifest.actions) {
    assert.equal(action.lifecycle, 'auto-run', `${action.id} should be auto-run`);
  }
});

// ── factory shapes ───────────────────────────────────────────────────────────

test('createSortAction returns a handler with runAutoAction and resolveSession', () => {
  const { createSortAction } = require(path.resolve(root, 'src/features/line-tools/sort.ts'));
  const handler = createSortAction();
  assert.equal(typeof handler.runAutoAction, 'function');
  assert.equal(typeof handler.resolveSession, 'function');
});

test('createDedupAction returns a handler with runAutoAction and resolveSession', () => {
  const { createDedupAction } = require(path.resolve(root, 'src/features/line-tools/dedup.ts'));
  const handler = createDedupAction();
  assert.equal(typeof handler.runAutoAction, 'function');
  assert.equal(typeof handler.resolveSession, 'function');
});

test('createTrimAction returns a handler with runAutoAction and resolveSession', () => {
  const { createTrimAction } = require(path.resolve(root, 'src/features/line-tools/trim.ts'));
  const handler = createTrimAction();
  assert.equal(typeof handler.runAutoAction, 'function');
  assert.equal(typeof handler.resolveSession, 'function');
});

// ── pure transform unit tests ─────────────────────────────────────────────────

test('sortLines sorts alphabetically case-insensitive with natural numeric order', () => {
  const { sortLines } = require(path.resolve(root, 'src/features/line-tools/transforms.ts'));
  assert.equal(sortLines('b\na\nc'), 'a\nb\nc');
  assert.equal(sortLines('banana\napple\ncherry'), 'apple\nbanana\ncherry');
});

test('dedupLines removes duplicate lines preserving first occurrence', () => {
  const { dedupLines } = require(path.resolve(root, 'src/features/line-tools/transforms.ts'));
  assert.equal(dedupLines('a\na\nb\na'), 'a\nb');
});

test('tidyWhitespace trims trailing spaces, collapses blank lines, trims edges', () => {
  const { tidyWhitespace } = require(path.resolve(root, 'src/features/line-tools/transforms.ts'));
  assert.equal(tidyWhitespace('  x  \n\n\n\ny  '), 'x\n\ny');
});

// ── action wiring ────────────────────────────────────────────────────────────

function makeInput(text) {
  return {
    item: { id: 'test', type: 'text', tags: [], sourceAppID: '' },
    content: { kind: 'text', text },
    attachments: [],
  };
}

test('sort action on multi-line text returns resultKind text with sorted output', async () => {
  const { createSortAction } = require(path.resolve(root, 'src/features/line-tools/sort.ts'));
  const handler = createSortAction();
  const result = await handler.runAutoAction(makeInput('b\na'));
  assert.equal(result.result.resultKind, 'text');
  assert.equal(result.result.text, 'a\nb');
});

test('dedup action removes duplicates', async () => {
  const { createDedupAction } = require(path.resolve(root, 'src/features/line-tools/dedup.ts'));
  const handler = createDedupAction();
  const result = await handler.runAutoAction(makeInput('a\na\nb'));
  assert.equal(result.result.resultKind, 'text');
  assert.equal(result.result.text, 'a\nb');
});

test('trim action tidies whitespace', async () => {
  const { createTrimAction } = require(path.resolve(root, 'src/features/line-tools/trim.ts'));
  const handler = createTrimAction();
  const result = await handler.runAutoAction(makeInput('  x  \n\n\n\ny  '));
  assert.equal(result.result.resultKind, 'text');
  assert.equal(result.result.text, 'x\n\ny');
});

test('sort action on empty text returns resultKind none', async () => {
  const { createSortAction } = require(path.resolve(root, 'src/features/line-tools/sort.ts'));
  const handler = createSortAction();
  const result = await handler.runAutoAction(makeInput(''));
  assert.equal(result.result.resultKind, 'none');
});

test('dedup action on empty text returns resultKind none', async () => {
  const { createDedupAction } = require(path.resolve(root, 'src/features/line-tools/dedup.ts'));
  const handler = createDedupAction();
  const result = await handler.runAutoAction(makeInput(''));
  assert.equal(result.result.resultKind, 'none');
});

test('trim action on whitespace-only text returns resultKind none', async () => {
  const { createTrimAction } = require(path.resolve(root, 'src/features/line-tools/trim.ts'));
  const handler = createTrimAction();
  const result = await handler.runAutoAction(makeInput('   \n  \n  '));
  assert.equal(result.result.resultKind, 'none');
});
