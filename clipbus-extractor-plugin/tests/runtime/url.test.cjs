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

const sampleUrl = 'https://example.com:8080/a/b?x=1&y=2#frag';

// ---------------------------------------------------------------------------
// Manifest shape
// ---------------------------------------------------------------------------

test('manifest has url-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('url-detector'), 'missing url-detector');
});

test('manifest has url-parsed renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('url-parsed'), 'missing url-parsed');
});

test('url-parsed uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'url-parsed');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

// ---------------------------------------------------------------------------
// Feature factories — each returns a handler with the expected method
// ---------------------------------------------------------------------------

test('createUrlDetector returns a handler with detect method', () => {
  const { createUrlDetector } = require(path.resolve(root, 'src/features/url-parsed/detector.ts'));
  const handler = createUrlDetector();
  assert.equal(typeof handler.detect, 'function');
});

test('createUrlRenderer returns a handler with resolveAttachment method', () => {
  const { createUrlRenderer } = require(path.resolve(root, 'src/features/url-parsed/renderer.ts'));
  const handler = createUrlRenderer();
  assert.equal(typeof handler.resolveAttachment, 'function');
});

// ---------------------------------------------------------------------------
// Detector / payload
// ---------------------------------------------------------------------------

test('buildUrlArtifact parses full URL with host, port, query, hash', () => {
  const { buildUrlArtifact } = require(path.resolve(root, 'src/features/url-parsed/payload.ts'));
  const artifact = buildUrlArtifact({
    item: sampleItem,
    content: { kind: 'text', text: sampleUrl },
    attachments: [],
  });
  assert.ok(artifact, 'artifact should not be null for valid URL');
  assert.equal(artifact.attachmentType, 'plugin.extractor.url');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.kind, 'url_parsed');
  assert.equal(payload.host, 'example.com');
  assert.equal(payload.port, '8080');
  assert.equal(payload.query.length, 2);
  assert.equal(payload.query[0].key, 'x');
  assert.equal(payload.query[0].value, '1');
  assert.equal(payload.query[1].key, 'y');
  assert.equal(payload.query[1].value, '2');
});

test('buildUrlArtifact returns null for plain text', () => {
  const { buildUrlArtifact } = require(path.resolve(root, 'src/features/url-parsed/payload.ts'));
  const artifact = buildUrlArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'hello world' },
    attachments: [],
  });
  assert.equal(artifact, null, 'plain text should not produce artifact');
});

test('buildUrlArtifact returns null for mailto: (no // authority)', () => {
  const { buildUrlArtifact } = require(path.resolve(root, 'src/features/url-parsed/payload.ts'));
  const artifact = buildUrlArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'mailto:a@b.com' },
    attachments: [],
  });
  assert.equal(artifact, null, 'mailto: should not produce artifact');
});

test('buildUrlArtifact detects plain https URL', () => {
  const { buildUrlArtifact } = require(path.resolve(root, 'src/features/url-parsed/payload.ts'));
  const artifact = buildUrlArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'https://example.com/p?a=1' },
    attachments: [],
  });
  assert.ok(artifact, 'https URL should be detected');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.scheme, 'https');
  assert.equal(payload.query.length, 1);
});

test('decodeUrlPayload returns null for bad payloads', () => {
  const { decodeUrlPayload } = require(path.resolve(root, 'src/features/url-parsed/payload.ts'));
  assert.equal(decodeUrlPayload('not-json'), null);
  assert.equal(decodeUrlPayload('{"kind":"other"}'), null);
  assert.equal(decodeUrlPayload(null), null);
  assert.equal(decodeUrlPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Tracking param detection
// ---------------------------------------------------------------------------

test('createUrlPayload strips utm_* and fbclid from cleanHref, keeps legit params', () => {
  const { buildUrlArtifact } = require(path.resolve(root, 'src/features/url-parsed/payload.ts'));
  const artifact = buildUrlArtifact({
    item: sampleItem,
    content: {
      kind: 'text',
      text: 'https://example.com/article?utm_source=newsletter&utm_medium=email&fbclid=AbC123&id=42',
    },
    attachments: [],
  });
  assert.ok(artifact, 'artifact should not be null');
  const payload = JSON.parse(artifact.payloadJson);
  // trackingParams lists only the trackers
  assert.equal(payload.trackingParams.length, 3);
  const trackerKeys = payload.trackingParams.map((p) => p.key);
  assert.ok(trackerKeys.includes('utm_source'), 'utm_source should be tracked');
  assert.ok(trackerKeys.includes('utm_medium'), 'utm_medium should be tracked');
  assert.ok(trackerKeys.includes('fbclid'), 'fbclid should be tracked');
  // cleanHref keeps the legit param and path, strips the trackers
  const clean = new URL(payload.cleanHref);
  assert.equal(clean.searchParams.get('id'), '42', 'legit param id=42 must survive');
  assert.equal(clean.searchParams.get('utm_source'), null, 'utm_source must be removed');
  assert.equal(clean.searchParams.get('fbclid'), null, 'fbclid must be removed');
  assert.equal(clean.pathname, '/article', 'path must be preserved');
  // query array still has all four params (unchanged)
  assert.equal(payload.query.length, 4);
});

test('createUrlPayload with no tracking params: trackingParams empty, cleanHref === href', () => {
  const { buildUrlArtifact } = require(path.resolve(root, 'src/features/url-parsed/payload.ts'));
  const artifact = buildUrlArtifact({
    item: sampleItem,
    content: {
      kind: 'text',
      text: 'https://example.com/p?page=2&lang=en',
    },
    attachments: [],
  });
  assert.ok(artifact, 'artifact should not be null');
  const payload = JSON.parse(artifact.payloadJson);
  assert.deepEqual(payload.trackingParams, [], 'trackingParams should be empty');
  assert.equal(payload.cleanHref, payload.href, 'cleanHref should equal href when no trackers');
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createUrlRenderer } = require(path.resolve(root, 'src/features/url-parsed/renderer.ts'));
  const renderer = createUrlRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.extractor',
      attachmentType: 'plugin.extractor.url',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createUrlRenderer } = require(path.resolve(root, 'src/features/url-parsed/renderer.ts'));
  const { buildUrlArtifact } = require(path.resolve(root, 'src/features/url-parsed/payload.ts'));
  const artifact = buildUrlArtifact({
    item: sampleItem,
    content: { kind: 'text', text: sampleUrl },
    attachments: [],
  });
  const renderer = createUrlRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: sampleUrl },
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

