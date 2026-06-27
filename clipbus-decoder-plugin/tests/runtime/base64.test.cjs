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

test('manifest has base64-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('base64-detector'), 'missing base64-detector');
});

test('manifest has base64-renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('base64-renderer'), 'missing base64-renderer');
});

test('base64-renderer uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'base64-renderer');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

// ---------------------------------------------------------------------------
// Detector / payload
// ---------------------------------------------------------------------------

test('detector detects SGVsbG8sIFdvcmxkIQ== and returns correct decoded text', async () => {
  const { buildBase64Artifact } = require(path.resolve(root, 'src/features/base64-renderer/payload.ts'));
  const input = { item: sampleItem, content: { kind: 'text', text: 'SGVsbG8sIFdvcmxkIQ==' }, attachments: [] };
  const artifact = buildBase64Artifact(input);
  assert.ok(artifact, 'artifact should not be null for valid base64');
  assert.equal(artifact.attachmentType, 'plugin.decoder.base64');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.kind, 'base64_preview');
  assert.equal(payload.decoded, 'Hello, World!');
  assert.equal(payload.encoding, 'standard');
});

test('detector decodes URL-safe base64 (SGVsbG8_ → Hello?)', async () => {
  const { buildBase64Artifact } = require(path.resolve(root, 'src/features/base64-renderer/payload.ts'));
  // "Hello?" in standard base64 is "SGVsbG8/" — URL-safe replaces / with _: "SGVsbG8_"
  const input = { item: sampleItem, content: { kind: 'text', text: 'SGVsbG8_' }, attachments: [] };
  const artifact = buildBase64Artifact(input);
  assert.ok(artifact, 'should detect URL-safe base64');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.encoding, 'url-safe');
  assert.equal(payload.decoded, 'Hello?');
});

test('detector ignores plain English text', () => {
  const { buildBase64Artifact } = require(path.resolve(root, 'src/features/base64-renderer/payload.ts'));
  const artifact = buildBase64Artifact({ item: sampleItem, content: { kind: 'text', text: 'hello world foo bar' }, attachments: [] });
  assert.equal(artifact, null, 'plain text should not be detected as base64');
});

test('detector ignores short strings', () => {
  const { buildBase64Artifact } = require(path.resolve(root, 'src/features/base64-renderer/payload.ts'));
  const artifact = buildBase64Artifact({ item: sampleItem, content: { kind: 'text', text: 'abc=' }, attachments: [] });
  assert.equal(artifact, null, 'short string should be ignored');
});

test('detector ignores image content kind', () => {
  const { buildBase64Artifact } = require(path.resolve(root, 'src/features/base64-renderer/payload.ts'));
  const artifact = buildBase64Artifact({ item: sampleItem, content: { kind: 'image', width: 100, height: 100, format: 'png', bytes: 0 }, attachments: [] });
  assert.equal(artifact, null, 'image kind should not produce base64 artifact');
});

test('decodeBase64Payload returns null for non-base64-preview payloads', () => {
  const { decodeBase64Payload } = require(path.resolve(root, 'src/features/base64-renderer/payload.ts'));
  assert.equal(decodeBase64Payload('not-json'), null);
  assert.equal(decodeBase64Payload('{"kind":"other"}'), null);
  assert.equal(decodeBase64Payload(null), null);
  assert.equal(decodeBase64Payload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createBase64Renderer } = require(path.resolve(root, 'src/features/base64-renderer/renderer.ts'));
  const renderer = createBase64Renderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.decoder',
      attachmentType: 'plugin.decoder.base64',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createBase64Renderer } = require(path.resolve(root, 'src/features/base64-renderer/renderer.ts'));
  const { buildBase64Artifact } = require(path.resolve(root, 'src/features/base64-renderer/payload.ts'));
  const artifact = buildBase64Artifact({ item: sampleItem, content: { kind: 'text', text: 'SGVsbG8sIFdvcmxkIQ==' }, attachments: [] });
  const renderer = createBase64Renderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: 'SGVsbG8sIFdvcmxkIQ==' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.decoder',
      attachmentType: artifact.attachmentType,
      attachmentKey: artifact.attachmentKey,
      payloadJson: artifact.payloadJson,
    },
  });
  assert.ok(result.displayName, 'displayName should be set');
  assert.notEqual(result.shouldDisplay, false, 'valid payload should display');
});

