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

test("manifest declares xml-detector / xml-renderer / xml-copy", () => {
  assert.ok(manifest.detectors.map((d) => d.id).includes("xml-detector"));
  assert.ok(manifest.attachmentRenderers.map((r) => r.id).includes("xml-renderer"));
  assert.ok(manifest.actions.map((a) => a.id).includes("xml-copy"));
});

test("xml-renderer uiEntry references renderers/ path", () => {
  const r = manifest.attachmentRenderers.find((x) => x.id === "xml-renderer");
  assert.ok(r.uiEntry.startsWith("renderers/"), `unexpected uiEntry: ${r.uiEntry}`);
});

// ── Detector / payload ────────────────────────────────────────────────────────

test("detect <a><b>1</b></a> → elementCount 2, formatted contains newline+indent", () => {
  const { buildXmlArtifact } = require(path.resolve(root, "src/features/xml-renderer/payload.ts"));
  const artifact = buildXmlArtifact(textInput("<a><b>1</b></a>"));
  assert.ok(artifact, "should detect XML");
  assert.equal(artifact.attachmentType, "plugin.formatter.xml");
  const p = JSON.parse(artifact.payloadJson);
  assert.equal(p.kind, "xml_preview");
  assert.equal(p.elementCount, 2);
  assert.ok(p.formatted.includes("\n"), "formatted should contain a newline");
  assert.ok(p.formatted.includes("  "), "formatted should contain indentation");
});

test("detect <root attr=\"x\"><child/></root> → attributeCount ≥ 1", () => {
  const { buildXmlArtifact } = require(path.resolve(root, "src/features/xml-renderer/payload.ts"));
  const artifact = buildXmlArtifact(textInput('<root attr="x"><child/></root>'));
  assert.ok(artifact, "should detect XML");
  const p = JSON.parse(artifact.payloadJson);
  assert.ok(p.attributeCount >= 1, `expected attributeCount ≥ 1, got ${p.attributeCount}`);
});

test("detect multi-attribute tag counts all attributes", () => {
  const { createXmlPayload } = require(path.resolve(root, "src/features/xml-renderer/payload.ts"));
  const p = createXmlPayload(textInput('<node a="1" b="2"><leaf/></node>'));
  assert.ok(p, "should detect XML");
  assert.ok(p.attributeCount >= 2, `expected attributeCount ≥ 2, got ${p.attributeCount}`);
});

test("detect XML with prolog declaration", () => {
  const { buildXmlArtifact } = require(path.resolve(root, "src/features/xml-renderer/payload.ts"));
  const artifact = buildXmlArtifact(textInput('<?xml version="1.0"?><root><child/></root>'));
  assert.ok(artifact, "should detect XML with prolog");
  const p = JSON.parse(artifact.payloadJson);
  assert.ok(p.formatted.includes("<?xml"), "formatted should include prolog");
});

test("detect XML with comment", () => {
  const { buildXmlArtifact } = require(path.resolve(root, "src/features/xml-renderer/payload.ts"));
  const artifact = buildXmlArtifact(textInput("<!-- header --><root><item/></root>"));
  assert.ok(artifact, "should detect XML with comment");
  const p = JSON.parse(artifact.payloadJson);
  assert.ok(p.formatted.includes("<!-- header -->"), "formatted should retain comment");
});

test("ignore plain text 'hello'", () => {
  const { buildXmlArtifact } = require(path.resolve(root, "src/features/xml-renderer/payload.ts"));
  assert.equal(buildXmlArtifact(textInput("hello")), null);
});

test("ignore JSON {\"a\":1}", () => {
  const { buildXmlArtifact } = require(path.resolve(root, "src/features/xml-renderer/payload.ts"));
  assert.equal(buildXmlArtifact(textInput('{"a":1}')), null);
});

test("ignore single bare < character", () => {
  const { buildXmlArtifact } = require(path.resolve(root, "src/features/xml-renderer/payload.ts"));
  assert.equal(buildXmlArtifact(textInput("<")), null);
});

test("ignore single self-closing tag with no partner", () => {
  const { buildXmlArtifact } = require(path.resolve(root, "src/features/xml-renderer/payload.ts"));
  assert.equal(buildXmlArtifact(textInput("<br/>")), null);
});

test("ignore image content kind", () => {
  const { buildXmlArtifact } = require(path.resolve(root, "src/features/xml-renderer/payload.ts"));
  const artifact = buildXmlArtifact({
    item: sampleItem,
    content: { kind: "image", width: 10, height: 10, format: "png", bytes: 0 },
    attachments: [],
  });
  assert.equal(artifact, null);
});

test("decodeXmlPayload returns null for bad JSON", () => {
  const { decodeXmlPayload } = require(path.resolve(root, "src/features/xml-renderer/payload.ts"));
  assert.equal(decodeXmlPayload("not-json"), null);
  assert.equal(decodeXmlPayload('{"kind":"other"}'), null);
  assert.equal(decodeXmlPayload(null), null);
  assert.equal(decodeXmlPayload(undefined), null);
});

// ── Renderer ──────────────────────────────────────────────────────────────────

test("renderer returns shouldDisplay:false for bad payload", async () => {
  const { createXmlRenderer } = require(path.resolve(root, "src/features/xml-renderer/renderer.ts"));
  const result = await createXmlRenderer().resolveAttachment({
    item: sampleItem,
    content: { kind: "text", text: "" },
    attachments: [],
    attachment: {
      historyID: "h1",
      owner: "plugin.formatter",
      attachmentType: "plugin.formatter.xml",
      attachmentKey: "primary",
      payloadJson: "not-valid-json",
    },
  });
  assert.equal(result.shouldDisplay, false);
});

test("renderer returns displayName for valid payload", async () => {
  const { createXmlRenderer } = require(path.resolve(root, "src/features/xml-renderer/renderer.ts"));
  const { buildXmlArtifact } = require(path.resolve(root, "src/features/xml-renderer/payload.ts"));
  const artifact = buildXmlArtifact(textInput("<root><child/></root>"));
  const result = await createXmlRenderer().resolveAttachment({
    item: sampleItem,
    content: { kind: "text", text: "<root><child/></root>" },
    attachments: [],
    attachment: {
      historyID: "h1",
      owner: "plugin.formatter",
      attachmentType: artifact.attachmentType,
      attachmentKey: artifact.attachmentKey,
      payloadJson: artifact.payloadJson,
    },
  });
  assert.ok(result.displayName, "should have a displayName");
  assert.notEqual(result.shouldDisplay, false);
});

// ── Action ────────────────────────────────────────────────────────────────────

test("xml-copy runAutoAction returns formatted XML as text", async () => {
  const { createXmlCopyAction } = require(path.resolve(root, "src/features/xml-renderer/action.ts"));
  const result = await createXmlCopyAction().runAutoAction(textInput("<root><child/></root>"));
  assert.equal(result.result.resultKind, "text");
  assert.ok(result.result.text.includes("<root>"), "text should contain root tag");
});

test("xml-copy runAutoAction returns none for non-XML input", async () => {
  const { createXmlCopyAction } = require(path.resolve(root, "src/features/xml-renderer/action.ts"));
  const result = await createXmlCopyAction().runAutoAction(textInput("just some plain text"));
  assert.equal(result.result.resultKind, "none");
});

test("xml-copy resolveSession returns expected shape", async () => {
  const { createXmlCopyAction } = require(path.resolve(root, "src/features/xml-renderer/action.ts"));
  const result = await createXmlCopyAction().resolveSession(textInput(""));
  assert.ok(Array.isArray(result.buttons));
  assert.ok("initialDraft" in result);
});
