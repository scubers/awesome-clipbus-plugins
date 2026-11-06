'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { PLUGIN_INPUT_LIMITS, PLUGIN_WRITE_LIMITS } = require('@clipbus/plugin-sdk');
const { fakeHost, itemSnapshot, manifest, setupPlugin, textContent, imageContent } = require('../support/plugin.cjs');

test('large Markdown never writes a payload above the protocol limit', async t => {
  const { registry, launch } = await setupPlugin(t);
  const host = fakeHost(launch);
  const text = '# Heading\n**Bold**\n' + '<&'.repeat(400000);
  await registry.detectors['markdown-detector']({ item: itemSnapshot('text'), content: textContent(text), trigger: 'copy' }, host.ctx);
  assert.deepEqual(host.calls, []);
});
