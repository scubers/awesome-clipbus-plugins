// Local preview-workbench scenarios for the decode renderer. Each scenario
// fabricates a DecodePayload (the same shape the Node detector emits) and wraps
// it in the bootstrap envelope createPreviewWorkbench injects for the SDK harness.
// Seed buttons are built with the renderer's own buttonsFor() so the preview
// strip matches the host's runtime button logic (single source of truth).
import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";
import { ATTACHMENT_TYPE, ATTACHMENT_KEY } from "../../features/decode-renderer/payload";
import type { DecodeEncoding, DecodePayload } from "../../features/decode-renderer/payload";
import { buttonsFor } from "../../features/decode-renderer/renderer";

const PLUGIN_ID = "plugin.clipbus.toolbox";

interface DecodeScenarioInput {
  id: string;
  label: string;
  encoding: DecodeEncoding;
  original: string;
  decoded: string;
  decodedIsJSON?: boolean;
  jwt?: DecodePayload["jwt"];
  epochMs?: number | null;
  tsUnit?: "s" | "ms" | null;
  accentHex?: string;
  expanded?: boolean;
}

function createDecodeScenario(input: DecodeScenarioInput): PreviewScenario {
  const payload: DecodePayload = {
    kind: "decode_preview",
    version: 1,
    encoding: input.encoding,
    original: input.original,
    truncated: false,
    decoded: input.decoded,
    decodedIsJSON: input.decodedIsJSON ?? false,
    jwt: input.jwt ?? null,
    epochMs: input.epochMs ?? null,
    tsUnit: input.tsUnit ?? null,
    originalLength: input.original.length,
    decodedLength: input.decoded.length,
    expanded: input.expanded ?? false,
  };

  const item = {
    id: `item-${input.id}`,
    type: "text",
    tags: ["decode"],
    sourceAppID: "com.preview.editor",
  };

  return {
    id: input.id,
    label: input.label,
    mode: "attachmentRenderer",
    pluginID: PLUGIN_ID,
    accentHex: input.accentHex ?? "#2563eb",
    view: "decode-renderer",
    viewport: { heightPolicy: "bounded", min: 32, max: 480 },
    item,
    attachment: {
      item,
      attachment: {
        historyID: `preview-${input.id}`,
        owner: PLUGIN_ID,
        attachmentType: ATTACHMENT_TYPE,
        attachmentKey: ATTACHMENT_KEY,
        payloadJson: JSON.stringify(payload),
      },
    },
    buttons: buttonsFor(payload).map((b) => ({ id: b.id, title: b.title, isEnabled: b.isEnabled ?? true })),
  };
}

export const attachmentScenarios: PreviewScenario[] = [
  createDecodeScenario({
    id: "base64-text",
    label: "Base64 → text",
    encoding: "base64",
    original: "SGVsbG8sIFdvcmxkISBQYXN0eSBkZWNvZGUgcHJldmlldy4=",
    decoded: "Hello, World! Clipbus decode preview.",
    accentHex: "#f59e0b",
    expanded: true,
  }),
  createDecodeScenario({
    id: "base64-json",
    label: "Base64 → JSON",
    encoding: "base64",
    original: "eyJuYW1lIjoiUGFzdHkiLCJraW5kIjoiZGVjb2RlIn0=",
    decoded: '{"name":"Clipbus","kind":"decode"}',
    decodedIsJSON: true,
    accentHex: "#f59e0b",
    expanded: true,
  }),
  createDecodeScenario({
    id: "jwt",
    label: "JWT",
    encoding: "jwt",
    original: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIn0.sig",
    decoded: JSON.stringify(
      { header: { alg: "HS256", typ: "JWT" }, payload: { sub: "1234567890", name: "Jane Doe" } },
      null,
      2,
    ),
    decodedIsJSON: true,
    jwt: {
      header: { alg: "HS256", typ: "JWT" },
      payload: { sub: "1234567890", name: "Jane Doe" },
      signature: "sig",
    },
    accentHex: "#a855f7",
    expanded: true,
  }),
  createDecodeScenario({
    id: "url",
    label: "URL-encoded",
    encoding: "url",
    original: "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dclipbus%20decode%26lang%3Dzh",
    decoded: "https://example.com/search?q=clipbus decode&lang=zh",
    accentHex: "#3b82f6",
  }),
  createDecodeScenario({
    id: "timestamp",
    label: "Unix timestamp",
    encoding: "timestamp",
    original: "1716800000",
    decoded: "2024-05-27 12:53:20",
    epochMs: 1716800000000,
    tsUnit: "s",
    accentHex: "#8b5cf6",
    expanded: true,
  }),
];
