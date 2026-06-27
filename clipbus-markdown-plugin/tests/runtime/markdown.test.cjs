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

test("manifest declares markdown-detector and markdown-renderer", () => {
  assert.ok(manifest.detectors.map((d) => d.id).includes("markdown-detector"));
  assert.ok(manifest.attachmentRenderers.map((r) => r.id).includes("markdown-renderer"));
});

test("markdown-renderer uiEntry references renderers/ path", () => {
  const r = manifest.attachmentRenderers.find((x) => x.id === "markdown-renderer");
  assert.ok(r.uiEntry.startsWith("renderers/"), `unexpected uiEntry: ${r.uiEntry}`);
});

// ── Detector ──────────────────────────────────────────────────────────────────

test("detector fires on text with heading + bold + list (3 signals)", () => {
  const { buildMarkdownArtifact } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  const src = "# 标题\n\n**粗体文字**\n\n- 列表项一\n- 列表项二";
  const artifact = buildMarkdownArtifact(textInput(src));
  assert.ok(artifact, "should detect markdown with multiple signals");
  assert.equal(artifact.attachmentType, "plugin.markdown.preview");
});

test("detector ignores plain prose (0 signals)", () => {
  const { buildMarkdownArtifact } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  assert.equal(buildMarkdownArtifact(textInput("just a normal sentence without any markdown.")), null);
});

test("detector ignores image content kind", () => {
  const { buildMarkdownArtifact } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  const artifact = buildMarkdownArtifact({
    item: sampleItem,
    content: { kind: "image", width: 10, height: 10, format: "png", bytes: 0 },
    attachments: [],
  });
  assert.equal(artifact, null);
});

test("detector requires at least 2 signal kinds (1 signal alone is rejected)", () => {
  const { buildMarkdownArtifact } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  // Only one signal: a single heading with no other markdown
  const onlyHeading = "# Just a heading\nand some prose text here";
  assert.equal(buildMarkdownArtifact(textInput(onlyHeading)), null);
});

// ── renderMarkdown ────────────────────────────────────────────────────────────

test("renderMarkdown escapes raw HTML — <script> tag becomes &lt;script&gt;", () => {
  const { renderMarkdown } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  const html = renderMarkdown("<script>alert(1)</script>");
  assert.ok(html.includes("&lt;script&gt;"), `expected &lt;script&gt; in: ${html}`);
  assert.ok(!html.includes("<script>"), `raw <script> must not appear in: ${html}`);
});

test("renderMarkdown renders ATX headings h1–h3", () => {
  const { renderMarkdown } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  assert.ok(renderMarkdown("# H").includes("<h1>H</h1>"));
  assert.ok(renderMarkdown("## H2").includes("<h2>H2</h2>"));
  assert.ok(renderMarkdown("### H3").includes("<h3>H3</h3>"));
});

test("renderMarkdown renders **x** as <strong>", () => {
  const { renderMarkdown } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  const html = renderMarkdown("**bold**");
  assert.ok(html.includes("<strong>bold</strong>"), `got: ${html}`);
});

test("renderMarkdown renders *x* and _x_ as <em>", () => {
  const { renderMarkdown } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  assert.ok(renderMarkdown("*italic*").includes("<em>italic</em>"));
  assert.ok(renderMarkdown("_also italic_").includes("<em>also italic</em>"));
});

test("renderMarkdown renders inline code as <code>", () => {
  const { renderMarkdown } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  const html = renderMarkdown("use `npm install`");
  assert.ok(html.includes("<code>npm install</code>"), `got: ${html}`);
});

test("renderMarkdown renders fenced code block as <pre><code>", () => {
  const { renderMarkdown } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  const html = renderMarkdown("```js\nconsole.log(1)\n```");
  assert.ok(html.includes("<pre><code"), `got: ${html}`);
  assert.ok(html.includes("console.log(1)"), `got: ${html}`);
});

test("renderMarkdown renders [t](https://example.com) as <a href>", () => {
  const { renderMarkdown } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  const html = renderMarkdown("[example](https://example.com)");
  assert.ok(html.includes('<a href="https://example.com">example</a>'), `got: ${html}`);
});

test("renderMarkdown strips javascript: href — no href='javascript:' in output", () => {
  const { renderMarkdown } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  const html = renderMarkdown("[t](javascript:alert(1))");
  assert.ok(!html.includes("href=\"javascript:"), `javascript: href must not appear in: ${html}`);
});

test("renderMarkdown renders unordered list as <ul><li>", () => {
  const { renderMarkdown } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  const html = renderMarkdown("- alpha\n- beta");
  assert.ok(html.includes("<ul>"), `got: ${html}`);
  assert.ok(html.includes("<li>alpha</li>"), `got: ${html}`);
});

test("renderMarkdown renders blockquote as <blockquote>", () => {
  const { renderMarkdown } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  const html = renderMarkdown("> quoted text");
  assert.ok(html.includes("<blockquote>"), `got: ${html}`);
  assert.ok(html.includes("quoted text"), `got: ${html}`);
});

// ── decodeMarkdownPayload ────────────────────────────────────────────────────

test("decodeMarkdownPayload returns null for bad JSON and wrong kind", () => {
  const { decodeMarkdownPayload } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  assert.equal(decodeMarkdownPayload("not-json"), null);
  assert.equal(decodeMarkdownPayload('{"kind":"other"}'), null);
  assert.equal(decodeMarkdownPayload(null), null);
  assert.equal(decodeMarkdownPayload(undefined), null);
});

// ── Renderer ──────────────────────────────────────────────────────────────────

test("renderer returns shouldDisplay:false for invalid payload", async () => {
  const { createMarkdownRenderer } = require(path.resolve(root, "src/features/markdown-renderer/renderer.ts"));
  const result = await createMarkdownRenderer().resolveAttachment({
    item: sampleItem,
    content: { kind: "text", text: "" },
    attachments: [],
    attachment: {
      historyID: "h1",
      owner: "plugin.markdown",
      attachmentType: "plugin.markdown.preview",
      attachmentKey: "primary",
      payloadJson: "not-valid-json",
    },
  });
  assert.equal(result.shouldDisplay, false);
});

test("renderer returns a displayName for a valid payload", async () => {
  const { createMarkdownRenderer } = require(path.resolve(root, "src/features/markdown-renderer/renderer.ts"));
  const { buildMarkdownArtifact } = require(path.resolve(root, "src/features/markdown-renderer/payload.ts"));
  const src = "# Hello\n\n**world** with `code`";
  const artifact = buildMarkdownArtifact(textInput(src));
  const result = await createMarkdownRenderer().resolveAttachment({
    item: sampleItem,
    content: { kind: "text", text: src },
    attachments: [],
    attachment: {
      historyID: "h1",
      owner: "plugin.markdown",
      attachmentType: artifact.attachmentType,
      attachmentKey: artifact.attachmentKey,
      payloadJson: artifact.payloadJson,
    },
  });
  assert.ok(result.displayName, "should have a displayName");
  assert.notEqual(result.shouldDisplay, false);
});
