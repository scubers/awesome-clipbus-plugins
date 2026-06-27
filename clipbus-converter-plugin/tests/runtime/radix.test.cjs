"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const manifest = JSON.parse(fs.readFileSync(path.resolve(root, "manifest.json"), "utf8"));

const sampleItem = { id: "item-1", type: "text", tags: [], sourceAppID: "com.example.app" };

function textInput(text) {
  return { item: sampleItem, content: { kind: "text", text }, attachments: [] };
}

// ── Manifest contract ──────────────────────────────────────────────────────────

test("manifest declares radix-detector / radix-renderer", () => {
  assert.ok(manifest.detectors.map((d) => d.id).includes("radix-detector"));
  assert.ok(manifest.attachmentRenderers.map((r) => r.id).includes("radix-renderer"));
});

test("radix-renderer uiEntry references renderers/ path", () => {
  const r = manifest.attachmentRenderers.find((x) => x.id === "radix-renderer");
  assert.ok(r.uiEntry.startsWith("renderers/"), `unexpected uiEntry: ${r.uiEntry}`);
});

// ── Payload / Detector ─────────────────────────────────────────────────────────

test("255 decimal → hex 0xff, bin 0b11111111, oct 0o377", () => {
  const { createRadixPayload } = require(path.resolve(root, "src/features/radix-renderer/payload.ts"));
  const p = createRadixPayload(textInput("255"));
  assert.ok(p, "should parse 255");
  assert.equal(p.hex, "0xff");
  assert.equal(p.binary, "0b11111111");
  assert.equal(p.octal, "0o377");
  assert.equal(p.decimal, "255");
  assert.equal(p.inputBase, "dec");
});

test("0xff hex → decimal 255", () => {
  const { createRadixPayload } = require(path.resolve(root, "src/features/radix-renderer/payload.ts"));
  const p = createRadixPayload(textInput("0xff"));
  assert.ok(p, "should parse 0xff");
  assert.equal(p.decimal, "255");
  assert.equal(p.inputBase, "hex");
});

test("0b1010 binary → decimal 10", () => {
  const { createRadixPayload } = require(path.resolve(root, "src/features/radix-renderer/payload.ts"));
  const p = createRadixPayload(textInput("0b1010"));
  assert.ok(p, "should parse 0b1010");
  assert.equal(p.decimal, "10");
  assert.equal(p.inputBase, "bin");
});

test("0o777 octal → decimal 511", () => {
  const { createRadixPayload } = require(path.resolve(root, "src/features/radix-renderer/payload.ts"));
  const p = createRadixPayload(textInput("0o777"));
  assert.ok(p, "should parse 0o777");
  assert.equal(p.decimal, "511");
  assert.equal(p.inputBase, "oct");
});

test("65 → asciiChar 'A'", () => {
  const { createRadixPayload } = require(path.resolve(root, "src/features/radix-renderer/payload.ts"));
  const p = createRadixPayload(textInput("65"));
  assert.ok(p, "should parse 65");
  assert.equal(p.asciiChar, "A");
});

test("detector ignores 12.5 (float)", () => {
  const { buildRadixArtifact } = require(path.resolve(root, "src/features/radix-renderer/payload.ts"));
  assert.equal(buildRadixArtifact(textInput("12.5")), null);
});

test("detector ignores 'abc' (non-numeric)", () => {
  const { buildRadixArtifact } = require(path.resolve(root, "src/features/radix-renderer/payload.ts"));
  assert.equal(buildRadixArtifact(textInput("abc")), null);
});

test("detector ignores '12 34' (whitespace in middle)", () => {
  const { buildRadixArtifact } = require(path.resolve(root, "src/features/radix-renderer/payload.ts"));
  assert.equal(buildRadixArtifact(textInput("12 34")), null);
});

test("large integer (BigInt) does not crash", () => {
  const { createRadixPayload } = require(path.resolve(root, "src/features/radix-renderer/payload.ts"));
  const p = createRadixPayload(textInput("123456789012345678901234567890"));
  assert.ok(p, "should parse large integer");
  assert.equal(p.decimal, "123456789012345678901234567890");
});

test("decodeRadixPayload returns null for invalid/wrong-kind input", () => {
  const { decodeRadixPayload } = require(path.resolve(root, "src/features/radix-renderer/payload.ts"));
  assert.equal(decodeRadixPayload("not-json"), null);
  assert.equal(decodeRadixPayload('{"kind":"other"}'), null);
  assert.equal(decodeRadixPayload(null), null);
  assert.equal(decodeRadixPayload(undefined), null);
});

// ── Renderer ──────────────────────────────────────────────────────────────────

test("renderer returns shouldDisplay:false for bad payload", async () => {
  const { createRadixRenderer } = require(path.resolve(root, "src/features/radix-renderer/renderer.ts"));
  const result = await createRadixRenderer().resolveAttachment({
    item: sampleItem,
    content: { kind: "text", text: "" },
    attachments: [],
    attachment: {
      historyID: "h1",
      owner: "plugin.converter",
      attachmentType: "plugin.converter.radix",
      attachmentKey: "primary",
      payloadJson: "not-valid-json",
    },
  });
  assert.equal(result.shouldDisplay, false);
});

test("renderer returns displayName for valid payload", async () => {
  const { createRadixRenderer } = require(path.resolve(root, "src/features/radix-renderer/renderer.ts"));
  const { buildRadixArtifact } = require(path.resolve(root, "src/features/radix-renderer/payload.ts"));
  const artifact = buildRadixArtifact(textInput("255"));
  const result = await createRadixRenderer().resolveAttachment({
    item: sampleItem,
    content: { kind: "text", text: "255" },
    attachments: [],
    attachment: {
      historyID: "h1",
      owner: "plugin.converter",
      attachmentType: artifact.attachmentType,
      attachmentKey: artifact.attachmentKey,
      payloadJson: artifact.payloadJson,
    },
  });
  assert.ok(result.displayName);
  assert.notEqual(result.shouldDisplay, false);
});

