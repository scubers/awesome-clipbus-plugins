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

test('manifest has mac-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('mac-detector'), 'missing mac-detector');
});

test('manifest has mac-address renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('mac-address'), 'missing mac-address renderer');
});

test('mac-address uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'mac-address');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

test('mac-detector attachmentTypes contains plugin.extractor.mac', () => {
  const det = manifest.detectors.find((d) => d.id === 'mac-detector');
  assert.ok(det.attachmentTypes.includes('plugin.extractor.mac'));
});

test('mac-address renderer attachmentType is plugin.extractor.mac', () => {
  const r = manifest.attachmentRenderers.find((r) => r.id === 'mac-address');
  assert.equal(r.attachmentType, 'plugin.extractor.mac');
});

// ---------------------------------------------------------------------------
// Factory methods
// ---------------------------------------------------------------------------

test('createMacDetector returns a handler with detect method', () => {
  const { createMacDetector } = require(path.resolve(root, 'src/features/mac-address/detector.ts'));
  const handler = createMacDetector();
  assert.equal(typeof handler.detect, 'function');
});

test('createMacRenderer returns a handler with resolveAttachment method', () => {
  const { createMacRenderer } = require(path.resolve(root, 'src/features/mac-address/renderer.ts'));
  const handler = createMacRenderer();
  assert.equal(typeof handler.resolveAttachment, 'function');
});

// ---------------------------------------------------------------------------
// Detector: fires on all accepted formats
// ---------------------------------------------------------------------------

test('detector fires on colon format "00:1A:2B:3C:4D:5E"', async () => {
  const { createMacDetector } = require(path.resolve(root, 'src/features/mac-address/detector.ts'));
  const det = createMacDetector();
  const artifacts = await det.detect(makeInput('00:1A:2B:3C:4D:5E'));
  assert.equal(artifacts.length, 1);
  assert.equal(artifacts[0].attachmentType, 'plugin.extractor.mac');
});

test('detector fires on hyphen format "00-1a-2b-3c-4d-5e"', async () => {
  const { createMacDetector } = require(path.resolve(root, 'src/features/mac-address/detector.ts'));
  const det = createMacDetector();
  const artifacts = await det.detect(makeInput('00-1a-2b-3c-4d-5e'));
  assert.equal(artifacts.length, 1);
  assert.equal(artifacts[0].attachmentType, 'plugin.extractor.mac');
});

test('detector fires on Cisco dot format "001A.2B3C.4D5E"', async () => {
  const { createMacDetector } = require(path.resolve(root, 'src/features/mac-address/detector.ts'));
  const det = createMacDetector();
  const artifacts = await det.detect(makeInput('001A.2B3C.4D5E'));
  assert.equal(artifacts.length, 1);
  assert.equal(artifacts[0].attachmentType, 'plugin.extractor.mac');
});

test('detector fires on lowercase colon "ff:ee:dd:cc:bb:aa"', async () => {
  const { createMacDetector } = require(path.resolve(root, 'src/features/mac-address/detector.ts'));
  const det = createMacDetector();
  const artifacts = await det.detect(makeInput('ff:ee:dd:cc:bb:aa'));
  assert.equal(artifacts.length, 1);
});

// ---------------------------------------------------------------------------
// Detector: rejects invalid / ambiguous inputs
// ---------------------------------------------------------------------------

test('detector rejects bare 12-hex "001A2B3C4D5E"', async () => {
  const { createMacDetector } = require(path.resolve(root, 'src/features/mac-address/detector.ts'));
  const det = createMacDetector();
  const artifacts = await det.detect(makeInput('001A2B3C4D5E'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects 5-group colon "00:1A:2B:3C:4D"', async () => {
  const { createMacDetector } = require(path.resolve(root, 'src/features/mac-address/detector.ts'));
  const det = createMacDetector();
  const artifacts = await det.detect(makeInput('00:1A:2B:3C:4D'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects non-hex character "00:1A:2B:3C:4D:5G"', async () => {
  const { createMacDetector } = require(path.resolve(root, 'src/features/mac-address/detector.ts'));
  const det = createMacDetector();
  const artifacts = await det.detect(makeInput('00:1A:2B:3C:4D:5G'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects plain text "hello"', async () => {
  const { createMacDetector } = require(path.resolve(root, 'src/features/mac-address/detector.ts'));
  const det = createMacDetector();
  const artifacts = await det.detect(makeInput('hello'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects prose containing a MAC "mac 00:1a:2b:3c:4d:5e"', async () => {
  const { createMacDetector } = require(path.resolve(root, 'src/features/mac-address/detector.ts'));
  const det = createMacDetector();
  const artifacts = await det.detect(makeInput('mac 00:1a:2b:3c:4d:5e'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects mixed separators "00:1A-2B:3C:4D:5E"', async () => {
  const { createMacDetector } = require(path.resolve(root, 'src/features/mac-address/detector.ts'));
  const det = createMacDetector();
  const artifacts = await det.detect(makeInput('00:1A-2B:3C:4D:5E'));
  assert.equal(artifacts.length, 0);
});

test('detector rejects empty string', async () => {
  const { createMacDetector } = require(path.resolve(root, 'src/features/mac-address/detector.ts'));
  const det = createMacDetector();
  const artifacts = await det.detect(makeInput(''));
  assert.equal(artifacts.length, 0);
});

test('detector rejects image content kind', async () => {
  const { createMacDetector } = require(path.resolve(root, 'src/features/mac-address/detector.ts'));
  const det = createMacDetector();
  const artifacts = await det.detect({
    item: sampleItem,
    content: { kind: 'image', dataBase64: '' },
    attachments: [],
  });
  assert.equal(artifacts.length, 0);
});

// ---------------------------------------------------------------------------
// Payload: bit-flag assertions
// ---------------------------------------------------------------------------

test('buildMacArtifact: "01:00:5E:00:00:01" → cast Multicast', () => {
  const { buildMacArtifact } = require(path.resolve(root, 'src/features/mac-address/payload.ts'));
  const artifact = buildMacArtifact(makeInput('01:00:5E:00:00:01'));
  assert.ok(artifact, 'should produce artifact');
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.cast, 'Multicast (group)');
});

test('buildMacArtifact: "02:00:00:00:00:00" → administration Locally administered', () => {
  const { buildMacArtifact } = require(path.resolve(root, 'src/features/mac-address/payload.ts'));
  const artifact = buildMacArtifact(makeInput('02:00:00:00:00:00'));
  assert.ok(artifact, 'should produce artifact');
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.administration, 'Locally administered');
});

test('buildMacArtifact: "00:1A:2B:3C:4D:5E" → Unicast + Universal', () => {
  const { buildMacArtifact } = require(path.resolve(root, 'src/features/mac-address/payload.ts'));
  const artifact = buildMacArtifact(makeInput('00:1A:2B:3C:4D:5E'));
  assert.ok(artifact, 'should produce artifact');
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.cast, 'Unicast (individual)');
  assert.equal(p.administration, 'Universal (OUI/vendor-assigned)');
});

test('buildMacArtifact: "00:1A:2B:3C:4D:5E" → OUI "00:1A:2B"', () => {
  const { buildMacArtifact } = require(path.resolve(root, 'src/features/mac-address/payload.ts'));
  const artifact = buildMacArtifact(makeInput('00:1A:2B:3C:4D:5E'));
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.oui, '00:1A:2B');
});

test('buildMacArtifact: "FF:FF:FF:FF:FF:FF" → special Broadcast', () => {
  const { buildMacArtifact } = require(path.resolve(root, 'src/features/mac-address/payload.ts'));
  const artifact = buildMacArtifact(makeInput('FF:FF:FF:FF:FF:FF'));
  assert.ok(artifact, 'should produce artifact');
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.special, 'Broadcast');
});

// ---------------------------------------------------------------------------
// Payload: all normalized forms for "00:1A:2B:3C:4D:5E"
// ---------------------------------------------------------------------------

test('buildMacArtifact: normalized forms for "00:1A:2B:3C:4D:5E"', () => {
  const { buildMacArtifact } = require(path.resolve(root, 'src/features/mac-address/payload.ts'));
  const artifact = buildMacArtifact(makeInput('00:1A:2B:3C:4D:5E'));
  assert.ok(artifact);
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.colonLower, '00:1a:2b:3c:4d:5e');
  assert.equal(p.colonUpper, '00:1A:2B:3C:4D:5E');
  assert.equal(p.hyphen,     '00-1A-2B-3C-4D-5E');
  assert.equal(p.ciscoDot,   '001A.2B3C.4D5E');
  assert.equal(p.bare,       '001a2b3c4d5e');
  assert.equal(p.nic,        '3C:4D:5E');
});

// ---------------------------------------------------------------------------
// Payload: Cisco dot input produces same octets
// ---------------------------------------------------------------------------

test('buildMacArtifact: Cisco dot "001A.2B3C.4D5E" → same forms as colon input', () => {
  const { buildMacArtifact } = require(path.resolve(root, 'src/features/mac-address/payload.ts'));
  const artifact = buildMacArtifact(makeInput('001A.2B3C.4D5E'));
  assert.ok(artifact);
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.colonLower, '00:1a:2b:3c:4d:5e');
  assert.equal(p.colonUpper, '00:1A:2B:3C:4D:5E');
  assert.equal(p.ciscoDot,   '001A.2B3C.4D5E');
  assert.equal(p.bare,       '001a2b3c4d5e');
});

// ---------------------------------------------------------------------------
// Payload: ATTACHMENT_TYPE constant consistency
// ---------------------------------------------------------------------------

test('ATTACHMENT_TYPE constant equals plugin.extractor.mac', () => {
  const { ATTACHMENT_TYPE } = require(path.resolve(root, 'src/features/mac-address/payload.ts'));
  assert.equal(ATTACHMENT_TYPE, 'plugin.extractor.mac');
});

// ---------------------------------------------------------------------------
// Payload: decodeMacPayload
// ---------------------------------------------------------------------------

test('decodeMacPayload returns null for bad payloads', () => {
  const { decodeMacPayload } = require(path.resolve(root, 'src/features/mac-address/payload.ts'));
  assert.equal(decodeMacPayload('not-json'), null);
  assert.equal(decodeMacPayload('{"kind":"other"}'), null);
  assert.equal(decodeMacPayload(null), null);
  assert.equal(decodeMacPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createMacRenderer } = require(path.resolve(root, 'src/features/mac-address/renderer.ts'));
  const renderer = createMacRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '00:1a:2b:3c:4d:5e' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.extractor',
      attachmentType: 'plugin.extractor.mac',
      attachmentKey: 'primary',
      payloadJson: 'bad-json',
    },
  });
  assert.equal(result.shouldDisplay, false);
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createMacRenderer } = require(path.resolve(root, 'src/features/mac-address/renderer.ts'));
  const { buildMacArtifact } = require(path.resolve(root, 'src/features/mac-address/payload.ts'));
  const artifact = buildMacArtifact(makeInput('00:1A:2B:3C:4D:5E'));
  const renderer = createMacRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '00:1A:2B:3C:4D:5E' },
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

// ---------------------------------------------------------------------------
// Search projection
// ---------------------------------------------------------------------------

test('buildMacArtifact: searchProjection scope is extractor', () => {
  const { buildMacArtifact } = require(path.resolve(root, 'src/features/mac-address/payload.ts'));
  const artifact = buildMacArtifact(makeInput('00:1A:2B:3C:4D:5E'));
  assert.ok(artifact.searchProjection);
  assert.equal(artifact.searchProjection.scope, 'extractor');
  assert.equal(artifact.searchProjection.label, 'MAC Address');
  assert.ok(artifact.searchProjection.searchText.includes('00:1a:2b:3c:4d:5e'));
});
