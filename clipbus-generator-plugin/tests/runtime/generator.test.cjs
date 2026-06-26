"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const manifest = JSON.parse(fs.readFileSync(path.resolve(root, "manifest.json"), "utf8"));

// ── Manifest contract ────────────────────────────────────────────────────────

test("manifest declares gen-tool action with lifecycle=draft and uiEntry under actions/", () => {
  const action = (manifest.actions ?? []).find((a) => a.id === "gen-tool");
  assert.ok(action, "manifest.actions should contain an entry with id gen-tool");
  assert.equal(action.lifecycle, "draft", "gen-tool lifecycle must be 'draft'");
  assert.ok(
    typeof action.uiEntry === "string" && action.uiEntry.startsWith("actions/"),
    `gen-tool uiEntry should start with "actions/", got: ${action.uiEntry}`
  );
});

// ── Runtime handler contract ─────────────────────────────────────────────────

test("createGenAction returns handler with resolveSession and runAutoAction", () => {
  const { createGenAction } = require(path.resolve(root, "src/features/gen-tool/action.ts"));
  const handler = createGenAction();
  assert.equal(typeof handler.resolveSession, "function", "handler must have resolveSession");
  assert.equal(typeof handler.runAutoAction, "function", "handler must have runAutoAction");
});

test("resolveSession resolves with initialDraft.mode===uuid and non-empty buttons", async () => {
  const { createGenAction } = require(path.resolve(root, "src/features/gen-tool/action.ts"));
  const handler = createGenAction();
  const result = await handler.resolveSession({}, {});
  assert.equal(result.initialDraft?.mode, "uuid", "initialDraft.mode should be 'uuid'");
  assert.ok(Array.isArray(result.buttons) && result.buttons.length > 0, "buttons must be a non-empty array");
});

test("runAutoAction resolves with resultKind=none", async () => {
  const { createGenAction } = require(path.resolve(root, "src/features/gen-tool/action.ts"));
  const handler = createGenAction();
  const result = await handler.runAutoAction({});
  assert.equal(result.result.resultKind, "none", "runAutoAction result.resultKind should be 'none'");
});

// ── Pure payload logic ───────────────────────────────────────────────────────

test("passwordCharset with all options false returns only 26 lowercase letters", () => {
  const { passwordCharset } = require(path.resolve(root, "src/features/gen-tool/payload.ts"));
  const cs = passwordCharset({ useUppercase: false, useNumbers: false, useSymbols: false });
  assert.equal(cs, "abcdefghijklmnopqrstuvwxyz", "charset with no extras should be 26 lowercase letters");
  assert.equal(cs.length, 26);
});

test("passwordCharset with all options true has length 26+26+10+18=80", () => {
  const { passwordCharset } = require(path.resolve(root, "src/features/gen-tool/payload.ts"));
  const cs = passwordCharset({ useUppercase: true, useNumbers: true, useSymbols: true });
  assert.equal(cs.length, 80, `full charset should be 80 chars, got ${cs.length}`);
});

test("buildPassword maps bytes to charset by modulo and takes length chars", () => {
  const { buildPassword } = require(path.resolve(root, "src/features/gen-tool/payload.ts"));
  const result = buildPassword(8, "abcd", [0, 1, 2, 3, 0, 1, 2, 3]);
  assert.equal(result, "abcdabcd");
});

test("uuidFromBytes produces a valid UUID v4 string from 16 bytes", () => {
  const { uuidFromBytes } = require(path.resolve(root, "src/features/gen-tool/payload.ts"));
  const uuid = uuidFromBytes(new Array(16).fill(0));
  const v4re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  assert.match(uuid, v4re, `uuidFromBytes result "${uuid}" does not match UUID v4 pattern`);
});

test("uuidFromBytes works with Uint8Array input", () => {
  const { uuidFromBytes } = require(path.resolve(root, "src/features/gen-tool/payload.ts"));
  const bytes = new Uint8Array(16).fill(0xff);
  const uuid = uuidFromBytes(bytes);
  const v4re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  assert.match(uuid, v4re, `uuidFromBytes(Uint8Array) result "${uuid}" does not match UUID v4 pattern`);
});
