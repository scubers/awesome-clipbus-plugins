'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { PLUGIN_INPUT_LIMITS, PLUGIN_WRITE_LIMITS } = require('@clipbus/plugin-sdk');
const { fakeHost, itemSnapshot, manifest, setupPlugin, textContent, imageContent } = require('../support/plugin.cjs');
const { createCronPayload } = require('../../src/features/cron-renderer/payload.ts');

test('long valid input preserves the complete payload without a search index', async t => {
  const { registry, launch } = await setupPlugin(t);
  const text = `${'0'.repeat(2000)} * * * *`;
  const host = fakeHost(launch);
  await registry.detectors['cron-detector']({ item: itemSnapshot('text'), content: textContent(text), trigger: 'copy' }, host.ctx);
  assert.equal(host.paramsOf('item.replaceAttachments')[0].entries[0].payload.expression, text);
  assert.deepEqual(host.paramsOf('item.replaceSearchExtension'), []);
});

test('oversized payload is rejected before any writes', async t => {
  const { registry, launch } = await setupPlugin(t);
  const text = `${'0'.repeat(750000)} * * * *`;
  const payload = createCronPayload({ content: textContent(text) });
  assert.ok(Buffer.byteLength(JSON.stringify(payload)) > PLUGIN_WRITE_LIMITS.maximumPayloadBytes);
  const host = fakeHost(launch);
  await registry.detectors['cron-detector']({ item: itemSnapshot('text'), content: textContent(text), trigger: 'copy' }, host.ctx);
  assert.deepEqual(host.calls, []);
});
