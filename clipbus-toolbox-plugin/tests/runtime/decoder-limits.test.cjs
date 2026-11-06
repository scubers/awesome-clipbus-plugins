'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { PLUGIN_INPUT_LIMITS, PLUGIN_WRITE_LIMITS } = require('@clipbus/plugin-sdk');
const { fakeHost, itemSnapshot, manifest, setupPlugin, textContent, imageContent } = require('../support/plugin.cjs');

test('JWT detector avoids oversized attachments after pretty-print expansion', async t => {
  let nested = { value: 'x' };
  for (let i = 0; i < 32; i++) nested = { child: nested };
  const claims = { data: Array(1000).fill(nested) };
  const token = `${Buffer.from('{"alg":"HS256"}').toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.sig`;
  assert.ok(Buffer.byteLength(token) < PLUGIN_INPUT_LIMITS.maximumTextBytes);
  const { createJwtPayload } = require('../../src/features/jwt-renderer/payload.ts');
  assert.ok(Buffer.byteLength(JSON.stringify(createJwtPayload({ content: textContent(token) }))) > PLUGIN_WRITE_LIMITS.maximumPayloadBytes);
  const { registry, launch } = await setupPlugin(t);
  const host = fakeHost(launch);
  await registry.detectors['jwt-detector']({ item: itemSnapshot('text'), content: textContent(token), trigger: 'copy' }, host.ctx);
  assert.deepEqual(host.calls, []);
});
