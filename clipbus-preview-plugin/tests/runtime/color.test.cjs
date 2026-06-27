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

test('manifest has color-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('color-detector'), 'missing color-detector');
});

test('manifest has color-swatch renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('color-swatch'), 'missing color-swatch');
});

test('color-swatch uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'color-swatch');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

// ---------------------------------------------------------------------------
// Feature factories — each returns a handler with the expected method
// ---------------------------------------------------------------------------

test('createColorDetector returns a handler with detect method', () => {
  const { createColorDetector } = require(path.resolve(root, 'src/features/color-swatch/detector.ts'));
  const handler = createColorDetector();
  assert.equal(typeof handler.detect, 'function');
});

test('createColorRenderer returns a handler with resolveAttachment method', () => {
  const { createColorRenderer } = require(path.resolve(root, 'src/features/color-swatch/renderer.ts'));
  const handler = createColorRenderer();
  assert.equal(typeof handler.resolveAttachment, 'function');
});

// ---------------------------------------------------------------------------
// Detector / payload
// ---------------------------------------------------------------------------

test('buildColorArtifact detects hex color #3366ff', () => {
  const { buildColorArtifact } = require(path.resolve(root, 'src/features/color-swatch/payload.ts'));
  const artifact = buildColorArtifact({
    item: sampleItem,
    content: { kind: 'text', text: '#3366ff' },
    attachments: [],
  });
  assert.ok(artifact, 'artifact should not be null for valid hex color');
  assert.equal(artifact.attachmentType, 'plugin.preview.color');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.kind, 'color_swatch');
  assert.equal(payload.hex, '#3366FF');
});

test('buildColorArtifact detects named color "red"', () => {
  const { buildColorArtifact } = require(path.resolve(root, 'src/features/color-swatch/payload.ts'));
  const artifact = buildColorArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'red' },
    attachments: [],
  });
  assert.ok(artifact, 'named color should be detected');
  assert.equal(artifact.attachmentType, 'plugin.preview.color');
});

test('buildColorArtifact detects rgb() color', () => {
  const { buildColorArtifact } = require(path.resolve(root, 'src/features/color-swatch/payload.ts'));
  const artifact = buildColorArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'rgb(100, 150, 200)' },
    attachments: [],
  });
  assert.ok(artifact, 'rgb() color should be detected');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.rgb.r, 100);
  assert.equal(payload.rgb.g, 150);
  assert.equal(payload.rgb.b, 200);
});

test('buildColorArtifact returns null for plain text', () => {
  const { buildColorArtifact } = require(path.resolve(root, 'src/features/color-swatch/payload.ts'));
  const artifact = buildColorArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'hello world' },
    attachments: [],
  });
  assert.equal(artifact, null, 'plain text should not be detected as a color');
});

test('buildColorArtifact returns null for image content kind', () => {
  const { buildColorArtifact } = require(path.resolve(root, 'src/features/color-swatch/payload.ts'));
  const artifact = buildColorArtifact({
    item: sampleItem,
    content: { kind: 'image', width: 100, height: 100, format: 'png', bytes: 0 },
    attachments: [],
  });
  assert.equal(artifact, null, 'image kind should not produce color artifact');
});

test('decodeColorPayload returns null for bad payloads', () => {
  const { decodeColorPayload } = require(path.resolve(root, 'src/features/color-swatch/payload.ts'));
  assert.equal(decodeColorPayload('not-json'), null);
  assert.equal(decodeColorPayload('{"kind":"other"}'), null);
  assert.equal(decodeColorPayload(null), null);
  assert.equal(decodeColorPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createColorRenderer } = require(path.resolve(root, 'src/features/color-swatch/renderer.ts'));
  const renderer = createColorRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.preview',
      attachmentType: 'plugin.preview.color',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createColorRenderer } = require(path.resolve(root, 'src/features/color-swatch/renderer.ts'));
  const { buildColorArtifact } = require(path.resolve(root, 'src/features/color-swatch/payload.ts'));
  const artifact = buildColorArtifact({
    item: sampleItem,
    content: { kind: 'text', text: '#3366ff' },
    attachments: [],
  });
  const renderer = createColorRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '#3366ff' },
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

