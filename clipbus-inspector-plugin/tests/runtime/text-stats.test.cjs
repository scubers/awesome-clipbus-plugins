'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '../..');
const manifest = JSON.parse(fs.readFileSync(path.resolve(root, 'manifest.json'), 'utf8'));

const sampleItem = {
  id: 'item-1',
  type: 'text',
  tags: [],
  sourceAppID: 'com.example.app',
};

const LONG_TEXT = 'Hello, World!\nThis is a test.';
const SHORT_TEXT = 'short';

// ---------------------------------------------------------------------------
// Manifest shape
// ---------------------------------------------------------------------------

test('manifest has text-stats-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('text-stats-detector'), 'missing text-stats-detector');
});

test('manifest has text-stats-renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('text-stats-renderer'), 'missing text-stats-renderer');
});

test('manifest.actions is empty array', () => {
  assert.ok(Array.isArray(manifest.actions), 'actions should be an array');
  assert.equal(manifest.actions.length, 0, 'actions should be empty (no action capability)');
});

test('text-stats-renderer uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'text-stats-renderer');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

// ---------------------------------------------------------------------------
// Detector / payload
// ---------------------------------------------------------------------------

test('detector returns artifact for long text', async () => {
  const { buildTextStatsArtifact } = require(path.resolve(root, 'src/features/text-stats-renderer/builder.ts'));
  const input = { item: sampleItem, content: { kind: 'text', text: LONG_TEXT }, attachments: [] };
  const artifact = buildTextStatsArtifact(input);
  assert.ok(artifact, 'artifact should not be null for long text');
  assert.equal(artifact.attachmentType, 'plugin.inspector.text-stats');
});

test('payload.lines === 2 for two-line text', () => {
  const { buildTextStatsArtifact } = require(path.resolve(root, 'src/features/text-stats-renderer/builder.ts'));
  const artifact = buildTextStatsArtifact({ item: sampleItem, content: { kind: 'text', text: LONG_TEXT }, attachments: [] });
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.lines, 2);
});

test('payload.words === 6 for sample text', () => {
  const { buildTextStatsArtifact } = require(path.resolve(root, 'src/features/text-stats-renderer/builder.ts'));
  const artifact = buildTextStatsArtifact({ item: sampleItem, content: { kind: 'text', text: LONG_TEXT }, attachments: [] });
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.words, 6);
});

test('payload.chars === 29 for sample text', () => {
  const { buildTextStatsArtifact } = require(path.resolve(root, 'src/features/text-stats-renderer/builder.ts'));
  const artifact = buildTextStatsArtifact({ item: sampleItem, content: { kind: 'text', text: LONG_TEXT }, attachments: [] });
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.chars, 29);
});

test('payload.sha256 matches crypto output', () => {
  const { buildTextStatsArtifact } = require(path.resolve(root, 'src/features/text-stats-renderer/builder.ts'));
  const artifact = buildTextStatsArtifact({ item: sampleItem, content: { kind: 'text', text: LONG_TEXT }, attachments: [] });
  const payload = JSON.parse(artifact.payloadJson);
  const expected = crypto.createHash('sha256').update(LONG_TEXT, 'utf8').digest('hex');
  assert.match(payload.sha256, /^[0-9a-f]{64}$/, 'sha256 must be 64 hex chars');
  assert.equal(payload.sha256, expected, 'sha256 must match node:crypto output');
});

test('payload.md5 matches /^[0-9a-f]{32}$/', () => {
  const { buildTextStatsArtifact } = require(path.resolve(root, 'src/features/text-stats-renderer/builder.ts'));
  const artifact = buildTextStatsArtifact({ item: sampleItem, content: { kind: 'text', text: LONG_TEXT }, attachments: [] });
  const payload = JSON.parse(artifact.payloadJson);
  assert.match(payload.md5, /^[0-9a-f]{32}$/, 'md5 must be 32 hex chars');
});

test('detector returns null for short text (< 20 trimmed chars)', () => {
  const { buildTextStatsArtifact } = require(path.resolve(root, 'src/features/text-stats-renderer/builder.ts'));
  const artifact = buildTextStatsArtifact({ item: sampleItem, content: { kind: 'text', text: SHORT_TEXT }, attachments: [] });
  assert.equal(artifact, null, 'short text should return null');
});

test('detector ignores image content kind', () => {
  const { buildTextStatsArtifact } = require(path.resolve(root, 'src/features/text-stats-renderer/builder.ts'));
  const artifact = buildTextStatsArtifact({ item: sampleItem, content: { kind: 'image', width: 100, height: 100, format: 'png', bytes: 0 }, attachments: [] });
  assert.equal(artifact, null, 'image kind should return null');
});

test('decodeTextStatsPayload returns null for bad data', () => {
  const { decodeTextStatsPayload } = require(path.resolve(root, 'src/features/text-stats-renderer/payload.ts'));
  assert.equal(decodeTextStatsPayload('not-json'), null);
  assert.equal(decodeTextStatsPayload('{"kind":"other"}'), null);
  assert.equal(decodeTextStatsPayload(null), null);
  assert.equal(decodeTextStatsPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createTextStatsRenderer } = require(path.resolve(root, 'src/features/text-stats-renderer/renderer.ts'));
  const renderer = createTextStatsRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.inspector',
      attachmentType: 'plugin.inspector.text-stats',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createTextStatsRenderer } = require(path.resolve(root, 'src/features/text-stats-renderer/renderer.ts'));
  const { buildTextStatsArtifact } = require(path.resolve(root, 'src/features/text-stats-renderer/builder.ts'));
  const artifact = buildTextStatsArtifact({ item: sampleItem, content: { kind: 'text', text: LONG_TEXT }, attachments: [] });
  const renderer = createTextStatsRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: LONG_TEXT },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.inspector',
      attachmentType: artifact.attachmentType,
      attachmentKey: artifact.attachmentKey,
      payloadJson: artifact.payloadJson,
    },
  });
  assert.ok(result.displayName, 'displayName should be set');
  assert.notEqual(result.shouldDisplay, false, 'valid payload should display');
});
