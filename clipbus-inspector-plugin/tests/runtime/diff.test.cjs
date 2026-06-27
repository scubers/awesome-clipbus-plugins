"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const manifest = JSON.parse(fs.readFileSync(path.resolve(root, "manifest.json"), "utf8"));

const sampleItem = { id: "item-1", type: "text", tags: [], sourceAppID: "com.example.app" };

// A canonical unified diff with one modified file.
const SAMPLE_DIFF = `diff --git a/src/foo.ts b/src/foo.ts
index abc123..def456 100644
--- a/src/foo.ts
+++ b/src/foo.ts
@@ -1,3 +1,4 @@
 const x = 1;
-const y = 2;
+const y = 3;
+const z = 4;
 export { x, y };`;

function textInput(text) {
  return { item: sampleItem, content: { kind: "text", text }, attachments: [] };
}

// ── Manifest contract ─────────────────────────────────────────────────────────

test("manifest declares diff-detector and diff-renderer", () => {
  assert.ok(manifest.detectors.map((d) => d.id).includes("diff-detector"));
  assert.ok(manifest.attachmentRenderers.map((r) => r.id).includes("diff-renderer"));
});

test("diff-renderer uiEntry references renderers/ path", () => {
  const r = manifest.attachmentRenderers.find((x) => x.id === "diff-renderer");
  assert.ok(r.uiEntry.startsWith("renderers/"), `unexpected uiEntry: ${r.uiEntry}`);
});

// ── Detector / payload ────────────────────────────────────────────────────────

test("buildDiffArtifact detects a canonical unified diff", () => {
  const { buildDiffArtifact } = require(path.resolve(root, "src/features/diff-renderer/payload.ts"));
  const artifact = buildDiffArtifact(textInput(SAMPLE_DIFF));
  assert.ok(artifact, "should detect canonical unified diff");
  assert.equal(artifact.attachmentType, "plugin.inspector.diff");
});

test("additions and deletions counts are correct", () => {
  const { buildDiffArtifact } = require(path.resolve(root, "src/features/diff-renderer/payload.ts"));
  const artifact = buildDiffArtifact(textInput(SAMPLE_DIFF));
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.kind, "diff_preview");
  assert.equal(payload.additions, 2);
  assert.equal(payload.deletions, 1);
});

test("files count is correct for a single-file git diff", () => {
  const { buildDiffArtifact } = require(path.resolve(root, "src/features/diff-renderer/payload.ts"));
  const artifact = buildDiffArtifact(textInput(SAMPLE_DIFF));
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.files, 1);
});

test("detector recognizes hunk-only diff without diff --git header", () => {
  const { buildDiffArtifact } = require(path.resolve(root, "src/features/diff-renderer/payload.ts"));
  const hunkOnly = `--- a/main.py
+++ b/main.py
@@ -5,3 +5,4 @@
 def foo():
-    return 1
+    return 2
+    # updated`;
  const artifact = buildDiffArtifact(textInput(hunkOnly));
  assert.ok(artifact, "should detect hunk-only unified diff");
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.additions, 2);
  assert.equal(payload.deletions, 1);
});

test("detector ignores plain prose text", () => {
  const { buildDiffArtifact } = require(path.resolve(root, "src/features/diff-renderer/payload.ts"));
  assert.equal(buildDiffArtifact(textInput("This is some regular prose with no diff content.")), null);
});

test("detector ignores text with only one change line", () => {
  const { buildDiffArtifact } = require(path.resolve(root, "src/features/diff-renderer/payload.ts"));
  const oneChange = "--- a/foo\n+++ b/foo\n@@ -1 +1 @@\n+only one addition";
  assert.equal(buildDiffArtifact(textInput(oneChange)), null);
});

test("detector ignores text containing + and - but no diff header", () => {
  const { buildDiffArtifact } = require(path.resolve(root, "src/features/diff-renderer/payload.ts"));
  const math = "result = -1 + 2\nscore = +100 - 50\ndelta = -30";
  assert.equal(buildDiffArtifact(textInput(math)), null);
});

test("detector ignores image content kind", () => {
  const { buildDiffArtifact } = require(path.resolve(root, "src/features/diff-renderer/payload.ts"));
  const artifact = buildDiffArtifact({
    item: sampleItem,
    content: { kind: "image", width: 10, height: 10, format: "png", bytes: 0 },
    attachments: [],
  });
  assert.equal(artifact, null);
});

test("decodeDiffPayload returns null for non-diff-preview payloads", () => {
  const { decodeDiffPayload } = require(path.resolve(root, "src/features/diff-renderer/payload.ts"));
  assert.equal(decodeDiffPayload("not-json"), null);
  assert.equal(decodeDiffPayload('{"kind":"other"}'), null);
  assert.equal(decodeDiffPayload(null), null);
  assert.equal(decodeDiffPayload(undefined), null);
});

test("renderer returns shouldDisplay:false for a bad payload", async () => {
  const { createDiffRenderer } = require(path.resolve(root, "src/features/diff-renderer/renderer.ts"));
  const result = await createDiffRenderer().resolveAttachment({
    item: sampleItem,
    content: { kind: "text", text: "" },
    attachments: [],
    attachment: {
      historyID: "h1",
      owner: "plugin.inspector",
      attachmentType: "plugin.inspector.diff",
      attachmentKey: "primary",
      payloadJson: "not-valid-json",
    },
  });
  assert.equal(result.shouldDisplay, false);
});

test("renderer returns a displayName for a valid payload", async () => {
  const { createDiffRenderer } = require(path.resolve(root, "src/features/diff-renderer/renderer.ts"));
  const { buildDiffArtifact } = require(path.resolve(root, "src/features/diff-renderer/payload.ts"));
  const artifact = buildDiffArtifact(textInput(SAMPLE_DIFF));
  const result = await createDiffRenderer().resolveAttachment({
    item: sampleItem,
    content: { kind: "text", text: SAMPLE_DIFF },
    attachments: [],
    attachment: {
      historyID: "h1",
      owner: "plugin.inspector",
      attachmentType: artifact.attachmentType,
      attachmentKey: artifact.attachmentKey,
      payloadJson: artifact.payloadJson,
    },
  });
  assert.ok(result.displayName);
  assert.notEqual(result.shouldDisplay, false);
});

test("multi-file diff counts files and change lines correctly", () => {
  const { buildDiffArtifact } = require(path.resolve(root, "src/features/diff-renderer/payload.ts"));
  const twoFiles = `--- a/a.ts
+++ b/a.ts
@@ -1,2 +1,2 @@
-old a
+new a
--- a/b.ts
+++ b/b.ts
@@ -1,2 +1,2 @@
-old b
+new b`;
  const artifact = buildDiffArtifact(textInput(twoFiles));
  assert.ok(artifact, "should detect two-file diff");
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.files, 2);
  assert.equal(payload.additions, 2);
  assert.equal(payload.deletions, 2);
});
