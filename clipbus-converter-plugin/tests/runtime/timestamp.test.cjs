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

test('manifest has timestamp-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('timestamp-detector'), 'missing timestamp-detector');
});

test('manifest has timestamp-renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('timestamp-renderer'), 'missing timestamp-renderer');
});

test('timestamp-renderer uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'timestamp-renderer');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

// ---------------------------------------------------------------------------
// Detector / payload
// ---------------------------------------------------------------------------

test('buildTimestampArtifact detects 10-digit timestamp (seconds)', () => {
  const { buildTimestampArtifact } = require(path.resolve(root, 'src/features/timestamp-renderer/payload.ts'));
  const input = { item: sampleItem, content: { kind: 'text', text: '1700000000' }, attachments: [] };
  const artifact = buildTimestampArtifact(input);
  assert.ok(artifact, 'artifact should not be null for valid seconds timestamp');
  assert.equal(artifact.attachmentType, 'plugin.converter.timestamp');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.unit, 'seconds');
  assert.equal(payload.iso, '2023-11-14T22:13:20.000Z');
});

test('buildTimestampArtifact detects 13-digit timestamp (milliseconds)', () => {
  const { buildTimestampArtifact } = require(path.resolve(root, 'src/features/timestamp-renderer/payload.ts'));
  const input = { item: sampleItem, content: { kind: 'text', text: '1700000000000' }, attachments: [] };
  const artifact = buildTimestampArtifact(input);
  assert.ok(artifact, 'artifact should not be null for valid milliseconds timestamp');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.unit, 'milliseconds');
  assert.equal(payload.iso, '2023-11-14T22:13:20.000Z');
});

test('buildTimestampArtifact ignores plain text', () => {
  const { buildTimestampArtifact } = require(path.resolve(root, 'src/features/timestamp-renderer/payload.ts'));
  const artifact = buildTimestampArtifact({ item: sampleItem, content: { kind: 'text', text: 'hello world foo' }, attachments: [] });
  assert.equal(artifact, null, 'plain text should not be detected as timestamp');
});

test('buildTimestampArtifact ignores out-of-range timestamp (year < 2001)', () => {
  const { buildTimestampArtifact } = require(path.resolve(root, 'src/features/timestamp-renderer/payload.ts'));
  // 0000000000 → epoch 0 → year 1970 → out of [2001,2099]
  const artifact = buildTimestampArtifact({ item: sampleItem, content: { kind: 'text', text: '0000000000' }, attachments: [] });
  assert.equal(artifact, null, 'year < 2001 should be rejected');
});

test('decodeTimestampPayload returns null for invalid inputs', () => {
  const { decodeTimestampPayload } = require(path.resolve(root, 'src/features/timestamp-renderer/payload.ts'));
  assert.equal(decodeTimestampPayload('not-json'), null);
  assert.equal(decodeTimestampPayload('{"kind":"other"}'), null);
  assert.equal(decodeTimestampPayload(null), null);
  assert.equal(decodeTimestampPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createTimestampRenderer } = require(path.resolve(root, 'src/features/timestamp-renderer/renderer.ts'));
  const renderer = createTimestampRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.converter',
      attachmentType: 'plugin.converter.timestamp',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createTimestampRenderer } = require(path.resolve(root, 'src/features/timestamp-renderer/renderer.ts'));
  const { buildTimestampArtifact } = require(path.resolve(root, 'src/features/timestamp-renderer/payload.ts'));
  const artifact = buildTimestampArtifact({ item: sampleItem, content: { kind: 'text', text: '1700000000' }, attachments: [] });
  const renderer = createTimestampRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '1700000000' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.converter',
      attachmentType: artifact.attachmentType,
      attachmentKey: artifact.attachmentKey,
      payloadJson: artifact.payloadJson,
    },
  });
  assert.ok(result.displayName, 'displayName should be set');
  assert.notEqual(result.shouldDisplay, false, 'valid payload should display');
});

