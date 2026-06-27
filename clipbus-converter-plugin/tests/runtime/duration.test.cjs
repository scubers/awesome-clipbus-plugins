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

test('manifest has duration-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('duration-detector'), 'missing duration-detector');
});

test('manifest has duration renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('duration'), 'missing duration renderer');
});

test('duration renderer uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'duration');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

test('duration-detector attachmentTypes contains plugin.converter.duration', () => {
  const detector = manifest.detectors.find((d) => d.id === 'duration-detector');
  assert.ok(
    detector.attachmentTypes.includes('plugin.converter.duration'),
    'expected plugin.converter.duration in attachmentTypes'
  );
});

test('duration renderer attachmentType is plugin.converter.duration', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'duration');
  assert.equal(renderer.attachmentType, 'plugin.converter.duration');
});

// ---------------------------------------------------------------------------
// Detector fires on valid ISO 8601 durations
// ---------------------------------------------------------------------------

test('buildDurationArtifact fires on PT4M13S', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  const artifact = buildDurationArtifact(makeInput('PT4M13S'));
  assert.ok(artifact, 'should detect PT4M13S');
  assert.equal(artifact.attachmentType, 'plugin.converter.duration');
});

test('buildDurationArtifact fires on P1Y2M10DT2H30M', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  const artifact = buildDurationArtifact(makeInput('P1Y2M10DT2H30M'));
  assert.ok(artifact, 'should detect P1Y2M10DT2H30M');
});

test('buildDurationArtifact fires on P3W', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  const artifact = buildDurationArtifact(makeInput('P3W'));
  assert.ok(artifact, 'should detect P3W');
});

test('buildDurationArtifact fires on PT1.5H', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  const artifact = buildDurationArtifact(makeInput('PT1.5H'));
  assert.ok(artifact, 'should detect PT1.5H');
});

test('buildDurationArtifact fires on P1DT12H', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  const artifact = buildDurationArtifact(makeInput('P1DT12H'));
  assert.ok(artifact, 'should detect P1DT12H');
});

test('buildDurationArtifact fires on PT0.5S', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  const artifact = buildDurationArtifact(makeInput('PT0.5S'));
  assert.ok(artifact, 'should detect PT0.5S');
});

// ---------------------------------------------------------------------------
// Detector rejects invalid inputs
// ---------------------------------------------------------------------------

test('buildDurationArtifact rejects bare "P"', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  assert.equal(buildDurationArtifact(makeInput('P')), null, '"P" must be rejected');
});

test('buildDurationArtifact rejects bare "PT"', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  assert.equal(buildDurationArtifact(makeInput('PT')), null, '"PT" must be rejected');
});

test('buildDurationArtifact rejects "PARIS"', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  assert.equal(buildDurationArtifact(makeInput('PARIS')), null, '"PARIS" must be rejected');
});

test('buildDurationArtifact rejects "hello"', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  assert.equal(buildDurationArtifact(makeInput('hello')), null, '"hello" must be rejected');
});

test('buildDurationArtifact rejects "P1Y2X"', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  assert.equal(buildDurationArtifact(makeInput('P1Y2X')), null, '"P1Y2X" must be rejected');
});

test('buildDurationArtifact rejects "1Y2M"', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  assert.equal(buildDurationArtifact(makeInput('1Y2M')), null, '"1Y2M" must be rejected');
});

test('buildDurationArtifact rejects "PT4M13S extra"', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  assert.equal(
    buildDurationArtifact(makeInput('PT4M13S extra')),
    null,
    '"PT4M13S extra" must be rejected'
  );
});

// ---------------------------------------------------------------------------
// Payload assertions
// ---------------------------------------------------------------------------

test('PT4M13S: totalSeconds === 253, approximate === false', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  const artifact = buildDurationArtifact(makeInput('PT4M13S'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.totalSeconds, 253);
  assert.equal(payload.approximate, false);
});

test('P1Y: approximate === true', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  const artifact = buildDurationArtifact(makeInput('P1Y'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.approximate, true);
});

test('P3W: totalSeconds === 1814400, approximate === false', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  const artifact = buildDurationArtifact(makeInput('P3W'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.totalSeconds, 1814400);
  assert.equal(payload.approximate, false);
});

test('P1Y2M10DT2H30M: humanBreakdown matches expected', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  const artifact = buildDurationArtifact(makeInput('P1Y2M10DT2H30M'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(
    payload.humanBreakdown,
    '1 year, 2 months, 10 days, 2 hours, 30 minutes'
  );
});

test('searchProjection label is "Duration"', () => {
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  const artifact = buildDurationArtifact(makeInput('PT4M13S'));
  assert.equal(artifact.searchProjection.label, 'Duration');
});

test('decodeDurationPayload returns null for invalid inputs', () => {
  const { decodeDurationPayload } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  assert.equal(decodeDurationPayload('not-json'), null);
  assert.equal(decodeDurationPayload('{"kind":"other"}'), null);
  assert.equal(decodeDurationPayload(null), null);
  assert.equal(decodeDurationPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createDurationRenderer } = require(path.resolve(root, 'src/features/duration/renderer.ts'));
  const renderer = createDurationRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.converter',
      attachmentType: 'plugin.converter.duration',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createDurationRenderer } = require(path.resolve(root, 'src/features/duration/renderer.ts'));
  const { buildDurationArtifact } = require(path.resolve(root, 'src/features/duration/payload.ts'));
  const artifact = buildDurationArtifact(makeInput('PT4M13S'));
  const renderer = createDurationRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: 'PT4M13S' },
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
