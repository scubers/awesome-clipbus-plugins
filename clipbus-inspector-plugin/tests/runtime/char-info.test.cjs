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

const IMAGE_INPUT = { item: sampleItem, content: { kind: 'image', width: 100, height: 100, format: 'png', bytes: 1000 }, attachments: [] };

test('ZWJ emoji sequence is NOT marked invisible (joiner U+200D is \\p{Cf})', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('👨‍👩‍👧'));
  assert.ok(artifact, 'family emoji should fire as a single grapheme');
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.isInvisible, false, 'visible ZWJ emoji must not be flagged invisible');
  assert.ok(p.codePoints.length >= 3, `expected multiple code points, got ${p.codePoints.length}`);
});

// ---------------------------------------------------------------------------
// Manifest shape
// ---------------------------------------------------------------------------

test('manifest has char-info-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('char-info-detector'), 'missing char-info-detector');
});

test('manifest has char-info-renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('char-info-renderer'), 'missing char-info-renderer');
});

test('char-info-detector supportedInputKinds includes text', () => {
  const det = manifest.detectors.find((d) => d.id === 'char-info-detector');
  assert.ok(det.supportedInputKinds.includes('text'), 'supportedInputKinds must include "text"');
});

test('char-info-renderer uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'char-info-renderer');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

test('char-info-detector attachmentTypes contains plugin.inspector.char-info', () => {
  const det = manifest.detectors.find((d) => d.id === 'char-info-detector');
  assert.ok(
    det.attachmentTypes.includes('plugin.inspector.char-info'),
    'attachmentTypes must include plugin.inspector.char-info'
  );
});

test('char-info-renderer attachmentType is plugin.inspector.char-info', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'char-info-renderer');
  assert.equal(renderer.attachmentType, 'plugin.inspector.char-info');
});

// ---------------------------------------------------------------------------
// Detector fires
// ---------------------------------------------------------------------------

test('fires on emoji 😀', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('😀'));
  assert.ok(artifact, 'should fire on 😀');
  assert.equal(artifact.attachmentType, 'plugin.inspector.char-info');
});

test('fires on CJK character 中', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('中'));
  assert.ok(artifact, 'should fire on 中');
});

test('fires on accented letter é', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('é'));
  assert.ok(artifact, 'should fire on é');
});

test('fires on copyright symbol ©', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('©'));
  assert.ok(artifact, 'should fire on ©');
});

test('fires on U+1F600 notation', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('U+1F600'));
  assert.ok(artifact, 'should fire on U+1F600 notation');
});

test('fires on U+200B (ZERO WIDTH SPACE)', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('​'));
  assert.ok(artifact, 'should fire on U+200B');
});

// ---------------------------------------------------------------------------
// Detector rejects
// ---------------------------------------------------------------------------

test('rejects plain ASCII letter "a"', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  assert.equal(buildCharArtifact(makeInput('a')), null, '"a" should return null');
});

test('rejects two-char ASCII "ab"', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  assert.equal(buildCharArtifact(makeInput('ab')), null, '"ab" should return null');
});

test('rejects multi-word text "hello world"', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  assert.equal(buildCharArtifact(makeInput('hello world')), null, '"hello world" should return null');
});

test('rejects empty string', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  assert.equal(buildCharArtifact(makeInput('')), null, 'empty string should return null');
});

test('rejects image kind', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  assert.equal(buildCharArtifact(IMAGE_INPUT), null, 'image kind should return null');
});

// ---------------------------------------------------------------------------
// 😀 payload assertions
// ---------------------------------------------------------------------------

test('😀 codePoints is ["U+1F600"]', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('😀'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.deepEqual(payload.codePoints, ['U+1F600']);
});

test('😀 utf8 is "F0 9F 98 80"', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('😀'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.utf8, 'F0 9F 98 80');
});

test('😀 utf16 is "D83D DE00"', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('😀'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.utf16, 'D83D DE00');
});

test('😀 category is "Emoji"', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('😀'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.category, 'Emoji');
});

// ---------------------------------------------------------------------------
// 中 payload assertions
// ---------------------------------------------------------------------------

test('中 codePoints is ["U+4E2D"]', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('中'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.deepEqual(payload.codePoints, ['U+4E2D']);
});

test('中 utf8 is "E4 B8 AD"', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('中'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.utf8, 'E4 B8 AD');
});

// ---------------------------------------------------------------------------
// © payload assertions
// ---------------------------------------------------------------------------

test('© htmlEntity contains "&#xA9;"', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('©'));
  const payload = JSON.parse(artifact.payloadJson);
  assert.ok(
    payload.htmlEntity.includes('&#xA9;'),
    `expected htmlEntity to contain "&#xA9;", got: ${payload.htmlEntity}`
  );
});

// ---------------------------------------------------------------------------
// U+1F600 notation path
// ---------------------------------------------------------------------------

test('U+1F600 notation resolves to 😀 payload', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('U+1F600'));
  assert.ok(artifact, 'should produce artifact for U+1F600');
  const payload = JSON.parse(artifact.payloadJson);
  assert.deepEqual(payload.codePoints, ['U+1F600']);
  assert.equal(payload.utf8, 'F0 9F 98 80');
  assert.equal(payload.utf16, 'D83D DE00');
  assert.equal(payload.category, 'Emoji');
});

// ---------------------------------------------------------------------------
// U+200B invisible
// ---------------------------------------------------------------------------

test('U+200B isInvisible is true', () => {
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('​'));
  assert.ok(artifact, 'should fire on U+200B');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.isInvisible, true, 'U+200B should be invisible');
});

// ---------------------------------------------------------------------------
// decodeCharPayload
// ---------------------------------------------------------------------------

test('decodeCharPayload returns null for bad JSON', () => {
  const { decodeCharPayload } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  assert.equal(decodeCharPayload('not-json'), null);
  assert.equal(decodeCharPayload('{"kind":"other"}'), null);
  assert.equal(decodeCharPayload(null), null);
  assert.equal(decodeCharPayload(undefined), null);
});

test('decodeCharPayload round-trips a valid payload', () => {
  const { buildCharArtifact, decodeCharPayload } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('😀'));
  const decoded = decodeCharPayload(artifact.payloadJson);
  assert.ok(decoded, 'decoded payload should not be null');
  assert.equal(decoded.kind, 'char_info');
  assert.deepEqual(decoded.codePoints, ['U+1F600']);
  assert.equal(decoded.category, 'Emoji');
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createCharInfoRenderer } = require(path.resolve(root, 'src/features/char-info-renderer/renderer.ts'));
  const renderer = createCharInfoRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '😀' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.inspector',
      attachmentType: 'plugin.inspector.char-info',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createCharInfoRenderer } = require(path.resolve(root, 'src/features/char-info-renderer/renderer.ts'));
  const { buildCharArtifact } = require(path.resolve(root, 'src/features/char-info-renderer/payload.ts'));
  const artifact = buildCharArtifact(makeInput('😀'));
  const renderer = createCharInfoRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '😀' },
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
