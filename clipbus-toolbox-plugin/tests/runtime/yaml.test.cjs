'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
test('jsonToYaml: nested object with array value', () => {
  const { jsonToYaml } = require(path.resolve(root, 'src/features/json-tool/yaml.ts'));
  const result = jsonToYaml({ name: 'api', ports: [80, 443], enabled: true });
  assert.equal(result, 'name: api\nports:\n  - 80\n  - 443\nenabled: true');
});

test('jsonToYaml: string containing ": " is double-quoted', () => {
  const { jsonToYaml } = require(path.resolve(root, 'src/features/json-tool/yaml.ts'));
  assert.equal(jsonToYaml({ key: 'value: with colon' }), 'key: "value: with colon"');
});

test('jsonToYaml: string "true" is double-quoted (would parse as bool)', () => {
  const { jsonToYaml } = require(path.resolve(root, 'src/features/json-tool/yaml.ts'));
  assert.equal(jsonToYaml({ flag: 'true' }), 'flag: "true"');
});

test('jsonToYaml: string "123" is double-quoted (would parse as number)', () => {
  const { jsonToYaml } = require(path.resolve(root, 'src/features/json-tool/yaml.ts'));
  assert.equal(jsonToYaml({ count: '123' }), 'count: "123"');
});

test('jsonToYaml: empty string is double-quoted', () => {
  const { jsonToYaml } = require(path.resolve(root, 'src/features/json-tool/yaml.ts'));
  assert.equal(jsonToYaml({ val: '' }), 'val: ""');
});

test('jsonToYaml: multiline string is double-quoted with \\n escape', () => {
  const { jsonToYaml } = require(path.resolve(root, 'src/features/json-tool/yaml.ts'));
  assert.equal(jsonToYaml({ msg: 'line1\nline2' }), 'msg: "line1\\nline2"');
});

test('jsonToYaml: null, boolean, and number scalars', () => {
  const { jsonToYaml } = require(path.resolve(root, 'src/features/json-tool/yaml.ts'));
  assert.equal(jsonToYaml({ n: null, b: true, i: 42 }), 'n: null\nb: true\ni: 42');
});

test('jsonToYaml: empty object and empty array values', () => {
  const { jsonToYaml } = require(path.resolve(root, 'src/features/json-tool/yaml.ts'));
  assert.equal(jsonToYaml({ obj: {}, arr: [] }), 'obj: {}\narr: []');
});
