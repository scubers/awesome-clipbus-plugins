'use strict';
/**
 * vibe.test.cjs — 冒烟测试
 * 覆盖：manifest 校验、payload 构造/解码、detector、renderer 让位逻辑
 * 运行：node --experimental-strip-types --require ./tests/setup.cjs --test ./tests/runtime/vibe.test.cjs
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');

// ── manifest ──────────────────────────────────────────────────────────────────
const manifest = require(path.join(ROOT, 'manifest.json'));

describe('manifest', () => {
  it('plugin id is plugin.vibe', () => {
    assert.equal(manifest.plugin.id, 'plugin.vibe');
  });

  it('detector id is vibe-detector and attachmentType starts with plugin.vibe.', () => {
    const det = manifest.detectors[0];
    assert.ok(det, 'detector entry must exist');
    assert.equal(det.id, 'vibe-detector');
    assert.ok(det.attachmentTypes.every((t) => t.startsWith('plugin.vibe.')),
      'all detector attachmentTypes must be in plugin.vibe. namespace');
  });

  it('renderer id is vibe-fallback and attachmentType is plugin.vibe.fallback', () => {
    const rend = manifest.attachmentRenderers[0];
    assert.ok(rend, 'renderer entry must exist');
    assert.equal(rend.id, 'vibe-fallback');
    assert.equal(rend.attachmentType, 'plugin.vibe.fallback');
  });
});

// ── payload ───────────────────────────────────────────────────────────────────
const { buildVibeArtifact, decodeVibePayload, createVibePayload } =
  require(path.join(ROOT, 'src/features/vibe-fallback/payload.ts'));

describe('payload', () => {
  it('buildVibeArtifact returns artifact for text input', () => {
    const art = buildVibeArtifact({ content: { kind: 'text', text: 'hi' }, attachments: [], item: {} });
    assert.ok(art, 'should return artifact');
    assert.equal(art.attachmentType, 'plugin.vibe.fallback');
    assert.equal(art.attachmentKey, 'primary');
    assert.equal('attachmentSyncScope' in art, false);
  });

  it('buildVibeArtifact returns null for blank text', () => {
    const art = buildVibeArtifact({ content: { kind: 'text', text: '   ' }, attachments: [], item: {} });
    assert.equal(art, null);
  });

  it('buildVibeArtifact returns null for non-text kind (image)', () => {
    const art = buildVibeArtifact({ content: { kind: 'image', width: 10, height: 10, format: 'png', bytes: 0 }, attachments: [], item: {} });
    assert.equal(art, null);
  });

  it('decodeVibePayload returns null for bad json', () => {
    assert.equal(decodeVibePayload('not-json'), null);
  });

  it('decodeVibePayload returns null for missing kind', () => {
    assert.equal(decodeVibePayload(JSON.stringify({ text: 'x', version: 1 })), null);
  });

  it('decodeVibePayload returns object for valid payload', () => {
    const p = JSON.stringify({ kind: 'vibe_fallback', version: 1, text: 'hello', charCount: 5 });
    const decoded = decodeVibePayload(p);
    assert.ok(decoded);
    assert.equal(decoded.kind, 'vibe_fallback');
    assert.equal(decoded.text, 'hello');
  });

  it('createVibePayload truncates text to 280 chars', () => {
    const longText = 'a'.repeat(400);
    const p = createVibePayload({ content: { kind: 'text', text: longText }, attachments: [], item: {} });
    assert.ok(p);
    assert.equal(p.text.length, 280);
    assert.equal(p.charCount, 400);
  });
});

// ── renderer (让位逻辑) ────────────────────────────────────────────────────────
const { resolveAttachment } =
  require(path.join(ROOT, 'src/features/vibe-fallback/renderer.ts'));

const VALID_PAYLOAD_JSON = JSON.stringify({ kind: 'vibe_fallback', version: 1, text: 'hello world', charCount: 11 });

describe('renderer resolveAttachment', () => {
  it('displays when only plugin.vibe attachments exist', () => {
    const result = resolveAttachment({
      attachments: [{ attachmentType: 'plugin.vibe.fallback', attachmentKey: 'primary' }],
      attachment: { historyID: 'x', owner: 'plugin.vibe', attachmentType: 'plugin.vibe.fallback', attachmentKey: 'primary', payloadJson: VALID_PAYLOAD_JSON },
      item: {},
      content: { kind: 'text', text: 'hello world' },
    });
    assert.notEqual(result.shouldDisplay, false, 'should NOT yield when only vibe attachments exist');
  });

  it('yields (shouldDisplay=false) when a foreign plugin attachment exists', () => {
    const result = resolveAttachment({
      attachments: [
        { attachmentType: 'plugin.decoder.base64', attachmentKey: 'x' },
        { attachmentType: 'plugin.vibe.fallback', attachmentKey: 'primary' },
      ],
      attachment: { historyID: 'x', owner: 'plugin.vibe', attachmentType: 'plugin.vibe.fallback', attachmentKey: 'primary', payloadJson: VALID_PAYLOAD_JSON },
      item: {},
      content: { kind: 'text', text: 'hello world' },
    });
    assert.equal(result.shouldDisplay, false, 'should yield to more specific plugin');
  });

  it('yields (shouldDisplay=false) for bad payload', () => {
    const result = resolveAttachment({
      attachments: [{ attachmentType: 'plugin.vibe.fallback', attachmentKey: 'primary' }],
      attachment: { historyID: 'x', owner: 'plugin.vibe', attachmentType: 'plugin.vibe.fallback', attachmentKey: 'primary', payloadJson: 'bad-json' },
      item: {},
      content: { kind: 'text', text: '' },
    });
    assert.equal(result.shouldDisplay, false);
  });

  it('yields (shouldDisplay=false) for empty attachments list and bad payload', () => {
    const result = resolveAttachment({
      attachments: [],
      attachment: { historyID: 'x', owner: 'plugin.vibe', attachmentType: 'plugin.vibe.fallback', attachmentKey: 'primary', payloadJson: null },
      item: {},
      content: { kind: 'text', text: '' },
    });
    assert.equal(result.shouldDisplay, false);
  });
});
