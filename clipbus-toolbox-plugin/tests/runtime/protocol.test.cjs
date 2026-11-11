'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { PLUGIN_WRITE_LIMITS } = require('@clipbus/plugin-sdk');
const { fakeHost, itemSnapshot, manifest, setupPlugin, textContent, imageContent } = require('../support/plugin.cjs');

const jwt = `${Buffer.from('{"alg":"HS256"}').toString('base64url')}.${Buffer.from('{"sub":"123","name":"John Doe"}').toString('base64url')}.sig`;
const samples = [
  ['base64-detector', 'SGVsbG8sIFdvcmxkIQ==', 'base64', 'base64_preview'],
  ['jwt-detector', jwt, 'jwt', 'jwt_preview'],
  ['xml-detector', '<root attr="x"><child/></root>', 'xml', 'xml_preview'],
  ['csv-detector', 'name,note\nAlice,"handles, UX & motion"', 'csv', 'csv_table'],
  ['timestamp-detector', '1700000000', 'timestamp', 'timestamp_preview'],
  ['radix-detector', '0xff', 'radix', 'radix_preview'],
  ['duration-detector', 'P1D', 'duration', 'duration_preview'],
  ['entities-detector', 'john@example.com 192.168.1.1', 'entities', 'entities_preview'],
  ['url-detector', 'https://example.com/?utm_source=email&id=42', 'url', 'url_parsed'],
  ['url-detector', 'tag=one&tag=two&lang=zh-CN', 'url', 'url_parsed'],
  ['ip-detector', '192.168.1.10', 'ip', 'ip_details'],
  ['geo-detector', '37.7749° N, 122.4194° W', 'geo', 'geo_coordinates'],
  ['mac-detector', '00:1A:2B:3C:4D:5E', 'mac', 'mac_address'],
  ['uuid-detector', '550e8400-e29b-41d4-a716-446655440000', 'uuid', 'uuid_details'],
  ['markdown-detector', '# Heading\n\n**Bold** with `inline code`', 'markdown', 'markdown_preview'],
  ['gradient-detector', 'linear-gradient(to right, red, blue)', 'gradient', 'gradient_swatch'],
  ['cron-detector', '30 9 * * 1-5', 'schedule', 'cron_preview'],
];

test('every delivered detector writes declared payloads and revokes disabled indexes on recopy', async t => {
  const { registry, launch } = await setupPlugin(t);
  assert.deepEqual(Object.keys(registry.detectors).sort(), manifest.detectors.map(d => d.id).sort());
  assert.deepEqual(Object.keys(registry.actions).sort(), manifest.actions.map(a => a.id).sort());
  for (const [id, text, suffix, kind] of samples) {
    const runs = [];
    for (const trigger of ['copy', 'recopy', 'edit', 'manual']) {
      const host = fakeHost(launch);
      const reference = { type: `plugin.awesome.toolbox.${suffix}`, key: 'primary', updatedAt: 1, own: true };
      await registry.detectors[id]({ item: itemSnapshot('text', { attachments: trigger === 'recopy' ? [reference] : [] }), content: textContent(text), trigger }, host.ctx);
      const [attachment] = host.paramsOf('item.replaceAttachments');
      assert.equal(attachment.type, reference.type, id);
      assert.ok(manifest.writes.attachmentTypes.includes(attachment.type));
      assert.equal(attachment.entries.length, 1);
      assert.equal(attachment.entries[0].payload.kind, kind, id);
      assert.ok(Buffer.byteLength(JSON.stringify(attachment.entries[0].payload)) <= PLUGIN_WRITE_LIMITS.maximumPayloadBytes);
      const searches = host.paramsOf('item.replaceSearchExtension');
      if (trigger === 'recopy' && ['base64-detector', 'jwt-detector'].includes(id)) {
        assert.deepEqual(searches, [{ scope: suffix, entries: [] }], id);
      } else {
        assert.deepEqual(searches, [], id);
      }
      runs.push(host.paramsOf('item.replaceAttachments'));
    }
    for (const run of runs.slice(1)) assert.deepEqual(run, runs[0], id);
  }
});

test('combined detection stays within per-plugin item budgets', async t => {
  const { registry, launch } = await setupPlugin(t);
  const texts = [...samples.map(s => s[1]), '# Servers\n**Active**\nadmin@example.com 192.168.1.1\nops@example.com 10.0.0.1\nhttps://example.com/'];
  for (const text of texts) {
    const host = fakeHost(launch);
    for (const detector of Object.values(registry.detectors)) {
      await detector({ item: itemSnapshot('text'), content: textContent(text), trigger: 'manual' }, host.ctx);
    }
    assert.ok(host.paramsOf('item.replaceAttachments').flatMap(p => p.entries).length <= PLUGIN_WRITE_LIMITS.maximumAttachmentsPerItem, text);
    assert.ok(host.paramsOf('item.replaceSearchExtension').flatMap(p => p.entries).length <= PLUGIN_WRITE_LIMITS.maximumSearchEntriesPerItem, text);
  }
});

test('all detectors ignore images and unrelated text', async t => {
  const { registry, launch } = await setupPlugin(t);
  for (const detector of Object.values(registry.detectors)) {
    for (const content of [textContent('ordinary unrelated prose'), imageContent]) {
      const host = fakeHost(launch);
      await detector({ item: itemSnapshot(content.kind), content, trigger: 'edit' }, host.ctx);
      assert.deepEqual(host.calls, []);
    }
  }
});

test('decimal radix is opt-in and timestamps always take priority', async t => {
  const { registry, launch } = await setupPlugin(t);
  for (const [text, enabled, expected] of [
    ['255', false, false], ['255', true, true], ['-255', true, true],
    ['1700000000', false, false], ['1700000000', true, false],
    ['1700000000000', true, false], ['0xff', false, true],
    ['0b1010', false, true], ['0o777', false, true],
  ]) {
    for (const trigger of ['copy', 'recopy']) {
      const host = fakeHost(launch, { 'settings.get': { values: { decimalRadix: enabled } } });
      await registry.detectors['radix-detector']({ item: itemSnapshot('text'), content: textContent(text), trigger }, host.ctx);
      const clearsDisabledDecimal = trigger === 'recopy' && !enabled && ['255', '-255'].includes(text);
      const attachments = host.paramsOf('item.replaceAttachments');
      assert.equal(attachments.length, expected || clearsDisabledDecimal ? 1 : 0, text);
      if (clearsDisabledDecimal) assert.deepEqual(attachments[0].entries, []);
      assert.deepEqual(host.paramsOf('item.replaceSearchExtension'), [], text);
    }
  }
});

test('IP details and batch extraction keep distinct input boundaries', async t => {
  const { registry, launch } = await setupPlugin(t);
  for (const [text, details, extraction] of [
    ['192.168.1.1', true, false], ['192.168.1.0/24', true, false],
    ['2001:db8::1', true, false],
    ['Servers: 192.168.1.1 and 10.0.0.1', false, true],
    ['Server: 192.168.1.1', false, false],
    ['https://192.168.1.1/ https://10.0.0.1/', false, false],
  ]) {
    for (const [id, expected] of [['ip-detector', details], ['entities-detector', extraction]]) {
      const host = fakeHost(launch);
      await registry.detectors[id]({ item: itemSnapshot('text'), content: textContent(text), trigger: 'copy' }, host.ctx);
      assert.equal(host.paramsOf('item.replaceAttachments').length, expected ? 1 : 0, `${id}: ${text}`);
    }
  }
});
