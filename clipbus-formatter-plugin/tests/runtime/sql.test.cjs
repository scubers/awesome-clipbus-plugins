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

test("manifest declares sql-detector / sql-renderer", () => {
  assert.ok(manifest.detectors.map((d) => d.id).includes("sql-detector"));
  assert.ok(manifest.attachmentRenderers.map((r) => r.id).includes("sql-renderer"));
});

test("sql-renderer uiEntry references renderers/ path", () => {
  const r = manifest.attachmentRenderers.find((x) => x.id === "sql-renderer");
  assert.ok(r.uiEntry.startsWith("renderers/"), `unexpected uiEntry: ${r.uiEntry}`);
});

// ── Detector / payload ────────────────────────────────────────────────────────

test("detect SELECT…FROM with = guard returns statementType SELECT", () => {
  const { buildSqlArtifact } = require(path.resolve(root, "src/features/sql-renderer/payload.ts"));
  const artifact = buildSqlArtifact(textInput("select id, name from users where id = 1"));
  assert.ok(artifact, "should detect SQL query");
  assert.equal(artifact.attachmentType, "plugin.formatter.sql");
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.kind, "sql_preview");
  assert.equal(payload.statementType, "SELECT");
});

test("formatted SQL contains uppercase SELECT, FROM, WHERE and newlines", () => {
  const { createSqlPayload } = require(path.resolve(root, "src/features/sql-renderer/payload.ts"));
  const payload = createSqlPayload(textInput("select id, name from users where id = 1"));
  assert.ok(payload, "should produce payload");
  assert.ok(payload.formatted.includes("SELECT"), "formatted must have uppercase SELECT");
  assert.ok(payload.formatted.includes("FROM"), "formatted must have uppercase FROM");
  assert.ok(payload.formatted.includes("WHERE"), "formatted must have uppercase WHERE");
  assert.ok(payload.formatted.includes("\n"), "formatted must contain newlines");
});

test("detect INSERT INTO … VALUES returns statementType INSERT", () => {
  const { buildSqlArtifact } = require(path.resolve(root, "src/features/sql-renderer/payload.ts"));
  const artifact = buildSqlArtifact(textInput("INSERT INTO users (id, name) VALUES (1, 'Alice')"));
  assert.ok(artifact, "should detect INSERT statement");
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.statementType, "INSERT");
});

test("detect UPDATE … SET returns statementType UPDATE", () => {
  const { buildSqlArtifact } = require(path.resolve(root, "src/features/sql-renderer/payload.ts"));
  const artifact = buildSqlArtifact(textInput("UPDATE users SET name = 'Bob' WHERE id = 2"));
  assert.ok(artifact, "should detect UPDATE statement");
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.statementType, "UPDATE");
});

test("detect DELETE FROM returns statementType DELETE", () => {
  const { buildSqlArtifact } = require(path.resolve(root, "src/features/sql-renderer/payload.ts"));
  const artifact = buildSqlArtifact(textInput("DELETE FROM users WHERE id = 3"));
  assert.ok(artifact, "should detect DELETE statement");
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.statementType, "DELETE");
});

test("prose 'select the best option from the menu' is ignored (no SQL signal)", () => {
  const { buildSqlArtifact } = require(path.resolve(root, "src/features/sql-renderer/payload.ts"));
  const artifact = buildSqlArtifact(textInput("select the best option from the menu"));
  assert.equal(artifact, null, "should reject prose without SQL signal");
});

test("plain text 'hello world' is ignored", () => {
  const { buildSqlArtifact } = require(path.resolve(root, "src/features/sql-renderer/payload.ts"));
  assert.equal(buildSqlArtifact(textInput("hello world")), null);
});

test("image content kind is ignored", () => {
  const { buildSqlArtifact } = require(path.resolve(root, "src/features/sql-renderer/payload.ts"));
  const artifact = buildSqlArtifact({
    item: sampleItem,
    content: { kind: "image", width: 10, height: 10, format: "png", bytes: 0 },
    attachments: [],
  });
  assert.equal(artifact, null);
});

test("decodeSqlPayload returns null for bad or wrong-kind payloads", () => {
  const { decodeSqlPayload } = require(path.resolve(root, "src/features/sql-renderer/payload.ts"));
  assert.equal(decodeSqlPayload("not-json"), null);
  assert.equal(decodeSqlPayload('{"kind":"other"}'), null);
  assert.equal(decodeSqlPayload(null), null);
  assert.equal(decodeSqlPayload(undefined), null);
});

// ── Renderer ──────────────────────────────────────────────────────────────────

test("renderer returns shouldDisplay:false for bad payload", async () => {
  const { createSqlRenderer } = require(path.resolve(root, "src/features/sql-renderer/renderer.ts"));
  const result = await createSqlRenderer().resolveAttachment({
    item: sampleItem,
    content: { kind: "text", text: "" },
    attachments: [],
    attachment: {
      historyID: "h1",
      owner: "plugin.formatter",
      attachmentType: "plugin.formatter.sql",
      attachmentKey: "primary",
      payloadJson: "not-valid-json",
    },
  });
  assert.equal(result.shouldDisplay, false);
});

test("renderer returns a displayName for a valid payload", async () => {
  const { createSqlRenderer } = require(path.resolve(root, "src/features/sql-renderer/renderer.ts"));
  const { buildSqlArtifact } = require(path.resolve(root, "src/features/sql-renderer/payload.ts"));
  const sql = "SELECT id FROM users WHERE id = 1";
  const artifact = buildSqlArtifact(textInput(sql));
  const result = await createSqlRenderer().resolveAttachment({
    item: sampleItem,
    content: { kind: "text", text: sql },
    attachments: [],
    attachment: {
      historyID: "h1",
      owner: "plugin.formatter",
      attachmentType: artifact.attachmentType,
      attachmentKey: artifact.attachmentKey,
      payloadJson: artifact.payloadJson,
    },
  });
  assert.ok(result.displayName);
  assert.notEqual(result.shouldDisplay, false);
});

