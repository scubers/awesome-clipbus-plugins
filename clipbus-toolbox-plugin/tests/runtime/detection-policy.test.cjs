'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { fakeHost, itemSnapshot, setupPlugin, textContent } = require('../support/plugin.cjs');

test('ambiguous or invalid text does not create specialist cards', async t => {
  const { registry, launch } = await setupPlugin(t);
  for (const [id, text] of [
    ['url-detector', 'https://example.com/'],
    ['url-detector', 'https://example.com/path\nplease read this'],
    ['url-detector', 'https://example.com/?a=1 extra prose'],
    ['csv-detector', 'Hello, world\nThanks, Alice'],
    ['csv-detector', 'a,b\n1,2\n3'],
    ['csv-detector', 'a,b\n"unterminated,2'],
    ['csv-detector', 'a,b\n"one"junk,2'],
    ['xml-detector', '<a></b>'],
    ['xml-detector', '<root><unclosed></root>'],
    ['xml-detector', '<root bad=unquoted></root>'],
    ['markdown-detector', JSON.stringify({ message: '**ready**', code: '`tmp`' })],
    ['markdown-detector', '<root>**bold** and `code`</root>'],
    ['markdown-detector', 'name,note\nAlice,**bold** and `code`'],
    ['markdown-detector', '* * * * *'],
    ['gradient-detector', 'linear-gradient(banana)'],
    ['gradient-detector', 'linear-gradient(red)'],
    ['gradient-detector', 'linear-gradient(red, banana)'],
    ['gradient-detector', 'linear-gradient(rgb(banana), blue)'],
    ['geo-detector', '10.5, 20.5'],
  ]) {
    for (const trigger of ['copy', 'recopy', 'edit', 'manual']) {
      const host = fakeHost(launch);
      await registry.detectors[id]({ item: itemSnapshot('text'), content: textContent(text), trigger }, host.ctx);
      const attachments = host.paramsOf('item.replaceAttachments');
      if (id === 'geo-detector' && trigger === 'recopy') {
        assert.deepEqual(attachments, [{ type: 'plugin.awesome.toolbox.geo', entries: [] }], `${id}: ${text}`);
      } else {
        assert.deepEqual(attachments, [], `${id}: ${text}`);
      }
      assert.deepEqual(host.paramsOf('item.replaceSearchExtension'), [], `${id}: ${text}`);
    }
  }
});

test('strong Markdown blocks and explicit coordinates keep their previews', async t => {
  const { registry, launch } = await setupPlugin(t);
  for (const [id, text] of [
    ['markdown-detector', '- alpha\n- beta'],
    ['markdown-detector', '```json\n{"value":1}\n```'],
    ['geo-detector', '37.7749° N, 122.4194° W'],
  ]) {
    const host = fakeHost(launch);
    await registry.detectors[id]({ item: itemSnapshot('text'), content: textContent(text), trigger: 'copy' }, host.ctx);
    assert.equal(host.paramsOf('item.replaceAttachments').length, 1, text);
    assert.deepEqual(host.paramsOf('item.replaceSearchExtension'), []);
  }
});

test('CSV preserves multiline quoted cells, escaped quotes and trailing empty values', async t => {
  const { registry, launch } = await setupPlugin(t);
  const host = fakeHost(launch);
  const text = 'name,note,empty\r\nAlice,"line one\nline ""two""",\r\nBob,plain,';
  await registry.detectors['csv-detector']({ item: itemSnapshot('text'), content: textContent(text), trigger: 'copy' }, host.ctx);
  const payload = host.paramsOf('item.replaceAttachments')[0].entries[0].payload;
  assert.deepEqual(payload.rows, [['Alice', 'line one\nline "two"', ''], ['Bob', 'plain', '']]);
});

test('long Base64 and XML attachments retain the complete copy result', async t => {
  const { registry, launch } = await setupPlugin(t);
  const decoded = '你好👋 '.repeat(3000);
  const base64Host = fakeHost(launch);
  await registry.detectors['base64-detector']({ item: itemSnapshot('text'), content: textContent(Buffer.from(decoded).toString('base64')), trigger: 'copy' }, base64Host.ctx);
  const [base64Write] = base64Host.paramsOf('item.replaceAttachments');
  assert.equal(base64Write.entries[0].payload.decoded, decoded);
  assert.equal(base64Write.entries[0].card, undefined);
  const text = 'long text '.repeat(4000);
  const xmlHost = fakeHost(launch);
  await registry.detectors['xml-detector']({ item: itemSnapshot('text'), content: textContent(`<root><value>${text}</value></root>`), trigger: 'copy' }, xmlHost.ctx);
  const output = xmlHost.paramsOf('item.replaceAttachments')[0].entries[0].payload.formatted;
  assert.ok(output.includes(text.trim()));
  assert.ok(output.endsWith('</root>'));
  assert.ok(!output.includes('(input too large, truncated)'));
});

test('decoded search is explicit, byte-bounded and revocable on recopy', async t => {
  const { registry, launch } = await setupPlugin(t);
  const claims = { sub: '123', note: '😀'.repeat(2000) };
  const jwt = `${Buffer.from('{"alg":"HS256"}').toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.sig`;
  for (const [id, setting, scope, text] of [
    ['base64-detector', 'indexBase64', 'base64', Buffer.from('😀'.repeat(2000)).toString('base64')],
    ['jwt-detector', 'indexJwt', 'jwt', jwt],
  ]) {
    for (const enabled of [false, true, 'true', undefined]) {
      const host = fakeHost(launch, { 'settings.get': { values: { [setting]: enabled } } });
      await registry.detectors[id]({ item: itemSnapshot('text'), content: textContent(text), trigger: 'recopy' }, host.ctx);
      const searches = host.paramsOf('item.replaceSearchExtension');
      assert.equal(searches.length, 1);
      assert.equal(searches[0].scope, scope);
      if (enabled === true) {
        assert.ok(Buffer.byteLength(searches[0].entries[0].text) <= 4096);
        assert.ok(!searches[0].entries[0].text.includes('\uFFFD'));
      } else {
        assert.deepEqual(searches[0].entries, []);
      }
      assert.equal(host.paramsOf('item.replaceAttachments').length, 1);
    }
  }
});
