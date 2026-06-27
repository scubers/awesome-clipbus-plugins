"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const manifest = JSON.parse(fs.readFileSync(path.resolve(root, "manifest.json"), "utf8"));

const sampleItem = { id: "item-1", type: "text", tags: [], sourceAppID: "com.example.app" };

// Canonical jwt.io HS256 example: header {alg:HS256,typ:JWT}, payload {sub,name,iat}.
const CANONICAL =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ" +
  ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}
function makeJwt(header, payload, sig = "sig") {
  return `${b64url(header)}.${b64url(payload)}.${sig}`;
}
function textInput(text) {
  return { item: sampleItem, content: { kind: "text", text }, attachments: [] };
}

// ── Manifest contract ─────────────────────────────────────────────────────────

test("manifest declares jwt-detector / jwt-renderer / jwt-copy", () => {
  assert.ok(manifest.detectors.map((d) => d.id).includes("jwt-detector"));
  assert.ok(manifest.attachmentRenderers.map((r) => r.id).includes("jwt-renderer"));
  assert.ok(manifest.actions.map((a) => a.id).includes("jwt-copy"));
});

test("jwt-renderer uiEntry references renderers/ path", () => {
  const r = manifest.attachmentRenderers.find((x) => x.id === "jwt-renderer");
  assert.ok(r.uiEntry.startsWith("renderers/"), `unexpected uiEntry: ${r.uiEntry}`);
});

// ── Detector / payload ────────────────────────────────────────────────────────

test("detector decodes the canonical JWT header and claims", () => {
  const { buildJwtArtifact } = require(path.resolve(root, "src/features/jwt-renderer/payload.ts"));
  const artifact = buildJwtArtifact(textInput(CANONICAL));
  assert.ok(artifact, "should detect canonical JWT");
  assert.equal(artifact.attachmentType, "plugin.decoder.jwt");
  const payload = JSON.parse(artifact.payloadJson);
  assert.equal(payload.kind, "jwt_preview");
  assert.equal(payload.alg, "HS256");
  assert.equal(payload.typ, "JWT");
  const claims = JSON.parse(payload.payloadPretty);
  assert.equal(claims.sub, "1234567890");
  assert.equal(claims.name, "John Doe");
});

test("claimFacts surface standard string claims", () => {
  const { createJwtPayload } = require(path.resolve(root, "src/features/jwt-renderer/payload.ts"));
  const payload = createJwtPayload(textInput(CANONICAL));
  const labels = payload.claimFacts.map((f) => f.label);
  assert.ok(labels.some((l) => l.includes("sub")), "expected a sub claim fact");
  assert.ok(labels.includes("name"), "expected a name claim fact");
});

test("exp far in the past is reported as expired", () => {
  const { createJwtPayload } = require(path.resolve(root, "src/features/jwt-renderer/payload.ts"));
  const jwt = makeJwt({ alg: "HS256", typ: "JWT" }, { sub: "x", exp: 1000000000 });
  const payload = createJwtPayload(textInput(jwt));
  assert.equal(payload.isExpired, true);
});

test("exp far in the future is reported as not expired", () => {
  const { createJwtPayload } = require(path.resolve(root, "src/features/jwt-renderer/payload.ts"));
  const jwt = makeJwt({ alg: "HS256", typ: "JWT" }, { sub: "x", exp: 4000000000 });
  const payload = createJwtPayload(textInput(jwt));
  assert.equal(payload.isExpired, false);
});

test("detector rejects a header without alg", () => {
  const { buildJwtArtifact } = require(path.resolve(root, "src/features/jwt-renderer/payload.ts"));
  const jwt = makeJwt({ foo: 1 }, { bar: 2 });
  assert.equal(buildJwtArtifact(textInput(jwt)), null);
});

test("detector ignores plain text and non-JWT dotted strings", () => {
  const { buildJwtArtifact } = require(path.resolve(root, "src/features/jwt-renderer/payload.ts"));
  assert.equal(buildJwtArtifact(textInput("hello world this is prose")), null);
  assert.equal(buildJwtArtifact(textInput("not.a.token")), null);
  assert.equal(buildJwtArtifact(textInput("abcd.efgh.ijkl")), null);
});

test("detector ignores image content kind", () => {
  const { buildJwtArtifact } = require(path.resolve(root, "src/features/jwt-renderer/payload.ts"));
  const artifact = buildJwtArtifact({
    item: sampleItem,
    content: { kind: "image", width: 10, height: 10, format: "png", bytes: 0 },
    attachments: [],
  });
  assert.equal(artifact, null);
});

test("decodeJwtPayload returns null for non-jwt-preview payloads", () => {
  const { decodeJwtPayload } = require(path.resolve(root, "src/features/jwt-renderer/payload.ts"));
  assert.equal(decodeJwtPayload("not-json"), null);
  assert.equal(decodeJwtPayload('{"kind":"other"}'), null);
  assert.equal(decodeJwtPayload(null), null);
  assert.equal(decodeJwtPayload(undefined), null);
});

// ── Renderer ──────────────────────────────────────────────────────────────────

test("renderer returns shouldDisplay:false for bad payload", async () => {
  const { createJwtRenderer } = require(path.resolve(root, "src/features/jwt-renderer/renderer.ts"));
  const result = await createJwtRenderer().resolveAttachment({
    item: sampleItem,
    content: { kind: "text", text: "" },
    attachments: [],
    attachment: { historyID: "h1", owner: "plugin.decoder", attachmentType: "plugin.decoder.jwt", attachmentKey: "primary", payloadJson: "not-valid-json" },
  });
  assert.equal(result.shouldDisplay, false);
});

test("renderer returns a displayName for a valid payload", async () => {
  const { createJwtRenderer } = require(path.resolve(root, "src/features/jwt-renderer/renderer.ts"));
  const { buildJwtArtifact } = require(path.resolve(root, "src/features/jwt-renderer/payload.ts"));
  const artifact = buildJwtArtifact(textInput(CANONICAL));
  const result = await createJwtRenderer().resolveAttachment({
    item: sampleItem,
    content: { kind: "text", text: CANONICAL },
    attachments: [],
    attachment: { historyID: "h1", owner: "plugin.decoder", attachmentType: artifact.attachmentType, attachmentKey: artifact.attachmentKey, payloadJson: artifact.payloadJson },
  });
  assert.ok(result.displayName);
  assert.notEqual(result.shouldDisplay, false);
});

// ── Action ────────────────────────────────────────────────────────────────────

test("jwt-copy runAutoAction returns the decoded payload as text", async () => {
  const { createJwtCopyAction } = require(path.resolve(root, "src/features/jwt-renderer/action.ts"));
  const result = await createJwtCopyAction().runAutoAction(textInput(CANONICAL));
  assert.equal(result.result.resultKind, "text");
  assert.match(result.result.text, /John Doe/);
});

test("jwt-copy runAutoAction returns none for non-JWT input", async () => {
  const { createJwtCopyAction } = require(path.resolve(root, "src/features/jwt-renderer/action.ts"));
  const result = await createJwtCopyAction().runAutoAction(textInput("just some text"));
  assert.equal(result.result.resultKind, "none");
});

test("jwt-copy resolveSession returns expected shape", async () => {
  const { createJwtCopyAction } = require(path.resolve(root, "src/features/jwt-renderer/action.ts"));
  const result = await createJwtCopyAction().resolveSession(textInput(""));
  assert.ok(Array.isArray(result.buttons));
  assert.ok("initialDraft" in result);
});
