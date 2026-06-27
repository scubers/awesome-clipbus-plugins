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

// ── Manifest contract ─────────────────────────────────────────────────────────

test("manifest declares cron-detector and cron-renderer", () => {
  assert.ok(manifest.detectors.map((d) => d.id).includes("cron-detector"));
  assert.ok(manifest.attachmentRenderers.map((r) => r.id).includes("cron-renderer"));
});

test("cron-renderer uiEntry references renderers/ path", () => {
  const r = manifest.attachmentRenderers.find((x) => x.id === "cron-renderer");
  assert.ok(r.uiEntry.startsWith("renderers/"), `unexpected uiEntry: ${r.uiEntry}`);
});

// ── Detector / payload ────────────────────────────────────────────────────────

test("detect '30 9 * * 1-5' returns 5 fields", () => {
  const { buildCronArtifact } = require(path.resolve(root, "src/features/cron-renderer/payload.ts"));
  const artifact = buildCronArtifact(textInput("30 9 * * 1-5"));
  assert.ok(artifact, "should detect valid cron expression");
  assert.equal(artifact.attachmentType, "plugin.cron.schedule");
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.kind, "cron_preview");
  assert.equal(payload.fields.length, 5);
});

test("weekday field description for '1-5' contains '周'", () => {
  const { createCronPayload } = require(path.resolve(root, "src/features/cron-renderer/payload.ts"));
  const payload = createCronPayload(textInput("30 9 * * 1-5"));
  assert.ok(payload, "should parse '30 9 * * 1-5'");
  const weekdayField = payload.fields[4];
  assert.ok(
    weekdayField.description.includes("周") || weekdayField.description.includes("1 至 5"),
    `weekday description should contain '周' or '1 至 5', got: ${weekdayField.description}`
  );
});

test("detect '*/15 * * * *' passes", () => {
  const { buildCronArtifact } = require(path.resolve(root, "src/features/cron-renderer/payload.ts"));
  const artifact = buildCronArtifact(textInput("*/15 * * * *"));
  assert.ok(artifact, "*/15 * * * * should be detected");
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.expression, "*/15 * * * *");
});

test("minute field description for '*/15' contains '15'", () => {
  const { createCronPayload } = require(path.resolve(root, "src/features/cron-renderer/payload.ts"));
  const payload = createCronPayload(textInput("*/15 * * * *"));
  assert.ok(payload);
  assert.ok(payload.fields[0].description.includes("15"), `got: ${payload.fields[0].description}`);
});

test("rejects 'hello world foo bar baz' — non-cron plain text", () => {
  const { buildCronArtifact } = require(path.resolve(root, "src/features/cron-renderer/payload.ts"));
  assert.equal(buildCronArtifact(textInput("hello world foo bar baz")), null);
});

test("rejects 4-field expression '1 2 3 4'", () => {
  const { buildCronArtifact } = require(path.resolve(root, "src/features/cron-renderer/payload.ts"));
  assert.equal(buildCronArtifact(textInput("1 2 3 4")), null);
});

test("rejects out-of-range minute '99 9 * * *'", () => {
  const { buildCronArtifact } = require(path.resolve(root, "src/features/cron-renderer/payload.ts"));
  assert.equal(buildCronArtifact(textInput("99 9 * * *")), null);
});

test("rejects pure-number expression '1 2 3 4 5' (guard: no special chars)", () => {
  const { buildCronArtifact } = require(path.resolve(root, "src/features/cron-renderer/payload.ts"));
  assert.equal(buildCronArtifact(textInput("1 2 3 4 5")), null);
});

test("decodeCronPayload returns null for bad JSON", () => {
  const { decodeCronPayload } = require(path.resolve(root, "src/features/cron-renderer/payload.ts"));
  assert.equal(decodeCronPayload("not-json"), null);
  assert.equal(decodeCronPayload('{"kind":"other"}'), null);
  assert.equal(decodeCronPayload(null), null);
  assert.equal(decodeCronPayload(undefined), null);
});

// ── Renderer ──────────────────────────────────────────────────────────────────

test("renderer returns shouldDisplay:false for bad payload", async () => {
  const { createCronRenderer } = require(path.resolve(root, "src/features/cron-renderer/renderer.ts"));
  const result = await createCronRenderer().resolveAttachment({
    item: sampleItem,
    content: { kind: "text", text: "" },
    attachments: [],
    attachment: {
      historyID: "h1",
      owner: "plugin.cron",
      attachmentType: "plugin.cron.schedule",
      attachmentKey: "primary",
      payloadJson: "not-valid-json",
    },
  });
  assert.equal(result.shouldDisplay, false);
});

test("renderer returns a displayName for a valid payload", async () => {
  const { createCronRenderer } = require(path.resolve(root, "src/features/cron-renderer/renderer.ts"));
  const { buildCronArtifact } = require(path.resolve(root, "src/features/cron-renderer/payload.ts"));
  const artifact = buildCronArtifact(textInput("0 9 * * 1-5"));
  const result = await createCronRenderer().resolveAttachment({
    item: sampleItem,
    content: { kind: "text", text: "0 9 * * 1-5" },
    attachments: [],
    attachment: {
      historyID: "h1",
      owner: "plugin.cron",
      attachmentType: artifact.attachmentType,
      attachmentKey: artifact.attachmentKey,
      payloadJson: artifact.payloadJson,
    },
  });
  assert.ok(result.displayName, "displayName should be set");
  assert.notEqual(result.shouldDisplay, false);
});

// ── Extra validations ─────────────────────────────────────────────────────────

test("accepts named weekday range 'MON-FRI'", () => {
  const { buildCronArtifact } = require(path.resolve(root, "src/features/cron-renderer/payload.ts"));
  const artifact = buildCronArtifact(textInput("0 8 * * MON-FRI"));
  assert.ok(artifact, "0 8 * * MON-FRI should be detected");
});

test("accepts named month 'JAN-MAR'", () => {
  const { buildCronArtifact } = require(path.resolve(root, "src/features/cron-renderer/payload.ts"));
  const artifact = buildCronArtifact(textInput("0 0 1 JAN-MAR *"));
  assert.ok(artifact, "0 0 1 JAN-MAR * should be detected");
});

test("rejects image content kind", () => {
  const { buildCronArtifact } = require(path.resolve(root, "src/features/cron-renderer/payload.ts"));
  const result = buildCronArtifact({
    item: sampleItem,
    content: { kind: "image", width: 10, height: 10, format: "png", bytes: 0 },
    attachments: [],
  });
  assert.equal(result, null);
});
