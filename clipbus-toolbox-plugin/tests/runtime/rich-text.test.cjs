'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { fakeHost, imageContent, itemSnapshot, setupPlugin, textContent } = require('../support/plugin.cjs');
const { htmlFragment } = require('../../src/features/rich-text/html.ts');
const { createRichTextPayload, decodeFormattedTextPayload } = require('../../src/features/markdown-renderer/payload.ts');

test('rich text attachments persist only a small format marker', () => {
  const html = '<h1>Large clipboard HTML</h1>'.repeat(1000);
  const payload = createRichTextPayload({ html: { document: html }, rtfBase64: 'e30=' });
  assert.deepEqual(payload, { kind: 'rich_text_preview', version: 1, format: 'html' });
  assert.equal(JSON.stringify(payload).includes(html), false);
  assert.deepEqual(decodeFormattedTextPayload(payload), payload);
  assert.equal(decodeFormattedTextPayload({ ...payload, format: 'other' }), null);
});

test('detector creates HTML and RTF cards without copying source content', async t => {
  const { registry, launch } = await setupPlugin(t);
  for (const [richText, format] of [
    [{ html: { document: '<p><strong>Bold</strong></p>' } }, 'html'],
    [{ rtfBase64: 'e30=' }, 'rtf'],
  ]) {
    const host = fakeHost(launch, { 'item.getRichText': { richText } });
    await registry.detectors['rich-text-detector']({ item: itemSnapshot('text'), content: textContent('Bold'), trigger: 'copy' }, host.ctx);
    const [write] = host.paramsOf('item.replaceAttachments');
    assert.equal(write.type, 'plugin.awesome.toolbox.markdown');
    assert.deepEqual(write.entries, [{ key: 'primary', payload: { kind: 'rich_text_preview', version: 1, format } }]);
  }
});

test('plain text recopy explicitly clears an old rich text card', async t => {
  const { registry, launch } = await setupPlugin(t);
  const host = fakeHost(launch, { 'item.getRichText': { richText: null } });
  await registry.detectors['rich-text-detector']({ item: itemSnapshot('text'), content: textContent('Plain'), trigger: 'recopy' }, host.ctx);
  assert.deepEqual(host.paramsOf('item.replaceAttachments'), [{ type: 'plugin.awesome.toolbox.markdown', entries: [] }]);
  assert.deepEqual(host.paramsOf('item.replaceSearchExtension'), []);
});

test('detector does not request rich text for image items', async t => {
  const { registry, launch } = await setupPlugin(t);
  const host = fakeHost(launch);
  await registry.detectors['rich-text-detector']({ item: itemSnapshot('image'), content: imageContent, trigger: 'copy' }, host.ctx);
  assert.deepEqual(host.calls, []);
});

test('HTML selection offsets count UTF-8 bytes, not JavaScript characters', () => {
  const before = '<p>你好</p><p>';
  const selected = '<strong>🙂</strong>';
  const startUtf8 = Buffer.byteLength(before);
  const fragment = htmlFragment({ document: `${before}${selected}</p>`, fragment: { startUtf8, endUtf8: startUtf8 + Buffer.byteLength(selected) } });
  assert.equal(fragment, selected);
  assert.equal(htmlFragment({ document: '<p>Whole document</p>' }), '<p>Whole document</p>');
});
