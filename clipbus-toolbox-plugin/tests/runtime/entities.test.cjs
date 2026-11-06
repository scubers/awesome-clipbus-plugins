'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createEntitiesPayload } = require('../../src/features/entities-renderer/payload.ts');
const detect = text => createEntitiesPayload({ content: { kind: 'text', text } });

test('batch extraction deduplicates emails and valid IPv4 addresses', () => {
  const payload = detect('a@example.com a@example.com 192.168.1.1 192.168.1.1 b@example.com 999.999.999.999');
  assert.deepEqual(payload.emails, ['a@example.com', 'b@example.com']);
  assert.deepEqual(payload.ips, ['192.168.1.1']);
  assert.equal(payload.totalCount, 3);
});

test('URLs and their embedded addresses are left to builtin URL detection', () => {
  assert.equal(detect('https://192.168.1.1/ https://example.com/?email=a@example.com'), null);
  const payload = detect('https://192.168.1.1/?email=hidden@example.com visible@example.com 10.0.0.1');
  assert.deepEqual(payload.emails, ['visible@example.com']);
  assert.deepEqual(payload.ips, ['10.0.0.1']);
});

test('fewer than two unique entities do not create a batch card', () => {
  for (const text of ['192.168.1.1', 'Server: 192.168.1.1', 'a@example.com', 'a@example.com a@example.com', 'ordinary prose']) {
    assert.equal(detect(text), null, text);
  }
});
