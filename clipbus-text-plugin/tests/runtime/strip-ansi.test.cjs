'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');

// ── pure stripAnsi unit tests ─────────────────────────────────────────────────

test('stripAnsi removes SGR color codes', () => {
  const { stripAnsi } = require(path.resolve(root, 'src/features/line-tools/transforms.ts'));
  assert.equal(stripAnsi('\x1b[31mred\x1b[0m'), 'red');
});

test('stripAnsi removes bold+color compound SGR', () => {
  const { stripAnsi } = require(path.resolve(root, 'src/features/line-tools/transforms.ts'));
  assert.equal(stripAnsi('\x1b[1;32mok\x1b[0m done'), 'ok done');
});

test('stripAnsi removes OSC title sequence terminated by BEL', () => {
  const { stripAnsi } = require(path.resolve(root, 'src/features/line-tools/transforms.ts'));
  // ESC ] 0 ; title BEL  followed by plain text
  assert.equal(stripAnsi('\x1b]0;title\x07hi'), 'hi');
});

test('stripAnsi leaves plain text unchanged', () => {
  const { stripAnsi } = require(path.resolve(root, 'src/features/line-tools/transforms.ts'));
  assert.equal(stripAnsi('hello\nworld'), 'hello\nworld');
});

test('stripAnsi handles empty string', () => {
  const { stripAnsi } = require(path.resolve(root, 'src/features/line-tools/transforms.ts'));
  assert.equal(stripAnsi(''), '');
});

// ── factory shape ────────────────────────────────────────────────────────────

test('createStripAnsiAction returns a handler with runAutoAction and resolveSession', () => {
  const { createStripAnsiAction } = require(path.resolve(root, 'src/features/line-tools/strip-ansi.ts'));
  const handler = createStripAnsiAction();
  assert.equal(typeof handler.runAutoAction, 'function');
  assert.equal(typeof handler.resolveSession, 'function');
});

// ── action wiring ────────────────────────────────────────────────────────────

function makeInput(text) {
  return {
    item: { id: 'test', type: 'text', tags: [], sourceAppID: '' },
    content: { kind: 'text', text },
    attachments: [],
  };
}

test('strip-ansi action removes SGR codes and returns resultKind text', async () => {
  const { createStripAnsiAction } = require(path.resolve(root, 'src/features/line-tools/strip-ansi.ts'));
  const handler = createStripAnsiAction();
  const result = await handler.runAutoAction(makeInput('\x1b[31mred\x1b[0m'));
  assert.equal(result.result.resultKind, 'text');
  assert.equal(result.result.text, 'red');
});

test('strip-ansi action passes through plain text unchanged', async () => {
  const { createStripAnsiAction } = require(path.resolve(root, 'src/features/line-tools/strip-ansi.ts'));
  const handler = createStripAnsiAction();
  const result = await handler.runAutoAction(makeInput('hello\nworld'));
  assert.equal(result.result.resultKind, 'text');
  assert.equal(result.result.text, 'hello\nworld');
});

test('strip-ansi action on empty text returns resultKind none', async () => {
  const { createStripAnsiAction } = require(path.resolve(root, 'src/features/line-tools/strip-ansi.ts'));
  const handler = createStripAnsiAction();
  const result = await handler.runAutoAction(makeInput(''));
  assert.equal(result.result.resultKind, 'none');
});

test('strip-ansi action on non-text kind returns resultKind none', async () => {
  const { createStripAnsiAction } = require(path.resolve(root, 'src/features/line-tools/strip-ansi.ts'));
  const handler = createStripAnsiAction();
  const input = {
    item: { id: 'test', type: 'image', tags: [], sourceAppID: '' },
    content: { kind: 'image', data: '' },
    attachments: [],
  };
  const result = await handler.runAutoAction(input);
  assert.equal(result.result.resultKind, 'none');
});
