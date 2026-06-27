"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const manifest = JSON.parse(fs.readFileSync(path.resolve(root, "manifest.json"), "utf8"));

// ── Manifest contract ────────────────────────────────────────────────────────

test("manifest declares lorem-tool action with lifecycle=draft and uiEntry under actions/", () => {
  const action = (manifest.actions ?? []).find((a) => a.id === "lorem-tool");
  assert.ok(action, "manifest.actions should contain an entry with id lorem-tool");
  assert.equal(action.lifecycle, "draft", "lorem-tool lifecycle must be 'draft'");
  assert.ok(
    typeof action.uiEntry === "string" && action.uiEntry.startsWith("actions/"),
    `lorem-tool uiEntry should start with "actions/", got: ${action.uiEntry}`
  );
});

// ── Runtime handler contract ─────────────────────────────────────────────────

test("createLoremAction returns handler with resolveSession and runAutoAction", () => {
  const { createLoremAction } = require(path.resolve(root, "src/features/lorem-tool/action.ts"));
  const handler = createLoremAction();
  assert.equal(typeof handler.resolveSession, "function", "handler must have resolveSession");
  assert.equal(typeof handler.runAutoAction, "function", "handler must have runAutoAction");
});

test("resolveSession resolves with initialDraft.unit===paragraphs and non-empty buttons", async () => {
  const { createLoremAction } = require(path.resolve(root, "src/features/lorem-tool/action.ts"));
  const handler = createLoremAction();
  const result = await handler.resolveSession({}, {});
  assert.equal(result.initialDraft?.unit, "paragraphs", "initialDraft.unit should be 'paragraphs'");
  assert.ok(Array.isArray(result.buttons) && result.buttons.length > 0, "buttons must be a non-empty array");
});

test("runAutoAction resolves with resultKind=none", async () => {
  const { createLoremAction } = require(path.resolve(root, "src/features/lorem-tool/action.ts"));
  const handler = createLoremAction();
  const result = await handler.runAutoAction({});
  assert.equal(result.result.resultKind, "none", "runAutoAction result.resultKind should be 'none'");
});

// ── Pure payload logic ───────────────────────────────────────────────────────

test("clampCount clamps 0 to 1 and 999 to 50", () => {
  const { clampCount } = require(path.resolve(root, "src/features/lorem-tool/payload.ts"));
  assert.equal(clampCount(0), 1, "clampCount(0) should return 1");
  assert.equal(clampCount(999), 50, "clampCount(999) should return 50");
  assert.equal(clampCount(25), 25, "clampCount(25) should return 25 (within range)");
});

test("generateLorem words mode count=5 yields 5 space-separated tokens ending with '.'", () => {
  const { generateLorem } = require(path.resolve(root, "src/features/lorem-tool/payload.ts"));
  const result = generateLorem("words", 5, false);
  const tokens = result.split(" ");
  assert.equal(tokens.length, 5, `words mode count=5 should yield 5 tokens, got ${tokens.length}: "${result}"`);
  assert.ok(result.endsWith("."), `words mode result should end with '.', got: "${result}"`);
});

test("generateLorem paragraphs mode count=2 yields exactly 2 blocks split by \\n\\n", () => {
  const { generateLorem } = require(path.resolve(root, "src/features/lorem-tool/payload.ts"));
  const result = generateLorem("paragraphs", 2, false);
  const blocks = result.split("\n\n");
  assert.equal(blocks.length, 2, `paragraphs count=2 should yield 2 blocks, got ${blocks.length}`);
});

test("generateLorem sentences mode count=3 yields 3 period-terminated segments", () => {
  const { generateLorem } = require(path.resolve(root, "src/features/lorem-tool/payload.ts"));
  const result = generateLorem("sentences", 3, false);
  const periods = (result.match(/\./g) ?? []).length;
  assert.equal(periods, 3, `sentences count=3 should produce exactly 3 periods, got ${periods}: "${result}"`);
});

test("generateLorem with startWithLorem=true begins with 'Lorem ipsum dolor sit amet' for all units", () => {
  const { generateLorem } = require(path.resolve(root, "src/features/lorem-tool/payload.ts"));
  // Use count=5 so words mode yields at least 5 prefix tokens ("Lorem ipsum dolor sit amet.")
  for (const unit of ["paragraphs", "sentences", "words"]) {
    const result = generateLorem(unit, 5, true);
    assert.ok(
      result.startsWith("Lorem ipsum dolor sit amet"),
      `unit=${unit} with startWithLorem=true should start with canonical phrase, got: "${result.slice(0, 80)}"`
    );
  }
});
