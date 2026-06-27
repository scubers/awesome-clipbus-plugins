"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const manifest = JSON.parse(fs.readFileSync(path.resolve(root, "manifest.json"), "utf8"));

// ── Manifest contract ────────────────────────────────────────────────────────

test("manifest declares case-tool action with lifecycle=draft and uiEntry under actions/", () => {
  const action = (manifest.actions ?? []).find((a) => a.id === "case-tool");
  assert.ok(action, "manifest.actions should contain an entry with id case-tool");
  assert.equal(action.lifecycle, "draft", "case-tool lifecycle must be 'draft'");
  assert.ok(
    typeof action.uiEntry === "string" && action.uiEntry.startsWith("actions/"),
    `case-tool uiEntry should start with "actions/", got: ${action.uiEntry}`
  );
});

// ── Runtime handler contract ─────────────────────────────────────────────────

test("createCaseAction returns handler with resolveSession and runAutoAction", () => {
  const { createCaseAction } = require(path.resolve(root, "src/features/case-tool/action.ts"));
  const handler = createCaseAction();
  assert.equal(typeof handler.resolveSession, "function", "handler must have resolveSession");
  assert.equal(typeof handler.runAutoAction, "function", "handler must have runAutoAction");
});

test("resolveSession with text input prefills initialDraft.input and returns non-empty buttons", async () => {
  const { createCaseAction } = require(path.resolve(root, "src/features/case-tool/action.ts"));
  const handler = createCaseAction();
  const result = await handler.resolveSession({ content: { kind: "text", text: "abc" } }, {});
  assert.equal(result.initialDraft?.input, "abc", "initialDraft.input should equal the clipboard text");
  assert.ok(Array.isArray(result.buttons) && result.buttons.length > 0, "buttons must be a non-empty array");
});

test("runAutoAction resolves with resultKind=none", async () => {
  const { createCaseAction } = require(path.resolve(root, "src/features/case-tool/action.ts"));
  const handler = createCaseAction();
  const result = await handler.runAutoAction({});
  assert.equal(result.result.resultKind, "none", "runAutoAction result.resultKind should be 'none'");
});

// ── Pure payload logic ───────────────────────────────────────────────────────

test("splitWords splits mixed camelCase, underscore, hyphen into 4 words", () => {
  const { splitWords } = require(path.resolve(root, "src/features/case-tool/payload.ts"));
  const words = splitWords("helloWorld foo_bar-baz");
  assert.deepEqual(words, ["hello", "world", "foo", "bar", "baz"]);
});

test("toCamel converts mixed input to camelCase", () => {
  const { toCamel } = require(path.resolve(root, "src/features/case-tool/payload.ts"));
  assert.equal(toCamel("helloWorld foo_bar-baz"), "helloWorldFooBarBaz");
});

test("toSnake converts mixed input to snake_case", () => {
  const { toSnake } = require(path.resolve(root, "src/features/case-tool/payload.ts"));
  assert.equal(toSnake("helloWorld foo_bar-baz"), "hello_world_foo_bar_baz");
});

test("toKebab converts mixed input to kebab-case", () => {
  const { toKebab } = require(path.resolve(root, "src/features/case-tool/payload.ts"));
  assert.equal(toKebab("helloWorld foo_bar-baz"), "hello-world-foo-bar-baz");
});

test("toConstant converts mixed input to CONSTANT_CASE", () => {
  const { toConstant } = require(path.resolve(root, "src/features/case-tool/payload.ts"));
  assert.equal(toConstant("helloWorld foo_bar-baz"), "HELLO_WORLD_FOO_BAR_BAZ");
});

test("toPascal converts mixed input to PascalCase", () => {
  const { toPascal } = require(path.resolve(root, "src/features/case-tool/payload.ts"));
  assert.equal(toPascal("helloWorld foo_bar-baz"), "HelloWorldFooBarBaz");
});

test("toTitle converts mixed input to Title Case", () => {
  const { toTitle } = require(path.resolve(root, "src/features/case-tool/payload.ts"));
  assert.equal(toTitle("helloWorld foo_bar-baz"), "Hello World Foo Bar Baz");
});

test("toSentence converts mixed input to Sentence case", () => {
  const { toSentence } = require(path.resolve(root, "src/features/case-tool/payload.ts"));
  assert.equal(toSentence("helloWorld foo_bar-baz"), "Hello world foo bar baz");
});

test("toDot converts mixed input to dot.case", () => {
  const { toDot } = require(path.resolve(root, "src/features/case-tool/payload.ts"));
  assert.equal(toDot("helloWorld foo_bar-baz"), "hello.world.foo.bar.baz");
});

test("buildAllCases returns 8 variants with non-empty labels", () => {
  const { buildAllCases } = require(path.resolve(root, "src/features/case-tool/payload.ts"));
  const variants = buildAllCases("helloWorld");
  assert.equal(variants.length, 8, "buildAllCases should return 8 variants");
  for (const v of variants) {
    assert.ok(typeof v.label === "string" && v.label.length > 0, `variant label should be non-empty string`);
    assert.ok(typeof v.value === "string", `variant value should be a string`);
  }
});
