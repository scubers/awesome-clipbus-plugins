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

test('manifest has geo-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('geo-detector'), 'missing geo-detector');
});

test('manifest has geo-coordinates renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('geo-coordinates'), 'missing geo-coordinates renderer');
});

test('geo-coordinates uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'geo-coordinates');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

test('geo-detector attachmentTypes contains plugin.extractor.geo', () => {
  const det = manifest.detectors.find((d) => d.id === 'geo-detector');
  assert.ok(det.attachmentTypes.includes('plugin.extractor.geo'));
});

test('geo-coordinates renderer attachmentType is plugin.extractor.geo', () => {
  const r = manifest.attachmentRenderers.find((r) => r.id === 'geo-coordinates');
  assert.equal(r.attachmentType, 'plugin.extractor.geo');
});

test('toDms carries 60" up to the next minute/degree (no invalid 60.0 component)', () => {
  const { buildGeoArtifact } = require(path.resolve(root, 'src/features/geo-coordinates/payload.ts'));
  const artifact = buildGeoArtifact(makeInput('10.999999, 20.0'));
  assert.ok(artifact, 'should produce artifact');
  const p = JSON.parse(artifact.payloadJson);
  assert.ok(!p.latDms.includes('60.0'), `latDms must not contain a 60.0 second: ${p.latDms}`);
  assert.equal(p.latDms, `11°0'0.0"N`);
});

// ---------------------------------------------------------------------------
// Factory methods
// ---------------------------------------------------------------------------

test('createGeoDetector returns a handler with detect method', () => {
  const { createGeoDetector } = require(path.resolve(root, 'src/features/geo-coordinates/detector.ts'));
  const handler = createGeoDetector();
  assert.equal(typeof handler.detect, 'function');
});

test('createGeoRenderer returns a handler with resolveAttachment method', () => {
  const { createGeoRenderer } = require(path.resolve(root, 'src/features/geo-coordinates/renderer.ts'));
  const handler = createGeoRenderer();
  assert.equal(typeof handler.resolveAttachment, 'function');
});

// ---------------------------------------------------------------------------
// Detector: fires on valid coordinate pairs
// ---------------------------------------------------------------------------

test('detector fires on "37.7749, -122.4194"', async () => {
  const { createGeoDetector } = require(path.resolve(root, 'src/features/geo-coordinates/detector.ts'));
  const det = createGeoDetector();
  const artifacts = await det.detect(makeInput('37.7749, -122.4194'));
  assert.equal(artifacts.length, 1);
  assert.equal(artifacts[0].attachmentType, 'plugin.extractor.geo');
});

test('detector fires on "40.7128° N, 74.0060° W"', async () => {
  const { createGeoDetector } = require(path.resolve(root, 'src/features/geo-coordinates/detector.ts'));
  const det = createGeoDetector();
  const artifacts = await det.detect(makeInput('40.7128° N, 74.0060° W'));
  assert.equal(artifacts.length, 1);
  assert.equal(artifacts[0].attachmentType, 'plugin.extractor.geo');
});

// ---------------------------------------------------------------------------
// Detector: rejects invalid / prose inputs
// ---------------------------------------------------------------------------

test('detector rejects "hello"', async () => {
  const { createGeoDetector } = require(path.resolve(root, 'src/features/geo-coordinates/detector.ts'));
  const det = createGeoDetector();
  const artifacts = await det.detect(makeInput('hello'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects bare integer pair "1, 2"', async () => {
  const { createGeoDetector } = require(path.resolve(root, 'src/features/geo-coordinates/detector.ts'));
  const det = createGeoDetector();
  const artifacts = await det.detect(makeInput('1, 2'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects out-of-range "200, 300"', async () => {
  const { createGeoDetector } = require(path.resolve(root, 'src/features/geo-coordinates/detector.ts'));
  const det = createGeoDetector();
  const artifacts = await det.detect(makeInput('200, 300'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects out-of-range "-91, 0"', async () => {
  const { createGeoDetector } = require(path.resolve(root, 'src/features/geo-coordinates/detector.ts'));
  const det = createGeoDetector();
  const artifacts = await det.detect(makeInput('-91, 0'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects 3-number CSV "1.0,2.0,3.0"', async () => {
  const { createGeoDetector } = require(path.resolve(root, 'src/features/geo-coordinates/detector.ts'));
  const det = createGeoDetector();
  const artifacts = await det.detect(makeInput('1.0,2.0,3.0'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects prose "meet at 37.7, -122.4 ok"', async () => {
  const { createGeoDetector } = require(path.resolve(root, 'src/features/geo-coordinates/detector.ts'));
  const det = createGeoDetector();
  const artifacts = await det.detect(makeInput('meet at 37.7, -122.4 ok'));
  assert.equal(artifacts.length, 0);
});

// ---------------------------------------------------------------------------
// Payload: DMS conversion
// ---------------------------------------------------------------------------

test('latitude DMS for 37.7749 is "37°46\'29.6\\"N"', () => {
  const { buildGeoArtifact } = require(path.resolve(root, 'src/features/geo-coordinates/payload.ts'));
  const artifact = buildGeoArtifact(makeInput('37.7749, -122.4194'));
  assert.ok(artifact, 'should produce artifact');
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.latDms, "37°46'29.6\"N");
});

// ---------------------------------------------------------------------------
// Payload: hemisphere folding
// ---------------------------------------------------------------------------

test('hemisphere folding: "10.0 S, 20.0 W" gives negative lat & lng', () => {
  const { buildGeoArtifact } = require(path.resolve(root, 'src/features/geo-coordinates/payload.ts'));
  const artifact = buildGeoArtifact(makeInput('10.0 S, 20.0 W'));
  assert.ok(artifact, 'should produce artifact');
  const p = JSON.parse(artifact.payloadJson);
  assert.ok(p.lat < 0, `lat should be negative, got ${p.lat}`);
  assert.ok(p.lng < 0, `lng should be negative, got ${p.lng}`);
});

// ---------------------------------------------------------------------------
// Payload: maps URLs
// ---------------------------------------------------------------------------

test('OSM URL contains decimal lat and lng', () => {
  const { buildGeoArtifact } = require(path.resolve(root, 'src/features/geo-coordinates/payload.ts'));
  const artifact = buildGeoArtifact(makeInput('37.7749, -122.4194'));
  assert.ok(artifact);
  const p = JSON.parse(artifact.payloadJson);
  assert.ok(p.osmUrl.includes('37.7749'), `osmUrl should contain lat: ${p.osmUrl}`);
  assert.ok(p.osmUrl.includes('-122.4194'), `osmUrl should contain lng: ${p.osmUrl}`);
});

test('Google URL contains decimal lat and lng', () => {
  const { buildGeoArtifact } = require(path.resolve(root, 'src/features/geo-coordinates/payload.ts'));
  const artifact = buildGeoArtifact(makeInput('37.7749, -122.4194'));
  assert.ok(artifact);
  const p = JSON.parse(artifact.payloadJson);
  assert.ok(p.googleUrl.includes('37.7749'), `googleUrl should contain lat: ${p.googleUrl}`);
  assert.ok(p.googleUrl.includes('-122.4194'), `googleUrl should contain lng: ${p.googleUrl}`);
});

// ---------------------------------------------------------------------------
// Payload: ATTACHMENT_TYPE constant consistency
// ---------------------------------------------------------------------------

test('ATTACHMENT_TYPE constant equals plugin.extractor.geo', () => {
  const { ATTACHMENT_TYPE } = require(path.resolve(root, 'src/features/geo-coordinates/payload.ts'));
  assert.equal(ATTACHMENT_TYPE, 'plugin.extractor.geo');
});

// ---------------------------------------------------------------------------
// Payload: decodeGeoPayload
// ---------------------------------------------------------------------------

test('decodeGeoPayload returns null for bad payloads', () => {
  const { decodeGeoPayload } = require(path.resolve(root, 'src/features/geo-coordinates/payload.ts'));
  assert.equal(decodeGeoPayload('not-json'), null);
  assert.equal(decodeGeoPayload('{"kind":"other"}'), null);
  assert.equal(decodeGeoPayload(null), null);
  assert.equal(decodeGeoPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createGeoRenderer } = require(path.resolve(root, 'src/features/geo-coordinates/renderer.ts'));
  const renderer = createGeoRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '37.7749, -122.4194' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.extractor',
      attachmentType: 'plugin.extractor.geo',
      attachmentKey: 'primary',
      payloadJson: 'bad-json',
    },
  });
  assert.equal(result.shouldDisplay, false);
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createGeoRenderer } = require(path.resolve(root, 'src/features/geo-coordinates/renderer.ts'));
  const { buildGeoArtifact } = require(path.resolve(root, 'src/features/geo-coordinates/payload.ts'));
  const artifact = buildGeoArtifact(makeInput('37.7749, -122.4194'));
  const renderer = createGeoRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '37.7749, -122.4194' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.extractor',
      attachmentType: artifact.attachmentType,
      attachmentKey: artifact.attachmentKey,
      payloadJson: artifact.payloadJson,
    },
  });
  assert.ok(result.displayName, 'displayName should be set');
  assert.notEqual(result.shouldDisplay, false, 'valid payload should display');
});
