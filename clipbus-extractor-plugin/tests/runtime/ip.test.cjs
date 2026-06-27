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

test('manifest has ip-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('ip-detector'), 'missing ip-detector');
});

test('manifest has ip-details renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('ip-details'), 'missing ip-details renderer');
});

test('ip-details uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'ip-details');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

test('ip-detector attachmentTypes contains plugin.extractor.ip', () => {
  const det = manifest.detectors.find((d) => d.id === 'ip-detector');
  assert.ok(det.attachmentTypes.includes('plugin.extractor.ip'));
});

test('ip-details renderer attachmentType is plugin.extractor.ip', () => {
  const r = manifest.attachmentRenderers.find((r) => r.id === 'ip-details');
  assert.equal(r.attachmentType, 'plugin.extractor.ip');
});

// ---------------------------------------------------------------------------
// Factory methods
// ---------------------------------------------------------------------------

test('createIpDetector returns a handler with detect method', () => {
  const { createIpDetector } = require(path.resolve(root, 'src/features/ip-details/detector.ts'));
  const handler = createIpDetector();
  assert.equal(typeof handler.detect, 'function');
});

test('createIpRenderer returns a handler with resolveAttachment method', () => {
  const { createIpRenderer } = require(path.resolve(root, 'src/features/ip-details/renderer.ts'));
  const handler = createIpRenderer();
  assert.equal(typeof handler.resolveAttachment, 'function');
});

// ---------------------------------------------------------------------------
// Detector: fires on valid single IPs
// ---------------------------------------------------------------------------

test('detector fires on plain IPv4', async () => {
  const { createIpDetector } = require(path.resolve(root, 'src/features/ip-details/detector.ts'));
  const det = createIpDetector();
  const artifacts = await det.detect(makeInput('192.168.1.10'));
  assert.equal(artifacts.length, 1);
  assert.equal(artifacts[0].attachmentType, 'plugin.extractor.ip');
});

test('detector fires on IPv4 CIDR', async () => {
  const { createIpDetector } = require(path.resolve(root, 'src/features/ip-details/detector.ts'));
  const det = createIpDetector();
  const artifacts = await det.detect(makeInput('10.0.0.0/8'));
  assert.equal(artifacts.length, 1);
  assert.equal(artifacts[0].attachmentType, 'plugin.extractor.ip');
});

test('detector fires on plain IPv6', async () => {
  const { createIpDetector } = require(path.resolve(root, 'src/features/ip-details/detector.ts'));
  const det = createIpDetector();
  const artifacts = await det.detect(makeInput('2001:db8::1'));
  assert.equal(artifacts.length, 1);
  assert.equal(artifacts[0].attachmentType, 'plugin.extractor.ip');
});

test('detector fires on IPv6 loopback ::1', async () => {
  const { createIpDetector } = require(path.resolve(root, 'src/features/ip-details/detector.ts'));
  const det = createIpDetector();
  const artifacts = await det.detect(makeInput('::1'));
  assert.equal(artifacts.length, 1);
});

// ---------------------------------------------------------------------------
// Detector: rejects prose and invalid inputs
// ---------------------------------------------------------------------------

test('detector rejects prose containing an IP', async () => {
  const { createIpDetector } = require(path.resolve(root, 'src/features/ip-details/detector.ts'));
  const det = createIpDetector();
  const artifacts = await det.detect(makeInput('visit 1.2.3.4 now'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects invalid octet 999.1.1.1', async () => {
  const { createIpDetector } = require(path.resolve(root, 'src/features/ip-details/detector.ts'));
  const det = createIpDetector();
  const artifacts = await det.detect(makeInput('999.1.1.1'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects plain text "hello"', async () => {
  const { createIpDetector } = require(path.resolve(root, 'src/features/ip-details/detector.ts'));
  const det = createIpDetector();
  const artifacts = await det.detect(makeInput('hello'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects malformed IPv6 with stray colons "2001:::1"', async () => {
  const { createIpDetector } = require(path.resolve(root, 'src/features/ip-details/detector.ts'));
  const det = createIpDetector();
  const artifacts = await det.detect(makeInput('2001:::1'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects IPv6 with a trailing colon "2001::db8:"', async () => {
  const { createIpDetector } = require(path.resolve(root, 'src/features/ip-details/detector.ts'));
  const det = createIpDetector();
  const artifacts = await det.detect(makeInput('2001::db8:'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects image content kind', async () => {
  const { createIpDetector } = require(path.resolve(root, 'src/features/ip-details/detector.ts'));
  const det = createIpDetector();
  const artifacts = await det.detect({
    item: sampleItem,
    content: { kind: 'image', dataBase64: '' },
    attachments: [],
  });
  assert.equal(artifacts.length, 0);
});

// ---------------------------------------------------------------------------
// Payload: IPv4 CIDR assertions (192.168.1.0/24)
// ---------------------------------------------------------------------------

test('buildIpArtifact: 192.168.1.0/24 → correct network, broadcast, total, usable', () => {
  const { buildIpArtifact } = require(path.resolve(root, 'src/features/ip-details/payload.ts'));
  const artifact = buildIpArtifact(makeInput('192.168.1.0/24'));
  assert.ok(artifact, 'should produce artifact');
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.inputType, 'ipv4cidr');
  assert.equal(p.networkAddress, '192.168.1.0');
  assert.equal(p.broadcastAddress, '192.168.1.255');
  assert.equal(p.totalAddresses, 256);
  assert.equal(p.usableHostCount, 254);
});

// ---------------------------------------------------------------------------
// Payload: IPv4 scope
// ---------------------------------------------------------------------------

test('buildIpArtifact: 192.168.1.10 → scope Private', () => {
  const { buildIpArtifact } = require(path.resolve(root, 'src/features/ip-details/payload.ts'));
  const artifact = buildIpArtifact(makeInput('192.168.1.10'));
  assert.ok(artifact);
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.scope, 'Private');
});

test('buildIpArtifact: 8.8.8.8 → scope Public', () => {
  const { buildIpArtifact } = require(path.resolve(root, 'src/features/ip-details/payload.ts'));
  const artifact = buildIpArtifact(makeInput('8.8.8.8'));
  assert.ok(artifact);
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.scope, 'Public');
});

// ---------------------------------------------------------------------------
// Payload: IPv6 expansion
// ---------------------------------------------------------------------------

test('buildIpArtifact: 2001:db8::1 expands correctly', () => {
  const { buildIpArtifact } = require(path.resolve(root, 'src/features/ip-details/payload.ts'));
  const artifact = buildIpArtifact(makeInput('2001:db8::1'));
  assert.ok(artifact);
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.expanded, '2001:0db8:0000:0000:0000:0000:0000:0001');
});

test('buildIpArtifact: ::1 scope is Loopback', () => {
  const { buildIpArtifact } = require(path.resolve(root, 'src/features/ip-details/payload.ts'));
  const artifact = buildIpArtifact(makeInput('::1'));
  assert.ok(artifact);
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.scope, 'Loopback');
});

// ---------------------------------------------------------------------------
// Payload: ATTACHMENT_TYPE constant consistency
// ---------------------------------------------------------------------------

test('ATTACHMENT_TYPE constant equals plugin.extractor.ip', () => {
  const { ATTACHMENT_TYPE } = require(path.resolve(root, 'src/features/ip-details/payload.ts'));
  assert.equal(ATTACHMENT_TYPE, 'plugin.extractor.ip');
});

// ---------------------------------------------------------------------------
// Payload: decodeIpPayload
// ---------------------------------------------------------------------------

test('decodeIpPayload returns null for bad payloads', () => {
  const { decodeIpPayload } = require(path.resolve(root, 'src/features/ip-details/payload.ts'));
  assert.equal(decodeIpPayload('not-json'), null);
  assert.equal(decodeIpPayload('{"kind":"other"}'), null);
  assert.equal(decodeIpPayload(null), null);
  assert.equal(decodeIpPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createIpRenderer } = require(path.resolve(root, 'src/features/ip-details/renderer.ts'));
  const renderer = createIpRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '1.2.3.4' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.extractor',
      attachmentType: 'plugin.extractor.ip',
      attachmentKey: 'primary',
      payloadJson: 'bad-json',
    },
  });
  assert.equal(result.shouldDisplay, false);
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createIpRenderer } = require(path.resolve(root, 'src/features/ip-details/renderer.ts'));
  const { buildIpArtifact } = require(path.resolve(root, 'src/features/ip-details/payload.ts'));
  const artifact = buildIpArtifact(makeInput('192.168.1.10'));
  const renderer = createIpRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '192.168.1.10' },
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
