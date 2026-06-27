'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const manifest = JSON.parse(fs.readFileSync(path.resolve(root, 'manifest.json'), 'utf8'));

const sampleItem = {
  id: 'item-1',
  type: 'image',
  tags: [],
  sourceAppID: 'com.example.app',
};

const IMAGE_1920x1080 = { kind: 'image', width: 1920, height: 1080, format: 'png', bytes: 1048576 };
const IMAGE_512x512   = { kind: 'image', width: 512,  height: 512,  format: 'gif', bytes: 2048 };
const IMAGE_400x600   = { kind: 'image', width: 400,  height: 600,  format: 'jpeg', bytes: 50000 };
const TEXT_CONTENT    = { kind: 'text', text: 'Hello, World!' };

// ---------------------------------------------------------------------------
// Manifest shape
// ---------------------------------------------------------------------------

test('manifest has image-info-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('image-info-detector'), 'missing image-info-detector');
});

test('manifest has image-info-renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('image-info-renderer'), 'missing image-info-renderer');
});

test('image-info-detector supportedInputKinds includes image', () => {
  const det = manifest.detectors.find((d) => d.id === 'image-info-detector');
  assert.ok(det.supportedInputKinds.includes('image'), 'supportedInputKinds must include "image"');
});

test('image-info-renderer uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'image-info-renderer');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

test('image-info-detector attachmentTypes contains plugin.inspector.image-info', () => {
  const det = manifest.detectors.find((d) => d.id === 'image-info-detector');
  assert.ok(
    det.attachmentTypes.includes('plugin.inspector.image-info'),
    'attachmentTypes must include plugin.inspector.image-info'
  );
});

test('image-info-renderer attachmentType is plugin.inspector.image-info', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'image-info-renderer');
  assert.equal(renderer.attachmentType, 'plugin.inspector.image-info');
});

// ---------------------------------------------------------------------------
// Detector / payload — 1920×1080 PNG
// ---------------------------------------------------------------------------

test('detector fires on image input and returns plugin.inspector.image-info', () => {
  const { buildImageInfoArtifact } = require(path.resolve(root, 'src/features/image-info-renderer/payload.ts'));
  const input = { item: sampleItem, content: IMAGE_1920x1080, attachments: [] };
  const artifact = buildImageInfoArtifact(input);
  assert.ok(artifact, 'artifact should not be null for valid image input');
  assert.equal(artifact.attachmentType, 'plugin.inspector.image-info');
});

test('payload aspectRatioReduced is "16:9" for 1920×1080', () => {
  const { buildImageInfoArtifact } = require(path.resolve(root, 'src/features/image-info-renderer/payload.ts'));
  const artifact = buildImageInfoArtifact({ item: sampleItem, content: IMAGE_1920x1080, attachments: [] });
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.aspectRatioReduced, '16:9');
});

test('payload orientation is "Landscape" for 1920×1080', () => {
  const { buildImageInfoArtifact } = require(path.resolve(root, 'src/features/image-info-renderer/payload.ts'));
  const artifact = buildImageInfoArtifact({ item: sampleItem, content: IMAGE_1920x1080, attachments: [] });
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.orientation, 'Landscape');
});

test('payload megapixels is 2.07 for 1920×1080', () => {
  const { buildImageInfoArtifact } = require(path.resolve(root, 'src/features/image-info-renderer/payload.ts'));
  const artifact = buildImageInfoArtifact({ item: sampleItem, content: IMAGE_1920x1080, attachments: [] });
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.megapixels, 2.07);
});

test('payload fileSizeHuman is "1 MB" for 1048576 bytes', () => {
  const { buildImageInfoArtifact } = require(path.resolve(root, 'src/features/image-info-renderer/payload.ts'));
  const artifact = buildImageInfoArtifact({ item: sampleItem, content: IMAGE_1920x1080, attachments: [] });
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.fileSizeHuman, '1 MB');
});

test('payload commonLabel is "Full HD 1080p" for 1920×1080', () => {
  const { buildImageInfoArtifact } = require(path.resolve(root, 'src/features/image-info-renderer/payload.ts'));
  const artifact = buildImageInfoArtifact({ item: sampleItem, content: IMAGE_1920x1080, attachments: [] });
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.commonLabel, 'Full HD 1080p');
});

