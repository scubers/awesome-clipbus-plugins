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

test('decodeTimestampPayload provides empty zones array for legacy payloads without zones', () => {
  const { decodeTimestampPayload } = require(path.resolve(root, 'src/features/timestamp-renderer/payload.ts'));
  const legacyJson = JSON.stringify({
    kind: 'timestamp_preview',
    version: 1,
    original: '1700000000',
    unit: 'seconds',
    epochMs: 1700000000000,
    iso: '2023-11-14T22:13:20.000Z',
    utc: 'Tue, 14 Nov 2023 22:13:20 GMT',
    local: '2023/11/15 06:13:20',
    weekday: 'Tuesday',
    // no zones field
  });
  const payload = decodeTimestampPayload(legacyJson);
  assert.ok(payload, 'should decode legacy payload');
  assert.deepEqual(payload.zones, [], 'missing zones should default to []');
});

// ---------------------------------------------------------------------------
// World clock zones (tested with epoch 0 — bypasses year-range check by
// calling buildWorldClockZones directly, not via buildTimestampArtifact)
// ---------------------------------------------------------------------------

test('buildWorldClockZones returns 9 zones in the correct label order', () => {
  const { buildWorldClockZones } = require(path.resolve(root, 'src/features/timestamp-renderer/payload.ts'));
  const zones = buildWorldClockZones(new Date(0));
  assert.equal(zones.length, 9, 'should have 9 zones');
  const expectedLabels = ['UTC', 'Los Angeles', 'New York', 'London', 'Paris', 'Kolkata', 'Shanghai', 'Tokyo', 'Sydney'];
  assert.deepEqual(zones.map((z) => z.label), expectedLabels, 'zone labels must match in order');
});

test('buildWorldClockZones UTC zone shows 00:00 for epoch 0', () => {
  const { buildWorldClockZones } = require(path.resolve(root, 'src/features/timestamp-renderer/payload.ts'));
  const zones = buildWorldClockZones(new Date(0));
  const utc = zones.find((z) => z.label === 'UTC');
  assert.ok(utc, 'UTC zone must exist');
  assert.ok(utc.time.includes('00:00'), `UTC time should contain 00:00, got: ${utc.time}`);
});

test('buildWorldClockZones Tokyo zone shows 09:00 for epoch 0 (UTC+9)', () => {
  const { buildWorldClockZones } = require(path.resolve(root, 'src/features/timestamp-renderer/payload.ts'));
  const zones = buildWorldClockZones(new Date(0));
  const tokyo = zones.find((z) => z.label === 'Tokyo');
  assert.ok(tokyo, 'Tokyo zone must exist');
  assert.ok(tokyo.time.includes('09:00'), `Tokyo time should contain 09:00, got: ${tokyo.time}`);
});

test('buildWorldClockZones Kolkata zone shows 05:30 for epoch 0 (UTC+5:30)', () => {
  const { buildWorldClockZones } = require(path.resolve(root, 'src/features/timestamp-renderer/payload.ts'));
  const zones = buildWorldClockZones(new Date(0));
  const kolkata = zones.find((z) => z.label === 'Kolkata');
  assert.ok(kolkata, 'Kolkata zone must exist');
  assert.ok(kolkata.time.includes('05:30'), `Kolkata time should contain 05:30, got: ${kolkata.time}`);
});

test('buildWorldClockZones every zone has a non-empty offset string', () => {
  const { buildWorldClockZones } = require(path.resolve(root, 'src/features/timestamp-renderer/payload.ts'));
  const zones = buildWorldClockZones(new Date(1700000000000));
  for (const zone of zones) {
    assert.ok(zone.offset.length > 0, `zone ${zone.label} has empty offset`);
    assert.ok(zone.offset.startsWith('GMT'), `zone ${zone.label} offset should start with GMT, got: ${zone.offset}`);
  }
});

test('buildTimestampArtifact payload includes 9 zones for valid timestamp', () => {
  const { buildTimestampArtifact } = require(path.resolve(root, 'src/features/timestamp-renderer/payload.ts'));
  const input = { item: sampleItem, content: { kind: 'text', text: '1700000000' }, attachments: [] };
  const artifact = buildTimestampArtifact(input);
  assert.ok(artifact, 'artifact should not be null');
  const payload = JSON.parse(artifact.payloadJson);
  assert.ok(Array.isArray(payload.zones), 'payload.zones should be an array');
  assert.equal(payload.zones.length, 9, 'payload.zones should have 9 entries');
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

