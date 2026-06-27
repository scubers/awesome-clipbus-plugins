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

test('manifest has data-uri-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('data-uri-detector'), 'missing data-uri-detector');
});

test('manifest has data-uri renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('data-uri'), 'missing data-uri renderer');
});

test('data-uri renderer uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'data-uri');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

test('data-uri-detector attachmentTypes contains plugin.decoder.datauri', () => {
  const detector = manifest.detectors.find((d) => d.id === 'data-uri-detector');
  assert.ok(detector.attachmentTypes.includes('plugin.decoder.datauri'));
});

test('data-uri renderer attachmentType is plugin.decoder.datauri', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'data-uri');
  assert.equal(renderer.attachmentType, 'plugin.decoder.datauri');
});

// ---------------------------------------------------------------------------
// Detector fires on valid data URIs
// ---------------------------------------------------------------------------

test('fires on data:text/plain;base64,SGVsbG8=', () => {
  const { buildDataUriArtifact } = require(path.resolve(root, 'src/features/data-uri/payload.ts'));
  const artifact = buildDataUriArtifact(makeInput('data:text/plain;base64,SGVsbG8='));
  assert.ok(artifact, 'should detect data URI');
  assert.equal(artifact.attachmentType, 'plugin.decoder.datauri');
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.kind, 'data_uri_preview');
  assert.equal(p.mediaType, 'text/plain');
  assert.equal(p.isBase64, true);
  assert.equal(p.decodedSize, '5 B');
  assert.equal(p.decodedTextPreview, 'Hello');
});

test('fires on data:image/png;base64,iVBORw0KGgo=', () => {
  const { buildDataUriArtifact } = require(path.resolve(root, 'src/features/data-uri/payload.ts'));
  const artifact = buildDataUriArtifact(makeInput('data:image/png;base64,iVBORw0KGgo='));
  assert.ok(artifact, 'should detect image data URI');
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.isImage, true);
  assert.equal(p.decodedTextPreview, null);
});

test('fires on data:text/plain,Hello%20World', () => {
  const { buildDataUriArtifact } = require(path.resolve(root, 'src/features/data-uri/payload.ts'));
  const artifact = buildDataUriArtifact(makeInput('data:text/plain,Hello%20World'));
  assert.ok(artifact, 'should detect plain data URI');
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.isBase64, false);
  assert.equal(p.decodedTextPreview, 'Hello World');
});

test('fires on data:,Hello — empty mediatype defaults to text/plain;charset=US-ASCII', () => {
  const { buildDataUriArtifact } = require(path.resolve(root, 'src/features/data-uri/payload.ts'));
  const artifact = buildDataUriArtifact(makeInput('data:,Hello'));
  assert.ok(artifact, 'should detect data URI with no mediatype');
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.mediaType, 'text/plain;charset=US-ASCII');
  assert.equal(p.isDefault, true);
});

// ---------------------------------------------------------------------------
// Detector rejects non-data-URIs
// ---------------------------------------------------------------------------

test('rejects plain text "hello"', () => {
  const { buildDataUriArtifact } = require(path.resolve(root, 'src/features/data-uri/payload.ts'));
  assert.equal(buildDataUriArtifact(makeInput('hello')), null);
});

test('rejects bare base64 "SGVsbG8="', () => {
  const { buildDataUriArtifact } = require(path.resolve(root, 'src/features/data-uri/payload.ts'));
  assert.equal(buildDataUriArtifact(makeInput('SGVsbG8=')), null);
});

test('rejects URL "https://x.com"', () => {
  const { buildDataUriArtifact } = require(path.resolve(root, 'src/features/data-uri/payload.ts'));
  assert.equal(buildDataUriArtifact(makeInput('https://x.com')), null);
});

test('rejects "data:" with no comma', () => {
  const { buildDataUriArtifact } = require(path.resolve(root, 'src/features/data-uri/payload.ts'));
  assert.equal(buildDataUriArtifact(makeInput('data:')), null);
});

test('rejects empty string', () => {
  const { buildDataUriArtifact } = require(path.resolve(root, 'src/features/data-uri/payload.ts'));
  assert.equal(buildDataUriArtifact(makeInput('')), null);
});

test('rejects image content kind', () => {
  const { buildDataUriArtifact } = require(path.resolve(root, 'src/features/data-uri/payload.ts'));
  const artifact = buildDataUriArtifact({
    item: sampleItem,
    content: { kind: 'image', width: 100, height: 100, format: 'png', bytes: 0 },
    attachments: [],
  });
  assert.equal(artifact, null);
});

// ---------------------------------------------------------------------------
// decodeDataUriPayload
// ---------------------------------------------------------------------------

test('decodeDataUriPayload returns null for non-data_uri_preview payloads', () => {
  const { decodeDataUriPayload } = require(path.resolve(root, 'src/features/data-uri/payload.ts'));
  assert.equal(decodeDataUriPayload('not-json'), null);
  assert.equal(decodeDataUriPayload('{"kind":"other"}'), null);
  assert.equal(decodeDataUriPayload(null), null);
  assert.equal(decodeDataUriPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createDataUriRenderer } = require(path.resolve(root, 'src/features/data-uri/renderer.ts'));
  const renderer = createDataUriRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.decoder',
      attachmentType: 'plugin.decoder.datauri',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createDataUriRenderer } = require(path.resolve(root, 'src/features/data-uri/renderer.ts'));
  const { buildDataUriArtifact } = require(path.resolve(root, 'src/features/data-uri/payload.ts'));
  const artifact = buildDataUriArtifact(makeInput('data:text/plain;base64,SGVsbG8='));
  const renderer = createDataUriRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: 'data:text/plain;base64,SGVsbG8=' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.decoder',
      attachmentType: artifact.attachmentType,
      attachmentKey: artifact.attachmentKey,
      payloadJson: artifact.payloadJson,
    },
  });
  assert.ok(result.displayName, 'displayName should be set');
  assert.notEqual(result.shouldDisplay, false, 'valid payload should display');
});