test('payload format is uppercased', () => {
  const { buildImageInfoArtifact } = require(path.resolve(root, 'src/features/image-info-renderer/payload.ts'));
  const artifact = buildImageInfoArtifact({ item: sampleItem, content: IMAGE_1920x1080, attachments: [] });
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.format, 'PNG');
});

// ---------------------------------------------------------------------------
// Detector / payload — 512×512 (square)
// ---------------------------------------------------------------------------

test('payload aspectRatioReduced is "1:1" for 512×512', () => {
  const { buildImageInfoArtifact } = require(path.resolve(root, 'src/features/image-info-renderer/payload.ts'));
  const artifact = buildImageInfoArtifact({ item: sampleItem, content: IMAGE_512x512, attachments: [] });
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.aspectRatioReduced, '1:1');
});

test('payload orientation is "Square" for 512×512', () => {
  const { buildImageInfoArtifact } = require(path.resolve(root, 'src/features/image-info-renderer/payload.ts'));
  const artifact = buildImageInfoArtifact({ item: sampleItem, content: IMAGE_512x512, attachments: [] });
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.orientation, 'Square');
});

// ---------------------------------------------------------------------------
// Detector / payload — 400×600 (portrait)
// ---------------------------------------------------------------------------

test('payload orientation is "Portrait" for 400×600', () => {
  const { buildImageInfoArtifact } = require(path.resolve(root, 'src/features/image-info-renderer/payload.ts'));
  const artifact = buildImageInfoArtifact({ item: sampleItem, content: IMAGE_400x600, attachments: [] });
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.orientation, 'Portrait');
});

// ---------------------------------------------------------------------------
// Rejection cases
// ---------------------------------------------------------------------------

test('detector returns null for text input', () => {
  const { buildImageInfoArtifact } = require(path.resolve(root, 'src/features/image-info-renderer/payload.ts'));
  const artifact = buildImageInfoArtifact({ item: sampleItem, content: TEXT_CONTENT, attachments: [] });
  assert.equal(artifact, null, 'text kind should return null');
});

test('detector returns null for image with zero width', () => {
  const { buildImageInfoArtifact } = require(path.resolve(root, 'src/features/image-info-renderer/payload.ts'));
  const artifact = buildImageInfoArtifact({ item: sampleItem, content: { kind: 'image', width: 0, height: 100, format: 'png', bytes: 100 }, attachments: [] });
  assert.equal(artifact, null, 'zero width should return null');
});

// ---------------------------------------------------------------------------
// decodeImageInfoPayload
// ---------------------------------------------------------------------------

test('decodeImageInfoPayload returns null for bad JSON', () => {
  const { decodeImageInfoPayload } = require(path.resolve(root, 'src/features/image-info-renderer/payload.ts'));
  assert.equal(decodeImageInfoPayload('not-json'), null);
  assert.equal(decodeImageInfoPayload('{"kind":"other"}'), null);
  assert.equal(decodeImageInfoPayload(null), null);
  assert.equal(decodeImageInfoPayload(undefined), null);
});

test('decodeImageInfoPayload round-trips a valid payload', () => {
  const { buildImageInfoArtifact, decodeImageInfoPayload } = require(path.resolve(root, 'src/features/image-info-renderer/payload.ts'));
  const artifact = buildImageInfoArtifact({ item: sampleItem, content: IMAGE_1920x1080, attachments: [] });
  const decoded = decodeImageInfoPayload(artifact.payloadJson);
  assert.ok(decoded, 'decoded payload should not be null');
  assert.equal(decoded.kind, 'image_info');
  assert.equal(decoded.width, 1920);
  assert.equal(decoded.height, 1080);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createImageInfoRenderer } = require(path.resolve(root, 'src/features/image-info-renderer/renderer.ts'));
  const renderer = createImageInfoRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: IMAGE_1920x1080,
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.inspector',
      attachmentType: 'plugin.inspector.image-info',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createImageInfoRenderer } = require(path.resolve(root, 'src/features/image-info-renderer/renderer.ts'));
  const { buildImageInfoArtifact } = require(path.resolve(root, 'src/features/image-info-renderer/payload.ts'));
  const artifact = buildImageInfoArtifact({ item: sampleItem, content: IMAGE_1920x1080, attachments: [] });
  const renderer = createImageInfoRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: IMAGE_1920x1080,
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
