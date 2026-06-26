'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const manifest = JSON.parse(fs.readFileSync(path.resolve(root, 'manifest.json'), 'utf8'));

const sampleItem = {
  id: 'item-1',
  type: 'text',
  tags: [],
  sourceAppID: 'com.example.app',
};

// ---------------------------------------------------------------------------
// Manifest shape
// ---------------------------------------------------------------------------

test('manifest has json-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('json-detector'), 'missing json-detector');
});

test('manifest has json-renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('json-renderer'), 'missing json-renderer');
});

test('manifest has json-copy action', () => {
  const ids = manifest.actions.map((a) => a.id);
  assert.ok(ids.includes('json-copy'), 'missing json-copy');
});

test('json-renderer uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'json-renderer');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

// ---------------------------------------------------------------------------
// Detector / payload
// ---------------------------------------------------------------------------

test('detector detects minified JSON object and formats it', async () => {
  const { buildJsonArtifact } = require(path.resolve(root, 'src/features/json-renderer/payload.ts'));
  const input = {
    item: sampleItem,
    content: { kind: 'text', text: '{"name":"Alice","age":30}' },
    attachments: [],
  };
  const artifact = buildJsonArtifact(input);
  assert.ok(artifact, 'artifact should not be null for valid JSON');
  assert.equal(artifact.attachmentType, 'plugin.formatter.json');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.kind, 'json_formatter_preview');
  assert.equal(payload.topLevelType, 'object');
  assert.equal(payload.topLevelCount, 2);
  assert.ok(payload.formatted.includes('  "name"'), 'formatted JSON should have indentation');
});

test('detector detects JSON array', async () => {
  const { buildJsonArtifact } = require(path.resolve(root, 'src/features/json-renderer/payload.ts'));
  const input = {
    item: sampleItem,
    content: { kind: 'text', text: '[1, 2, 3]' },
    attachments: [],
  };
  const artifact = buildJsonArtifact(input);
  assert.ok(artifact, 'should detect JSON array');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.topLevelType, 'array');
  assert.equal(payload.topLevelCount, 3);
});

test('detector ignores plain text', () => {
  const { buildJsonArtifact } = require(path.resolve(root, 'src/features/json-renderer/payload.ts'));
  const artifact = buildJsonArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'hello world' },
    attachments: [],
  });
  assert.equal(artifact, null, 'plain text should not be detected as JSON');
});

test('detector ignores invalid JSON', () => {
  const { buildJsonArtifact } = require(path.resolve(root, 'src/features/json-renderer/payload.ts'));
  const artifact = buildJsonArtifact({
    item: sampleItem,
    content: { kind: 'text', text: '{bad json}' },
    attachments: [],
  });
  assert.equal(artifact, null, 'invalid JSON should not be detected');
});

test('detector ignores image content kind', () => {
  const { buildJsonArtifact } = require(path.resolve(root, 'src/features/json-renderer/payload.ts'));
  const artifact = buildJsonArtifact({
    item: sampleItem,
    content: { kind: 'image', width: 100, height: 100, format: 'png', bytes: 0 },
    attachments: [],
  });
  assert.equal(artifact, null, 'image kind should not produce JSON artifact');
});

test('decodeJsonPayload returns null for bad payloads', () => {
  const { decodeJsonPayload } = require(path.resolve(root, 'src/features/json-renderer/payload.ts'));
  assert.equal(decodeJsonPayload('not-json'), null);
  assert.equal(decodeJsonPayload('{"kind":"other"}'), null);
  assert.equal(decodeJsonPayload(null), null);
  assert.equal(decodeJsonPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createJsonRenderer } = require(path.resolve(root, 'src/features/json-renderer/renderer.ts'));
  const renderer = createJsonRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.formatter',
      attachmentType: 'plugin.formatter.json',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createJsonRenderer } = require(path.resolve(root, 'src/features/json-renderer/renderer.ts'));
  const { buildJsonArtifact } = require(path.resolve(root, 'src/features/json-renderer/payload.ts'));
  const artifact = buildJsonArtifact({
    item: sampleItem,
    content: { kind: 'text', text: '{"x":1}' },
    attachments: [],
  });
  const renderer = createJsonRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '{"x":1}' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.formatter',
      attachmentType: artifact.attachmentType,
      attachmentKey: artifact.attachmentKey,
      payloadJson: artifact.payloadJson,
    },
  });
  assert.ok(result.displayName, 'displayName should be set');
  assert.notEqual(result.shouldDisplay, false, 'valid payload should display');
});

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

test('json-copy runAutoAction formats and returns text result', async () => {
  const { createJsonCopyAction } = require(path.resolve(root, 'src/features/json-renderer/action.ts'));
  const action = createJsonCopyAction();
  const result = await action.runAutoAction({
    item: sampleItem,
    content: { kind: 'text', text: '{"a":1,"b":2}' },
    attachments: [],
  });
  assert.equal(result.result.resultKind, 'text');
  assert.ok(result.result.text.includes('  "a"'), 'result should be formatted JSON');
});

test('json-copy runAutoAction returns none for non-JSON input', async () => {
  const { createJsonCopyAction } = require(path.resolve(root, 'src/features/json-renderer/action.ts'));
  const action = createJsonCopyAction();
  const result = await action.runAutoAction({
    item: sampleItem,
    content: { kind: 'text', text: 'not json at all' },
    attachments: [],
  });
  assert.equal(result.result.resultKind, 'none');
});

test('json-copy resolveSession returns expected shape', async () => {
  const { createJsonCopyAction } = require(path.resolve(root, 'src/features/json-renderer/action.ts'));
  const action = createJsonCopyAction();
  const result = await action.resolveSession({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
  });
  assert.ok(Array.isArray(result.buttons), 'buttons should be an array');
  assert.ok('initialDraft' in result, 'initialDraft should be present');
});
