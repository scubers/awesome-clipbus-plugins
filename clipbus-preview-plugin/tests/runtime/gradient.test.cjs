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

function makeInput(text) {
  return { item: sampleItem, content: { kind: 'text', text }, attachments: [] };
}

// ---------------------------------------------------------------------------
// Manifest shape
// ---------------------------------------------------------------------------

test('manifest has gradient-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('gradient-detector'), 'missing gradient-detector');
});

test('manifest has gradient-swatch renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('gradient-swatch'), 'missing gradient-swatch');
});

test('gradient-swatch uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'gradient-swatch');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

test('gradient-detector attachmentType is plugin.preview.gradient', () => {
  const detector = manifest.detectors.find((d) => d.id === 'gradient-detector');
  assert.ok(detector.attachmentTypes.includes('plugin.preview.gradient'));
});

test('gradient-swatch renderer attachmentType is plugin.preview.gradient', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'gradient-swatch');
  assert.equal(renderer.attachmentType, 'plugin.preview.gradient');
});

// ---------------------------------------------------------------------------
// Feature factories
// ---------------------------------------------------------------------------

test('createGradientDetector returns a handler with detect method', () => {
  const { createGradientDetector } = require(path.resolve(root, 'src/features/gradient-swatch/detector.ts'));
  const handler = createGradientDetector();
  assert.equal(typeof handler.detect, 'function');
});

test('createGradientRenderer returns a handler with resolveAttachment method', () => {
  const { createGradientRenderer } = require(path.resolve(root, 'src/features/gradient-swatch/renderer.ts'));
  const handler = createGradientRenderer();
  assert.equal(typeof handler.resolveAttachment, 'function');
});

// ---------------------------------------------------------------------------
// Detector fires on valid gradients
// ---------------------------------------------------------------------------

test('buildGradientArtifact fires on linear-gradient', () => {
  const { buildGradientArtifact } = require(path.resolve(root, 'src/features/gradient-swatch/payload.ts'));
  const artifact = buildGradientArtifact(makeInput('linear-gradient(to right, red, blue)'));
  assert.ok(artifact, 'should detect linear-gradient');
  assert.equal(artifact.attachmentType, 'plugin.preview.gradient');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.gradientType, 'linear');
  assert.equal(payload.repeating, false);
  assert.ok(payload.stops.includes('red'), 'stops should include red');
  assert.ok(payload.stops.includes('blue'), 'stops should include blue');
  assert.equal(payload.angleOrShape, 'to right');
});

test('buildGradientArtifact fires on radial-gradient', () => {
  const { buildGradientArtifact } = require(path.resolve(root, 'src/features/gradient-swatch/payload.ts'));
  const artifact = buildGradientArtifact(makeInput('radial-gradient(circle, #fff, #000)'));
  assert.ok(artifact, 'should detect radial-gradient');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.gradientType, 'radial');
  assert.ok(payload.stops.includes('#fff'), 'stops should include #fff');
  assert.ok(payload.stops.includes('#000'), 'stops should include #000');
  assert.equal(payload.angleOrShape, 'circle');
});

test('buildGradientArtifact fires on conic-gradient', () => {
  const { buildGradientArtifact } = require(path.resolve(root, 'src/features/gradient-swatch/payload.ts'));
  const artifact = buildGradientArtifact(makeInput('conic-gradient(from 0deg, red, blue)'));
  assert.ok(artifact, 'should detect conic-gradient');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.gradientType, 'conic');
  assert.equal(payload.angleOrShape, 'from 0deg');
});

test('buildGradientArtifact fires on repeating-linear-gradient', () => {
  const { buildGradientArtifact } = require(path.resolve(root, 'src/features/gradient-swatch/payload.ts'));
  const artifact = buildGradientArtifact(makeInput('repeating-linear-gradient(45deg, red 0 10px, blue 10px 20px)'));
  assert.ok(artifact, 'should detect repeating-linear-gradient');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.repeating, true);
  assert.equal(payload.gradientType, 'linear');
  assert.equal(payload.angleOrShape, '45deg');
  assert.ok(payload.stops.includes('red'), 'stops should include red');
  assert.ok(payload.stops.includes('blue'), 'stops should include blue');
});

// ---------------------------------------------------------------------------
// Detector rejects invalid / non-gradient inputs
// ---------------------------------------------------------------------------

test('buildGradientArtifact rejects plain text', () => {
  const { buildGradientArtifact } = require(path.resolve(root, 'src/features/gradient-swatch/payload.ts'));
  assert.equal(buildGradientArtifact(makeInput('hello')), null);
});

test('buildGradientArtifact rejects plain CSS named color', () => {
  const { buildGradientArtifact } = require(path.resolve(root, 'src/features/gradient-swatch/payload.ts'));
  assert.equal(buildGradientArtifact(makeInput('red')), null);
});

test('buildGradientArtifact rejects plain hex color', () => {
  const { buildGradientArtifact } = require(path.resolve(root, 'src/features/gradient-swatch/payload.ts'));
  assert.equal(buildGradientArtifact(makeInput('#ffffff')), null);
});

test('buildGradientArtifact rejects plain rgb() color', () => {
  const { buildGradientArtifact } = require(path.resolve(root, 'src/features/gradient-swatch/payload.ts'));
  assert.equal(buildGradientArtifact(makeInput('rgb(1,2,3)')), null);
});

test('buildGradientArtifact rejects CSS declaration with property prefix', () => {
  const { buildGradientArtifact } = require(path.resolve(root, 'src/features/gradient-swatch/payload.ts'));
  assert.equal(
    buildGradientArtifact(makeInput('background: linear-gradient(to right, red, blue)')),
    null
  );
});

test('buildGradientArtifact rejects unterminated gradient', () => {
  const { buildGradientArtifact } = require(path.resolve(root, 'src/features/gradient-swatch/payload.ts'));
  assert.equal(buildGradientArtifact(makeInput('linear-gradient(')), null);
});

// ---------------------------------------------------------------------------
// Color detector does NOT fire on gradients (no double-fire)
// ---------------------------------------------------------------------------

test('buildColorArtifact returns null for a gradient string', () => {
  const { buildColorArtifact } = require(path.resolve(root, 'src/features/color-swatch/payload.ts'));
  assert.equal(
    buildColorArtifact(makeInput('linear-gradient(to right, red, blue)')),
    null,
    'color-swatch should not fire on a gradient'
  );
});

// ---------------------------------------------------------------------------
// decodeGradientPayload
// ---------------------------------------------------------------------------

test('decodeGradientPayload returns null for bad payloads', () => {
  const { decodeGradientPayload } = require(path.resolve(root, 'src/features/gradient-swatch/payload.ts'));
  assert.equal(decodeGradientPayload('not-json'), null);
  assert.equal(decodeGradientPayload('{"kind":"other"}'), null);
  assert.equal(decodeGradientPayload(null), null);
  assert.equal(decodeGradientPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createGradientRenderer } = require(path.resolve(root, 'src/features/gradient-swatch/renderer.ts'));
  const renderer = createGradientRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.preview',
      attachmentType: 'plugin.preview.gradient',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createGradientRenderer } = require(path.resolve(root, 'src/features/gradient-swatch/renderer.ts'));
  const { buildGradientArtifact } = require(path.resolve(root, 'src/features/gradient-swatch/payload.ts'));
  const artifact = buildGradientArtifact(makeInput('linear-gradient(to right, red, blue)'));
  const renderer = createGradientRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: 'linear-gradient(to right, red, blue)' },
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
