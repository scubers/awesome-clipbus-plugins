"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const manifest = JSON.parse(fs.readFileSync(path.resolve(root, "manifest.json"), "utf8"));

// ── Manifest contract ────────────────────────────────────────────────────────

test("manifest declares regex-tool action with lifecycle=draft and uiEntry under actions/", () => {
  const action = (manifest.actions ?? []).find((a) => a.id === "regex-tool");
  assert.ok(action, "manifest.actions should contain an entry with id regex-tool");
  assert.equal(action.lifecycle, "draft", "regex-tool lifecycle must be 'draft'");
  assert.ok(
    typeof action.uiEntry === "string" && action.uiEntry.startsWith("actions/"),
    `regex-tool uiEntry should start with "actions/", got: ${action.uiEntry}`
  );
});

// ── Pure payload: runRegex ───────────────────────────────────────────────────

test("runRegex global flag: matchCount=3, matches=['1','22','333']", () => {
  const { runRegex } = require(path.resolve(root, "src/features/regex-tool/payload.ts"));
  const r = runRegex("\\d+", "g", "a1b22c333");
  assert.equal(r.ok, true);
  assert.equal(r.matchCount, 3);
  assert.deepEqual(
    r.matches.map((m) => m.match),
    ["1", "22", "333"]
  );
});

test("runRegex capture groups: each match has groups=['a','b']", () => {
  const { runRegex } = require(path.resolve(root, "src/features/regex-tool/payload.ts"));
  const r = runRegex("(a)(b)", "g", "abab");
  assert.equal(r.ok, true);
  assert.equal(r.matchCount, 2);
  for (const m of r.matches) {
    assert.deepEqual(m.groups, ["a", "b"], "each match should have capture groups ['a','b']");
  }
});

test("runRegex non-global: matchCount=1, only first match returned", () => {
  const { runRegex } = require(path.resolve(root, "src/features/regex-tool/payload.ts"));
  const r = runRegex("\\w", "", "abc");
  assert.equal(r.ok, true);
  assert.equal(r.matchCount, 1);
  assert.equal(r.matches[0].match, "a");
});

test("runRegex invalid pattern: ok=false with error message", () => {
  const { runRegex } = require(path.resolve(root, "src/features/regex-tool/payload.ts"));
  const r = runRegex("(", "", "x");
  assert.equal(r.ok, false);
  assert.ok(typeof r.error === "string" && r.error.length > 0, "error should be a non-empty string");
  assert.equal(r.matchCount, 0);
});

test("runRegex empty pattern: returns ok=true with matchCount=0, no throw", () => {
  const { runRegex } = require(path.resolve(root, "src/features/regex-tool/payload.ts"));
  const r = runRegex("", "g", "hello world");
  assert.equal(r.ok, true);
  assert.equal(r.matchCount, 0);
  assert.deepEqual(r.matches, []);
});

test("runRegex index is correct for each match", () => {
  const { runRegex } = require(path.resolve(root, "src/features/regex-tool/payload.ts"));
  const r = runRegex("x", "g", "axbxcx");
  assert.equal(r.matchCount, 3);
  assert.deepEqual(
    r.matches.map((m) => m.index),
    [1, 3, 5]
  );
});

// ── Runtime action contract ──────────────────────────────────────────────────

test("resolveSession pre-fills text from input.content.text", async () => {
  const { createRegexAction } = require(path.resolve(root, "src/features/regex-tool/action.ts"));
  const handler = createRegexAction();
  const result = await handler.resolveSession({ content: { kind: "text", text: "hello" } }, {});
  assert.equal(result.initialDraft?.text, "hello", "initialDraft.text should be pre-filled from clipboard");
  assert.ok(Array.isArray(result.buttons) && result.buttons.length > 0, "buttons must be a non-empty array");
});

test("runAutoAction resolves with resultKind=none", async () => {
  const { createRegexAction } = require(path.resolve(root, "src/features/regex-tool/action.ts"));
  const handler = createRegexAction();
  const result = await handler.runAutoAction({});
  assert.equal(result.result.resultKind, "none", "runAutoAction result.resultKind should be 'none'");
});
