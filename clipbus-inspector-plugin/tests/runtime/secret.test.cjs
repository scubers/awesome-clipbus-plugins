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

test('manifest has secret-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('secret-detector'), 'missing secret-detector');
});

test('manifest has secret-renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('secret-renderer'), 'missing secret-renderer');
});

test('secret-renderer uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'secret-renderer');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

test('secret-detector attachmentType is plugin.inspector.secret', () => {
  const detector = manifest.detectors.find((d) => d.id === 'secret-detector');
  assert.ok(detector.attachmentTypes.includes('plugin.inspector.secret'));
});

// ---------------------------------------------------------------------------
// scanSecrets — specific pattern matching
// ---------------------------------------------------------------------------

test('scanSecrets detects AWS Access Key ID', () => {
  const { scanSecrets } = require(path.resolve(root, 'src/features/secret-renderer/payload.ts'));
  const rawKey = 'AKIAIOSFODNN7EXAMPLE';
  const matches = scanSecrets(`My key is ${rawKey} in the config`);
  assert.ok(matches.length > 0, 'should match');
  const m = matches.find((x) => x.type === 'aws-access-key');
  assert.ok(m, 'should find aws-access-key type');
  assert.equal(m.label, 'AWS Access Key ID');
  assert.equal(m.confidence, 'high');
  // Critical: masked must not equal and must not contain the full raw secret.
  assert.notEqual(m.masked, rawKey, 'masked must not equal raw secret');
  assert.ok(!m.masked.includes(rawKey), 'masked must not contain raw secret');
});

test('scanSecrets detects GitHub classic token', () => {
  const { scanSecrets } = require(path.resolve(root, 'src/features/secret-renderer/payload.ts'));
  const fakeToken = 'ghp_' + 'A'.repeat(36);
  const matches = scanSecrets(`token: ${fakeToken}`);
  const m = matches.find((x) => x.type === 'github-token');
  assert.ok(m, 'should find github-token');
  assert.equal(m.label, 'GitHub Token');
  assert.notEqual(m.masked, fakeToken, 'masked must not equal raw token');
  assert.ok(!m.masked.includes(fakeToken), 'masked must not contain raw token');
});

test('scanSecrets detects PEM private key — stores only header line, not key body', () => {
  const { scanSecrets } = require(path.resolve(root, 'src/features/secret-renderer/payload.ts'));
  const pemText = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEAverylongkeydata\n-----END RSA PRIVATE KEY-----';
  const matches = scanSecrets(pemText);
  const m = matches.find((x) => x.type === 'pem-key');
  assert.ok(m, 'should find pem-key');
  assert.equal(m.label, 'Private Key (PEM)');
  // Must not contain any key body material.
  assert.ok(!m.masked.includes('MIIEpAIBAAKCAQEA'), 'masked must not contain key body');
  assert.ok(!m.masked.includes('verylongkeydata'), 'masked must not contain key body');
  // Should contain the BEGIN label.
  assert.ok(m.masked.includes('BEGIN'), 'masked should be the BEGIN header line');
});

// ---------------------------------------------------------------------------
// scanSecrets — negative cases
// ---------------------------------------------------------------------------

test('scanSecrets returns empty for plain prose', () => {
  const { scanSecrets } = require(path.resolve(root, 'src/features/secret-renderer/payload.ts'));
  const result = scanSecrets('Hello, this is a perfectly normal sentence with no secrets at all.');
  assert.equal(result.length, 0, 'plain prose should produce no matches');
});

test('scanSecrets does NOT match a plain JWT', () => {
  const { scanSecrets } = require(path.resolve(root, 'src/features/secret-renderer/payload.ts'));
  // A typical JWT — owned by the JWT decoder plugin, not this detector.
  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  const result = scanSecrets(`token: ${jwt}`);
  assert.equal(result.length, 0, 'JWT should not be matched by the secret detector');
});

// ---------------------------------------------------------------------------
// buildSecretArtifact
// ---------------------------------------------------------------------------

test('buildSecretArtifact returns artifact for text with AWS key', () => {
  const { buildSecretArtifact } = require(path.resolve(root, 'src/features/secret-renderer/payload.ts'));
  const input = {
    item: sampleItem,
    content: { kind: 'text', text: 'AKIAIOSFODNN7EXAMPLE' },
    attachments: [],
  };
  const artifact = buildSecretArtifact(input);
  assert.ok(artifact, 'should return artifact');
  assert.equal(artifact.attachmentType, 'plugin.inspector.secret');
  assert.equal(artifact.attachmentKey, 'primary');
});

test('buildSecretArtifact has no searchProjection — secrets must not be indexed', () => {
  const { buildSecretArtifact } = require(path.resolve(root, 'src/features/secret-renderer/payload.ts'));
  const artifact = buildSecretArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'AKIAIOSFODNN7EXAMPLE' },
    attachments: [],
  });
  assert.ok(artifact, 'artifact should exist');
  assert.equal(artifact.searchProjection, undefined, 'secrets must not be indexed into search');
});

test('payloadJson never contains the raw secret value', () => {
  const { buildSecretArtifact } = require(path.resolve(root, 'src/features/secret-renderer/payload.ts'));
  const rawKey = 'AKIAIOSFODNN7EXAMPLE';
  const artifact = buildSecretArtifact({
    item: sampleItem,
    content: { kind: 'text', text: rawKey },
    attachments: [],
  });
  assert.ok(artifact, 'artifact should exist');
  assert.ok(
    !artifact.payloadJson.includes(rawKey),
    'payloadJson must not contain the raw secret — only the masked value'
  );
});

test('buildSecretArtifact returns null for image content kind', () => {
  const { buildSecretArtifact } = require(path.resolve(root, 'src/features/secret-renderer/payload.ts'));
  const artifact = buildSecretArtifact({
    item: sampleItem,
    content: { kind: 'image', width: 100, height: 100, format: 'png', bytes: 0 },
    attachments: [],
  });
  assert.equal(artifact, null);
});

test('buildSecretArtifact returns null for prose text with no secrets', () => {
  const { buildSecretArtifact } = require(path.resolve(root, 'src/features/secret-renderer/payload.ts'));
  const artifact = buildSecretArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'Hello world, no secrets here at all.' },
    attachments: [],
  });
  assert.equal(artifact, null);
});

// ---------------------------------------------------------------------------
// decodeSecretPayload
// ---------------------------------------------------------------------------

test('decodeSecretPayload returns null for bad data', () => {
  const { decodeSecretPayload } = require(path.resolve(root, 'src/features/secret-renderer/payload.ts'));
  assert.equal(decodeSecretPayload('not-json'), null);
  assert.equal(decodeSecretPayload('{"kind":"other"}'), null);
  assert.equal(decodeSecretPayload(null), null);
  assert.equal(decodeSecretPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createSecretRenderer } = require(path.resolve(root, 'src/features/secret-renderer/renderer.ts'));
  const renderer = createSecretRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.inspector',
      attachmentType: 'plugin.inspector.secret',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createSecretRenderer } = require(path.resolve(root, 'src/features/secret-renderer/renderer.ts'));
  const { buildSecretArtifact } = require(path.resolve(root, 'src/features/secret-renderer/payload.ts'));
  const artifact = buildSecretArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'AKIAIOSFODNN7EXAMPLE' },
    attachments: [],
  });
  const renderer = createSecretRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: 'AKIAIOSFODNN7EXAMPLE' },
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
