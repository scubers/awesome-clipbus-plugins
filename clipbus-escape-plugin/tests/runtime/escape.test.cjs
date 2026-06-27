"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const manifest = JSON.parse(fs.readFileSync(path.resolve(root, "manifest.json"), "utf8"));

// ── Manifest contract ─────────────────────────────────────────────────────────

test("manifest declares escape-tool action with lifecycle=draft and uiEntry under actions/", () => {
  const action = (manifest.actions ?? []).find((a) => a.id === "escape-tool");
  assert.ok(action, "manifest.actions should contain an entry with id escape-tool");
  assert.equal(action.lifecycle, "draft", "escape-tool lifecycle must be 'draft'");
  assert.ok(
    typeof action.uiEntry === "string" && action.uiEntry.startsWith("actions/"),
    `escape-tool uiEntry should start with "actions/", got: ${action.uiEntry}`
  );
});

// ── Runtime handler contract ──────────────────────────────────────────────────

test("createEscapeAction returns handler with resolveSession and runAutoAction", () => {
  const { createEscapeAction } = require(path.resolve(root, "src/features/escape-tool/action.ts"));
  const handler = createEscapeAction();
  assert.equal(typeof handler.resolveSession, "function", "handler must have resolveSession");
  assert.equal(typeof handler.runAutoAction, "function", "handler must have runAutoAction");
});

test("resolveSession with text input sets initialDraft.input to that text", async () => {
  const { createEscapeAction } = require(path.resolve(root, "src/features/escape-tool/action.ts"));
  const handler = createEscapeAction();
  const result = await handler.resolveSession({ content: { kind: "text", text: "x y" } }, {});
  assert.equal(result.initialDraft?.input, "x y", "initialDraft.input should match the input text");
});

test("resolveSession returns non-empty buttons array", async () => {
  const { createEscapeAction } = require(path.resolve(root, "src/features/escape-tool/action.ts"));
  const handler = createEscapeAction();
  const result = await handler.resolveSession({}, {});
  assert.ok(Array.isArray(result.buttons) && result.buttons.length > 0, "buttons must be a non-empty array");
});

test("runAutoAction resolves with resultKind=none", async () => {
  const { createEscapeAction } = require(path.resolve(root, "src/features/escape-tool/action.ts"));
  const handler = createEscapeAction();
  const result = await handler.runAutoAction({});
  assert.equal(result.result.resultKind, "none", "runAutoAction result.resultKind should be 'none'");
});

// ── URL encode / decode ───────────────────────────────────────────────────────

test("urlEncode encodes spaces and special chars", () => {
  const { urlEncode } = require(path.resolve(root, "src/features/escape-tool/payload.ts"));
  const encoded = urlEncode("a b&c");
  assert.equal(encoded, "a%20b%26c");
});

test("urlDecode is inverse of urlEncode", () => {
  const { urlEncode, urlDecode } = require(path.resolve(root, "src/features/escape-tool/payload.ts"));
  const original = "a b&c=1+2";
  assert.equal(urlDecode(urlEncode(original)), original);
});

// ── HTML encode / decode ──────────────────────────────────────────────────────

test("htmlEncode encodes <, >, & and quotes", () => {
  const { htmlEncode } = require(path.resolve(root, "src/features/escape-tool/payload.ts"));
  const encoded = htmlEncode('<a>&"\'');
  assert.ok(encoded.includes("&lt;"), `expected &lt; in: ${encoded}`);
  assert.ok(encoded.includes("&gt;"), `expected &gt; in: ${encoded}`);
  assert.ok(encoded.includes("&amp;"), `expected &amp; in: ${encoded}`);
  assert.ok(encoded.includes("&quot;"), `expected &quot; in: ${encoded}`);
  assert.ok(encoded.includes("&#39;"), `expected &#39; in: ${encoded}`);
});

test("htmlDecode is inverse of htmlEncode", () => {
  const { htmlEncode, htmlDecode } = require(path.resolve(root, "src/features/escape-tool/payload.ts"));
  const original = '<script>alert("XSS & more")</script>';
  assert.equal(htmlDecode(htmlEncode(original)), original);
});

// ── Base64 encode / decode ────────────────────────────────────────────────────

test("base64Encode 'hi' produces 'aGk='", () => {
  const { base64Encode } = require(path.resolve(root, "src/features/escape-tool/payload.ts"));
  assert.equal(base64Encode("hi"), "aGk=");
});

test("base64Decode is inverse of base64Encode for ASCII", () => {
  const { base64Encode, base64Decode } = require(path.resolve(root, "src/features/escape-tool/payload.ts"));
  const original = "hello world";
  assert.equal(base64Decode(base64Encode(original)), original);
});

test("base64 round-trip preserves Chinese characters (UTF-8 safety)", () => {
  const { base64Encode, base64Decode } = require(path.resolve(root, "src/features/escape-tool/payload.ts"));
  const original = "你好"; // 你好
  assert.equal(base64Decode(base64Encode(original)), original);
});

// ── Unicode encode / decode ───────────────────────────────────────────────────

test("unicodeEncode 'A' produces '\\u0041'", () => {
  const { unicodeEncode } = require(path.resolve(root, "src/features/escape-tool/payload.ts"));
  assert.equal(unicodeEncode("A"), "\\u0041");
});

test("unicodeDecode is inverse of unicodeEncode for BMP characters", () => {
  const { unicodeEncode, unicodeDecode } = require(path.resolve(root, "src/features/escape-tool/payload.ts"));
  const original = "Hello";
  assert.equal(unicodeDecode(unicodeEncode(original)), original);
});

// ── JSON escape / unescape ────────────────────────────────────────────────────

test("jsonEncode round-trip with string containing quotes", () => {
  const { jsonEncode, jsonDecode } = require(path.resolve(root, "src/features/escape-tool/payload.ts"));
  const original = 'say "hello" and \\backslash';
  assert.equal(jsonDecode(jsonEncode(original)), original);
});
