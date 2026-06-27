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

test('manifest has csv-detector', () => {
  const ids = manifest.detectors.map((d) => d.id);
  assert.ok(ids.includes('csv-detector'), 'missing csv-detector');
});

test('manifest has csv-table renderer', () => {
  const ids = manifest.attachmentRenderers.map((r) => r.id);
  assert.ok(ids.includes('csv-table'), 'missing csv-table');
});

test('csv-table uiEntry references renderers/ path', () => {
  const renderer = manifest.attachmentRenderers.find((r) => r.id === 'csv-table');
  assert.ok(renderer.uiEntry.startsWith('renderers/'), `unexpected uiEntry: ${renderer.uiEntry}`);
});

// ---------------------------------------------------------------------------
// Payload factories — feature files required directly (not src/plugin.ts)
// ---------------------------------------------------------------------------

test('each factory file exports expected function', () => {
  const { buildCsvArtifact, createCsvPayload, decodeCsvPayload } =
    require(path.resolve(root, 'src/features/csv-table/payload.ts'));
  assert.equal(typeof buildCsvArtifact, 'function');
  assert.equal(typeof createCsvPayload, 'function');
  assert.equal(typeof decodeCsvPayload, 'function');

  const { createCsvDetector } =
    require(path.resolve(root, 'src/features/csv-table/detector.ts'));
  assert.equal(typeof createCsvDetector, 'function');

  const { createCsvRenderer } =
    require(path.resolve(root, 'src/features/csv-table/renderer.ts'));
  assert.equal(typeof createCsvRenderer, 'function');
});

// ---------------------------------------------------------------------------
// Detector / payload — comma-delimited
// ---------------------------------------------------------------------------

test('buildCsvArtifact detects comma-delimited CSV', () => {
  const { buildCsvArtifact } =
    require(path.resolve(root, 'src/features/csv-table/payload.ts'));
  const input = {
    item: sampleItem,
    content: { kind: 'text', text: 'name,age\nAlice,30\nBob,25' },
    attachments: [],
  };
  const artifact = buildCsvArtifact(input);
  assert.ok(artifact, 'artifact should not be null for valid CSV');
  assert.equal(artifact.attachmentType, 'plugin.formatter.csv');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.kind, 'csv_table');
  assert.equal(payload.colCount, 2);
  assert.equal(payload.rowCount, 2);
  assert.deepEqual(payload.headers, ['name', 'age']);
});

// ---------------------------------------------------------------------------
// Tab-delimited
// ---------------------------------------------------------------------------

test('buildCsvArtifact detects tab-delimited CSV with correct delimiter', () => {
  const { buildCsvArtifact } =
    require(path.resolve(root, 'src/features/csv-table/payload.ts'));
  const input = {
    item: sampleItem,
    content: { kind: 'text', text: 'name\tage\nAlice\t30\nBob\t25' },
    attachments: [],
  };
  const artifact = buildCsvArtifact(input);
  assert.ok(artifact, 'tab CSV should be detected');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.delimiter, '\t');
});

// ---------------------------------------------------------------------------
// Quoted field with embedded delimiter
// ---------------------------------------------------------------------------

test('buildCsvArtifact parses quoted cell containing comma', () => {
  const { buildCsvArtifact } =
    require(path.resolve(root, 'src/features/csv-table/payload.ts'));
  // Header row: a, "x, y", c  -> 3 columns; middle header should be "x, y"
  const input = {
    item: sampleItem,
    content: { kind: 'text', text: 'a,"x, y",c\n1,2,3' },
    attachments: [],
  };
  const artifact = buildCsvArtifact(input);
  assert.ok(artifact, 'quoted comma CSV should be detected');
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.colCount, 3);
  assert.equal(payload.headers[1], 'x, y');
});

// ---------------------------------------------------------------------------
// Rejection cases
// ---------------------------------------------------------------------------

test('buildCsvArtifact returns null for plain prose (single line)', () => {
  const { buildCsvArtifact } =
    require(path.resolve(root, 'src/features/csv-table/payload.ts'));
  const artifact = buildCsvArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'just a normal sentence, nothing tabular' },
    attachments: [],
  });
  assert.equal(artifact, null);
});

test('buildCsvArtifact returns null for one-column list (colCount < 2)', () => {
  const { buildCsvArtifact } =
    require(path.resolve(root, 'src/features/csv-table/payload.ts'));
  const artifact = buildCsvArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'a\nb\nc' },
    attachments: [],
  });
  assert.equal(artifact, null);
});

test('buildCsvArtifact returns null for image content kind', () => {
  const { buildCsvArtifact } =
    require(path.resolve(root, 'src/features/csv-table/payload.ts'));
  const artifact = buildCsvArtifact({
    item: sampleItem,
    content: { kind: 'image', width: 100, height: 100, format: 'png', bytes: 0 },
    attachments: [],
  });
  assert.equal(artifact, null);
});

// ---------------------------------------------------------------------------
// decodeCsvPayload
// ---------------------------------------------------------------------------

test('decodeCsvPayload returns null for bad inputs', () => {
  const { decodeCsvPayload } =
    require(path.resolve(root, 'src/features/csv-table/payload.ts'));
  assert.equal(decodeCsvPayload('not-json'), null);
  assert.equal(decodeCsvPayload('{"kind":"other"}'), null);
  assert.equal(decodeCsvPayload(null), null);
  assert.equal(decodeCsvPayload(undefined), null);
});

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

test('renderer resolveAttachment returns shouldDisplay:false for bad payload', async () => {
  const { createCsvRenderer } =
    require(path.resolve(root, 'src/features/csv-table/renderer.ts'));
  const renderer = createCsvRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: '' },
    attachments: [],
    attachment: {
      historyID: 'h1',
      owner: 'plugin.formatter',
      attachmentType: 'plugin.formatter.csv',
      attachmentKey: 'primary',
      payloadJson: 'not-valid-json',
    },
  });
  assert.equal(result.shouldDisplay, false, 'bad payload → shouldDisplay:false');
});

test('renderer resolveAttachment returns displayName for valid payload', async () => {
  const { createCsvRenderer } =
    require(path.resolve(root, 'src/features/csv-table/renderer.ts'));
  const { buildCsvArtifact } =
    require(path.resolve(root, 'src/features/csv-table/payload.ts'));
  const artifact = buildCsvArtifact({
    item: sampleItem,
    content: { kind: 'text', text: 'name,age\nAlice,30' },
    attachments: [],
  });
  const renderer = createCsvRenderer();
  const result = await renderer.resolveAttachment({
    item: sampleItem,
    content: { kind: 'text', text: 'name,age\nAlice,30' },
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

