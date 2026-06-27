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

test('manifest has entities-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('entities-detector'), 'missing entities-detector');
});

test('manifest has entities-renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('entities-renderer'), 'missing entities-renderer');
});

test('entities-renderer uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'entities-renderer');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

// ---------------------------------------------------------------------------
// Detector / payload
// ---------------------------------------------------------------------------

test('detector extracts urls, email, and ip from mixed text', async () => {
  const { buildEntitiesArtifact } = require(path.resolve(root, 'src/features/entities-renderer/payload.ts'));
  const text = 'Contact me at john@example.com or visit https://example.com and https://foo.org, server 192.168.1.1';
  const input = { item: sampleItem, content: { kind: 'text', text }, attachments: [] };
  const artifact = buildEntitiesArtifact(input);
  assert.ok(artifact, 'artifact should not be null for mixed input');
  assert.equal(artifact.attachmentType, 'plugin.extractor.entities');
  const payload = JSON.parse(artifact.payloadJson);
  assert.ok(payload.urls.includes('https://example.com'), 'should include https://example.com');
  assert.ok(payload.urls.includes('https://foo.org'), 'should include https://foo.org');
  assert.ok(payload.emails.includes('john@example.com'), 'should include john@example.com');
  assert.ok(payload.ips.includes('192.168.1.1'), 'should include 192.168.1.1');
  assert.equal(payload.totalCount, 4, 'totalCount should be 4');
});

test('detector returns null for plain text', () => {
  const { buildEntitiesArtifact } = require(path.resolve(root, 'src/features/entities-renderer/payload.ts'));
  const artifact = buildEntitiesArtifact({ item: sampleItem, content: { kind: 'text', text: 'just some plain text without links' }, attachments: [] });
  assert.equal(artifact, null, 'plain text should return null');
});

test('detector returns null when only one entity found', () => {
  const { buildEntitiesArtifact } = require(path.resolve(root, 'src/features/entities-renderer/payload.ts'));
  const artifact = buildEntitiesArtifact({ item: sampleItem, content: { kind: 'text', text: 'https://only-one.com' }, attachments: [] });
  assert.equal(artifact, null, 'single entity (total < 2) should return null');
});

test('detector deduplicates repeated URLs', () => {
  const { buildEntitiesArtifact } = require(path.resolve(root, 'src/features/entities-renderer/payload.ts'));
  const text = 'See https://example.com and also https://example.com again, also https://other.com';
  const artifact = buildEntitiesArtifact({ item: sampleItem, content: { kind: 'text', text }, attachments: [] });
  assert.ok(artifact, 'artifact should not be null');
  const payload = JSON.parse(artifact.payloadJson);
  const count = payload.urls.filter((u) => u === 'https://example.com').length;
  assert.equal(count, 1, 'duplicate URL should appear only once');
});

test('detector strips trailing punctuation from URLs', () => {
  const { buildEntitiesArtifact } = require(path.resolve(root, 'src/features/entities-renderer/payload.ts'));
  const text = 'Visit https://example.com, and https://foo.org.';
  const artifact = buildEntitiesArtifact({ item: sampleItem, content: { kind: 'text', text }, attachments: [] });
  assert.ok(artifact, 'artifact should not be null');
  const payload = JSON.parse(artifact.payloadJson);
  assert.ok(payload.urls.includes('https://example.com'), 'trailing comma stripped');
  assert.ok(payload.urls.includes('https://foo.org'), 'trailing period stripped');
});

test('decodeEntitiesPayload returns null for bad data', () => {
  const { decodeEntitiesPayload } = require(path.resolve(root, 'src/features/entities-renderer/payload.ts'));
  assert.equal(decodeEntitiesPayload('not-json'), null);
  assert.equal(decodeEntitiesPayload('{"kind":"other"}'), null);
  assert.equal(decodeEntitiesPayload(null), null);
  assert.equal(decodeEntitiesPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createEntitiesRenderer } = require(path.resolve(root, 'src/features/entities-renderer/renderer.ts'));
  const renderer = createEntitiesRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.extractor',
      attachmentType: 'plugin.extractor.entities',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createEntitiesRenderer } = require(path.resolve(root, 'src/features/entities-renderer/renderer.ts'));
  const { buildEntitiesArtifact } = require(path.resolve(root, 'src/features/entities-renderer/payload.ts'));
  const text = 'Contact me at john@example.com or visit https://example.com and https://foo.org, server 192.168.1.1';
  const artifact = buildEntitiesArtifact({ item: sampleItem, content: { kind: 'text', text }, attachments: [] });
  const renderer = createEntitiesRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text },
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

