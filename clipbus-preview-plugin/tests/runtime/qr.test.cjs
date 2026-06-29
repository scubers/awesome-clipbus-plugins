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

test('manifest has qr-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('qr-detector'), 'missing qr-detector');
});

test('manifest has qr-code renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('qr-code'), 'missing qr-code renderer');
});

test('qr-code uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'qr-code');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

// ---------------------------------------------------------------------------
// Feature factories
// ---------------------------------------------------------------------------

test('createQrDetector returns a handler with detect method', () => {
  const { createQrDetector } = require(path.resolve(root, 'src/features/qr-code/detector.ts'));
  const handler = createQrDetector();
  assert.equal(typeof handler.detect, 'function');
});

test('createQrRenderer returns a handler with resolveAttachment method', () => {
  const { createQrRenderer } = require(path.resolve(root, 'src/features/qr-code/renderer.ts'));
  const handler = createQrRenderer();
  assert.equal(typeof handler.resolveAttachment, 'function');
});

// ---------------------------------------------------------------------------
// Detector / payload
// ---------------------------------------------------------------------------

test('buildQrArtifact detects https URL', () => {
  const { buildQrArtifact } = require(path.resolve(root, 'src/features/qr-code/payload.ts'));
  const artifact = buildQrArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'https://example.com' },
    attachments: [],
  });
  assert.ok(artifact, 'artifact should not be null for a valid https URL');
  assert.equal(artifact.attachmentType, 'plugin.preview.qr');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.kind, 'qr_code');
  assert.equal(payload.url, 'https://example.com');
});

test('buildQrArtifact detects https URL with path', () => {
  const { buildQrArtifact } = require(path.resolve(root, 'src/features/qr-code/payload.ts'));
  const artifact = buildQrArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'https://github.com/user/repo' },
    attachments: [],
  });
  assert.ok(artifact, 'URL with path should be detected');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.display.headline, 'github.com');
});

test('buildQrArtifact returns null for non-URL text', () => {
  const { buildQrArtifact } = require(path.resolve(root, 'src/features/qr-code/payload.ts'));
  const artifact = buildQrArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'hello world' },
    attachments: [],
  });
  assert.equal(artifact, null, 'plain text should not produce a QR artifact');
});

test('buildQrArtifact returns null for mailto: scheme', () => {
  const { buildQrArtifact } = require(path.resolve(root, 'src/features/qr-code/payload.ts'));
  const artifact = buildQrArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'mailto:user@example.com' },
    attachments: [],
  });
  assert.equal(artifact, null, 'mailto: should not produce a QR artifact');
});

test('buildQrArtifact returns null for bare hostname without scheme', () => {
  const { buildQrArtifact } = require(path.resolve(root, 'src/features/qr-code/payload.ts'));
  const artifact = buildQrArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'example.com' },
    attachments: [],
  });
  assert.equal(artifact, null, 'bare hostname should not produce a QR artifact');
});

test('buildQrArtifact returns null for image content kind', () => {
  const { buildQrArtifact } = require(path.resolve(root, 'src/features/qr-code/payload.ts'));
  const artifact = buildQrArtifact({
    item: sampleItem,
    content: { kind: 'image', width: 100, height: 100, format: 'png', bytes: 0 },
    attachments: [],
  });
  assert.equal(artifact, null, 'image kind should not produce a QR artifact');
});

test('decodeQrPayload returns null for bad payloads', () => {
  const { decodeQrPayload } = require(path.resolve(root, 'src/features/qr-code/payload.ts'));
  assert.equal(decodeQrPayload('not-json'), null);
  assert.equal(decodeQrPayload('{"kind":"other"}'), null);
  assert.equal(decodeQrPayload(null), null);
  assert.equal(decodeQrPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createQrRenderer } = require(path.resolve(root, 'src/features/qr-code/renderer.ts'));
  const renderer = createQrRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.preview',
      attachmentType: 'plugin.preview.qr',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createQrRenderer } = require(path.resolve(root, 'src/features/qr-code/renderer.ts'));
  const { buildQrArtifact } = require(path.resolve(root, 'src/features/qr-code/payload.ts'));
  const artifact = buildQrArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'https://example.com' },
    attachments: [],
  });
  const renderer = createQrRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: 'https://example.com' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.preview',
      attachmentType: artifact.attachmentType,
      attachmentKey: artifact.attachmentKey,
      payloadJson: artifact.payloadJson,
    },
  });
  assert.ok(result.displayName, 'displayName should be set');
  assert.notEqual(result.shouldDisplay, false, 'valid payload should display');
});
