'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { fakeHost, itemSnapshot, setupPlugin, textContent, imageContent } = require('../support/plugin.cjs');

const cases = [
  ['html-encode', '<b>&</b>', '&lt;b&gt;&amp;&lt;/b&gt;'],
  ['html-decode', '&lt;b&gt;&#x1F44B;&lt;/b&gt;', '<b>👋</b>'],
  ['unicode-escape', 'A你👋', '\\u0041\\u4F60\\uD83D\\uDC4B'],
  ['unicode-unescape', '\\u0041\\u4F60\\uD83D\\uDC4B', 'A你👋'],
  ['uppercase', 'Hello world', 'HELLO WORLD'], ['lowercase', 'Hello WORLD', 'hello world'],
  ['camelCase', 'Hello world', 'helloWorld'], ['pascalCase', 'Hello world', 'HelloWorld'],
  ['snakeCase', 'Hello world', 'hello_world'], ['kebabCase', 'Hello world', 'hello-world'],
  ['constantCase', 'Hello world', 'HELLO_WORLD'], ['titleCase', 'hello world', 'Hello World'],
  ['sentenceCase', 'hello WORLD', 'Hello world'], ['dotCase', 'Hello world', 'hello.world'],
  ['text-sort', 'b\na', 'a\nb'], ['text-dedup', 'a\na\nb', 'a\nb'],
  ['text-trim', '  x  \n\n\ny ', 'x\n\ny'], ['text-strip-ansi', '\x1b[31mred\x1b[0m', 'red'],
  ['text-reverse-lines', 'a\nb', 'b\na'], ['text-reverse-characters', 'A👍🏽é', 'é👍🏽A'],
  ['text-sort-characters', 'cba', 'abc'],
  ['text-pretty-json', '{"a":1}', '{\n  "a": 1\n}'],
  ['text-minify-json', '{ "a": 1 }', '{"a":1}'],
  ['json-to-yaml', '{"name":"api","ports":[80,443],"enabled":true}', 'name: api\nports:\n  - 80\n  - 443\nenabled: true'],
];

test('every delivered action transforms current cascade content and rejects images', async t => {
  const { registry, launch } = await setupPlugin(t);
  assert.deepEqual(cases.map(c => c[0]).sort(), Object.keys(registry.actions).sort());
  for (const [id, input, expected] of cases) {
    const host = fakeHost(launch, { 'item.getContent': textContent('original item must not replace the cascade') });
    const output = await registry.actions[id]({ item: itemSnapshot('image'), content: textContent(input) }, host.ctx);
    assert.equal(output.result.kind, 'text', id);
    assert.equal(output.result.text, expected, id);
    assert.deepEqual(host.calls, [], id);
    const invalid = await registry.actions[id]({ item: itemSnapshot('text'), content: imageContent }, host.ctx);
    assert.equal(invalid.result.kind, 'none', id);
  }
});

test('JSON to YAML rejects invalid/empty input and returns a complete result', async t => {
  const { registry, launch } = await setupPlugin(t);
  const host = fakeHost(launch);
  for (const text of ['', '   ', '{bad json}']) {
    const output = await registry.actions['json-to-yaml']({ item: itemSnapshot('text'), content: textContent(text) }, host.ctx);
    assert.equal(output.result.kind, 'none');
  }
  const value = 'x'.repeat(25000);
  const output = await registry.actions['json-to-yaml']({ item: itemSnapshot('text'), content: textContent(JSON.stringify({ value })) }, host.ctx);
  assert.equal(output.result.text, `value: ${value}`);
});
