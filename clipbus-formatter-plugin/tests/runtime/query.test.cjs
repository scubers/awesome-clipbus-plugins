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

test('manifest has query-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('query-detector'), 'missing query-detector');
});

test('manifest has query-table renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('query-table'), 'missing query-table');
});

test('query-table uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'query-table');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

test('query-table attachmentType is plugin.formatter.query', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'query-table');
  assert.equal(renderer.attachmentType, 'plugin.formatter.query');
});

test('query-detector attachmentTypes includes plugin.formatter.query', () => {
  const detector = manifest.detectors.find((d) => d.id === 'query-detector');
  assert.ok(detector.attachmentTypes.includes('plugin.formatter.query'));
});

// ---------------------------------------------------------------------------
// Payload factories — feature files required directly (not src/plugin.ts)
// ---------------------------------------------------------------------------

test('each factory file exports expected function', () => {
  const { buildQueryArtifact, createQueryPayload, decodeQueryPayload } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  assert.equal(typeof buildQueryArtifact, 'function');
  assert.equal(typeof createQueryPayload, 'function');
  assert.equal(typeof decodeQueryPayload, 'function');

  const { createQueryDetector } =
    require(path.resolve(root, 'src/features/query-table/detector.ts'));
  assert.equal(typeof createQueryDetector, 'function');

  const { createQueryRenderer } =
    require(path.resolve(root, 'src/features/query-table/renderer.ts'));
  assert.equal(typeof createQueryRenderer, 'function');
});

// ---------------------------------------------------------------------------
// Detector FIRES on valid query strings
// ---------------------------------------------------------------------------

test('buildQueryArtifact fires on "a=1&b=2&c=3"', () => {
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'a=1&b=2&c=3' },
    attachments: [],
  });
  assert.ok(artifact, 'should detect "a=1&b=2&c=3"');
  assert.equal(artifact.attachmentType, 'plugin.formatter.query');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.count, 3);
  assert.deepEqual(payload.pairs[0], { key: 'a', value: '1' });
});

test('buildQueryArtifact fires on "?x=1&y=2" (leading question mark)', () => {
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'text', text: '?x=1&y=2' },
    attachments: [],
  });
  assert.ok(artifact, 'should detect "?x=1&y=2"');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.count, 2);
  assert.deepEqual(payload.pairs[0], { key: 'x', value: '1' });
});

test('buildQueryArtifact fires on "name=John+Doe&city=New%20York" and URL-decodes', () => {
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'name=John+Doe&city=New%20York' },
    attachments: [],
  });
  assert.ok(artifact, 'should detect form-encoded pairs');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.pairs[0].value, 'John Doe', '+ decoded to space');
  assert.equal(payload.pairs[1].value, 'New York', '%20 decoded to space');
});

test('buildQueryArtifact keeps raw percent encoding when decoded values are unreadable', () => {
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'a=%00&b=%01' },
    attachments: [],
  });
  assert.ok(artifact, 'the query string itself remains valid');
  const payload = JSON.parse(artifact.payloadJson);
  assert.deepEqual(payload.pairs, [
    { key: 'a', value: '%00' },
    { key: 'b', value: '%01' },
  ]);
  assert.equal(payload.decodeError, true);
  assert.equal(artifact.searchProjection.searchText, 'a %00 b %01');
});

test('buildQueryArtifact fires on a query string whose value contains a URL "redirect=https://x.com&a=1"', () => {
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'redirect=https://x.com&a=1' },
    attachments: [],
  });
  assert.ok(artifact, 'a query string with a URL value must still fire (only a leading scheme:// is rejected)');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.count, 2);
  assert.equal(payload.pairs[0].key, 'redirect');
  assert.equal(payload.pairs[0].value, 'https://x.com');
});

// ---------------------------------------------------------------------------
// Detector REJECTS invalid inputs
// ---------------------------------------------------------------------------

test('buildQueryArtifact returns null for single pair "a=1"', () => {
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'a=1' },
    attachments: [],
  });
  assert.equal(artifact, null, 'single pair must be rejected');
});

test('buildQueryArtifact returns null for plain text "hello"', () => {
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'hello' },
    attachments: [],
  });
  assert.equal(artifact, null);
});

test('buildQueryArtifact returns null for URL "https://x.com?a=1&b=2" (has ://)', () => {
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'https://x.com?a=1&b=2' },
    attachments: [],
  });
  assert.equal(artifact, null, 'URL with :// must be rejected');
});

test('buildQueryArtifact returns null for "a=1 b=2" (internal whitespace)', () => {
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'a=1 b=2' },
    attachments: [],
  });
  assert.equal(artifact, null, 'whitespace must be rejected');
});

test('buildQueryArtifact returns null for literal control characters', () => {
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'a=\u0000&b=1' },
    attachments: [],
  });
  assert.equal(artifact, null, 'raw control characters must not enter the attachment or search index');
});

test('buildQueryArtifact returns null for "key:value"', () => {
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'key:value' },
    attachments: [],
  });
  assert.equal(artifact, null);
});

test('buildQueryArtifact returns null for empty string', () => {
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
  });
  assert.equal(artifact, null);
});

test('buildQueryArtifact returns null for image content kind', () => {
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'image', width: 100, height: 100, format: 'png', bytes: 0 },
    attachments: [],
  });
  assert.equal(artifact, null);
});

// ---------------------------------------------------------------------------
// Duplicate keys
// ---------------------------------------------------------------------------

test('buildQueryArtifact detects duplicate keys and last value wins in jsonObject', () => {
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'a=1&a=2' },
    attachments: [],
  });
  assert.ok(artifact, 'a=1&a=2 should be detected');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.hasDuplicateKeys, true);
  const obj = JSON.parse(payload.jsonObject);
  assert.equal(obj.a, '2', 'last value wins');
});

// ---------------------------------------------------------------------------
// searchProjection
// ---------------------------------------------------------------------------

test('artifact searchProjection has scope "formatter" and label "Query String"', () => {
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'foo=bar&baz=qux' },
    attachments: [],
  });
  assert.ok(artifact.searchProjection);
  assert.equal(artifact.searchProjection.scope, 'formatter');
  assert.equal(artifact.searchProjection.label, 'Query String');
  assert.ok(artifact.searchProjection.searchText.includes('foo'));
});

// ---------------------------------------------------------------------------
// decodeQueryPayload
// ---------------------------------------------------------------------------

test('decodeQueryPayload returns null for bad inputs', () => {
  const { decodeQueryPayload } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  assert.equal(decodeQueryPayload('not-json'), null);
  assert.equal(decodeQueryPayload('{"kind":"other"}'), null);
  assert.equal(decodeQueryPayload(null), null);
  assert.equal(decodeQueryPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createQueryRenderer } =
    require(path.resolve(root, 'src/features/query-table/renderer.ts'));
  const renderer = createQueryRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.formatter',
      attachmentType: 'plugin.formatter.query',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createQueryRenderer } =
    require(path.resolve(root, 'src/features/query-table/renderer.ts'));
  const { buildQueryArtifact } =
    require(path.resolve(root, 'src/features/query-table/payload.ts'));
  const artifact = buildQueryArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'foo=1&bar=2' },
    attachments: [],
  });
  const renderer = createQueryRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: 'foo=1&bar=2' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.formatter',
      attachmentType: artifact.attachmentType,
      attachmentKey: artifact.attachmentKey,
      payloadJson: artifact.payloadJson,
    },
  });
  assert.ok(result.displayName, 'displayName should be set');
  assert.notEqual(result.shouldDisplay, false, 'valid payload should display');
});
