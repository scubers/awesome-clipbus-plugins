'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { PLUGIN_INPUT_LIMITS, PLUGIN_WRITE_LIMITS } = require('@clipbus/plugin-sdk');
const { fakeHost, itemSnapshot, manifest, setupPlugin, textContent, imageContent } = require('../support/plugin.cjs');

test('large Unicode CSV headers stay in the attachment without an extra search index', async t => {
  const { registry, launch } = await setupPlugin(t);
  const host = fakeHost(launch);
  const header = '😀'.repeat(1500);
  await registry.detectors['csv-detector']({ item: itemSnapshot('text'), content: textContent(`${header},note\nAlice,hello`), trigger: 'copy' }, host.ctx);
  assert.deepEqual(host.paramsOf('item.replaceSearchExtension'), []);
  const [attachment] = host.paramsOf('item.replaceAttachments');
  assert.equal(attachment.entries[0].payload.headers[0], header);
});

test('oversized CSV and expanded XML payloads produce no over-budget writes', async t => {
  const { registry, launch } = await setupPlugin(t);
  const inputs = {
    'csv-detector': `name,note\nAlice,${'x'.repeat(PLUGIN_WRITE_LIMITS.maximumPayloadBytes)}`,
    'xml-detector': '<a>'.repeat(1600) + '</a>'.repeat(1600),
  };
  for (const [id, text] of Object.entries(inputs)) {
    const host = fakeHost(launch);
    await registry.detectors[id]({ item: itemSnapshot('text'), content: textContent(text), trigger: 'copy' }, host.ctx);
    assert.deepEqual(host.calls, [], id);
  }
});
