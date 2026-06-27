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

test('manifest has temperature-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('temperature-detector'), 'missing temperature-detector');
});

test('manifest has temperature renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('temperature'), 'missing temperature renderer');
});

test('temperature renderer uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'temperature');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

test('temperature-detector attachmentTypes contains plugin.converter.temperature', () => {
  const detector = manifest.detectors.find((d) => d.id === 'temperature-detector');
  assert.ok(
    detector.attachmentTypes.includes('plugin.converter.temperature'),
    'expected plugin.converter.temperature in attachmentTypes'
  );
});

test('temperature renderer attachmentType is plugin.converter.temperature', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'temperature');
  assert.equal(renderer.attachmentType, 'plugin.converter.temperature');
});

// ---------------------------------------------------------------------------
// Detector fires on valid temperature inputs
// ---------------------------------------------------------------------------

test('buildTemperatureArtifact fires on "37°C"', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  const artifact = buildTemperatureArtifact(makeInput('37°C'));
  assert.ok(artifact, 'should detect "37°C"');
  assert.equal(artifact.attachmentType, 'plugin.converter.temperature');
});

test('buildTemperatureArtifact fires on "98.6°F"', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  const artifact = buildTemperatureArtifact(makeInput('98.6°F'));
  assert.ok(artifact, 'should detect "98.6°F"');
});

test('buildTemperatureArtifact fires on "300 K"', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  const artifact = buildTemperatureArtifact(makeInput('300 K'));
  assert.ok(artifact, 'should detect "300 K"');
});

test('buildTemperatureArtifact fires on "37 Celsius"', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  const artifact = buildTemperatureArtifact(makeInput('37 Celsius'));
  assert.ok(artifact, 'should detect "37 Celsius"');
});

test('buildTemperatureArtifact fires on "-40°C"', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  const artifact = buildTemperatureArtifact(makeInput('-40°C'));
  assert.ok(artifact, 'should detect "-40°C"');
});

test('buildTemperatureArtifact fires on "0℃"', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  const artifact = buildTemperatureArtifact(makeInput('0℃'));
  assert.ok(artifact, 'should detect "0℃"');
});

test('buildTemperatureArtifact fires on "212 °F"', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  const artifact = buildTemperatureArtifact(makeInput('212 °F'));
  assert.ok(artifact, 'should detect "212 °F"');
});

// ---------------------------------------------------------------------------
// Detector rejects invalid inputs (false-positive guard)
// ---------------------------------------------------------------------------

test('buildTemperatureArtifact rejects "300K" (bare K, no space/degree)', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  assert.equal(buildTemperatureArtifact(makeInput('300K')), null, '"300K" must be rejected');
});

test('buildTemperatureArtifact rejects "37C" (bare C, no space/degree)', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  assert.equal(buildTemperatureArtifact(makeInput('37C')), null, '"37C" must be rejected');
});

test('buildTemperatureArtifact rejects "hello"', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  assert.equal(buildTemperatureArtifact(makeInput('hello')), null, '"hello" must be rejected');
});

test('buildTemperatureArtifact rejects "37" (no unit)', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  assert.equal(buildTemperatureArtifact(makeInput('37')), null, '"37" must be rejected');
});

test('buildTemperatureArtifact rejects "37°" (degree but no scale letter)', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  assert.equal(buildTemperatureArtifact(makeInput('37°')), null, '"37°" must be rejected');
});

test('buildTemperatureArtifact rejects "100°X" (unknown unit)', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  assert.equal(buildTemperatureArtifact(makeInput('100°X')), null, '"100°X" must be rejected');
});

test('buildTemperatureArtifact rejects "" (empty)', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  assert.equal(buildTemperatureArtifact(makeInput('')), null, '"" must be rejected');
});

// ---------------------------------------------------------------------------
// Payload assertions
// ---------------------------------------------------------------------------

test('"37°C" → fahrenheit 98.6, kelvin 310.15', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  const artifact = buildTemperatureArtifact(makeInput('37°C'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.fahrenheit, 98.6);
  assert.equal(payload.kelvin, 310.15);
});

test('"100°C" → fahrenheit 212, kelvin 373.15', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  const artifact = buildTemperatureArtifact(makeInput('100°C'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.fahrenheit, 212);
  assert.equal(payload.kelvin, 373.15);
});

test('"-40°C" → fahrenheit -40', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  const artifact = buildTemperatureArtifact(makeInput('-40°C'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.fahrenheit, -40);
});

test('"300 K" → sourceScale "K", celsius 26.85', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  const artifact = buildTemperatureArtifact(makeInput('300 K'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.sourceScale, 'K');
  assert.equal(payload.celsius, 26.85);
});

test('"-300°C" → belowAbsoluteZero true', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  const artifact = buildTemperatureArtifact(makeInput('-300°C'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.belowAbsoluteZero, true);
});

test('searchProjection label is "Temperature"', () => {
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  const artifact = buildTemperatureArtifact(makeInput('37°C'));
  assert.equal(artifact.searchProjection.label, 'Temperature');
});

test('decodeTemperaturePayload returns null for invalid inputs', () => {
  const { decodeTemperaturePayload } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  assert.equal(decodeTemperaturePayload('not-json'), null);
  assert.equal(decodeTemperaturePayload('{"kind":"other"}'), null);
  assert.equal(decodeTemperaturePayload(null), null);
  assert.equal(decodeTemperaturePayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createTemperatureRenderer } = require(path.resolve(root, 'src/features/temperature/renderer.ts'));
  const renderer = createTemperatureRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.converter',
      attachmentType: 'plugin.converter.temperature',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createTemperatureRenderer } = require(path.resolve(root, 'src/features/temperature/renderer.ts'));
  const { buildTemperatureArtifact } = require(path.resolve(root, 'src/features/temperature/payload.ts'));
  const artifact = buildTemperatureArtifact(makeInput('37°C'));
  const renderer = createTemperatureRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '37°C' },
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
