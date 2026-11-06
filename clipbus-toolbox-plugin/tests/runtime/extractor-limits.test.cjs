'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { PLUGIN_INPUT_LIMITS, PLUGIN_WRITE_LIMITS } = require('@clipbus/plugin-sdk');
const { fakeHost, itemSnapshot, manifest, setupPlugin, textContent, imageContent } = require('../support/plugin.cjs');

test('URL cards preserve query titles and tracker-dependent copy buttons before page load', async t => {
  const { registry, launch } = await setupPlugin(t);
  for (const [text, title, ids] of [
    ['tag=one&tag=two', 'Query String', ['copy']],
    ['https://example.com/?id=42', 'URL Details', ['copy']],
    ['https://example.com/?utm_source=email&id=42', 'URL Details', ['copy-clean', 'copy']],
  ]) {
    const host = fakeHost(launch);
    await registry.detectors['url-detector']({ item: itemSnapshot('text'), content: textContent(text), trigger: 'copy' }, host.ctx);
    const [attachment] = host.paramsOf('item.setAttachments');
    const { payload, card } = attachment.entries[0];
    assert.equal(card.title, title);
    assert.deepEqual(card.buttons.map(button => button.id), ids);
    if (ids.includes('copy-clean')) assert.equal(payload.cleanHref, 'https://example.com/?id=42');
  }
});

test('long multibyte query values remain complete without creating a search index', async t => {
  const { registry, launch } = await setupPlugin(t);
  const value = '你'.repeat(4000);
  const host = fakeHost(launch);
  await registry.detectors['url-detector']({ item: itemSnapshot('text'), content: textContent(`q=${encodeURIComponent(value)}&b=2`), trigger: 'copy' }, host.ctx);
  const [attachment] = host.paramsOf('item.setAttachments');
  assert.equal(attachment.entries[0].payload.query[0].value, value);
  assert.deepEqual(host.paramsOf('item.setSearchExtension'), []);
});

test('URL results exceeding the payload byte limit produce no partial writes', async t => {
  const { registry, launch } = await setupPlugin(t);
  const host = fakeHost(launch);
  await registry.detectors['url-detector']({ item: itemSnapshot('text'), content: textContent(`https://example.com/?q=${'x'.repeat(600000)}`), trigger: 'copy' }, host.ctx);
  assert.deepEqual(host.calls, []);
});
