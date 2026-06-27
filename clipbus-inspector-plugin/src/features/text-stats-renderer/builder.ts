// Runtime-only: uses node:crypto. Never imported by UI code.
import { createHash } from "node:crypto";
import type { PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";
import type { TextStatsPayload } from "./payload.ts";

const ATTACHMENT_TYPE = "plugin.inspector.text-stats";
const MIN_TRIM_LENGTH = 20;
const PREVIEW_MAX_CHARS = 80;

export function createTextStatsPayload(input: unknown): TextStatsPayload | null {
  const content = (input as { content?: { kind?: string; text?: string } } | null)?.content;
  if (content?.kind !== "text" || typeof content.text !== "string") return null;

  const text = content.text;
  if (text.trim().length < MIN_TRIM_LENGTH) return null;

  const chars = Array.from(text).length;
  const charsNoSpaces = Array.from(text.replace(/\s/g, "")).length;
  const words = (text.trim().match(/\S+/g) || []).length;
  const lines = text.split(/\r\n|\r|\n/).length;
  const bytes = Buffer.byteLength(text, "utf8");

  const md5 = createHash("md5").update(text, "utf8").digest("hex");
  const sha1 = createHash("sha1").update(text, "utf8").digest("hex");
  const sha256 = createHash("sha256").update(text, "utf8").digest("hex");

  const trimmed = text.trim();
  const preview = Array.from(trimmed).length > PREVIEW_MAX_CHARS
    ? Array.from(trimmed).slice(0, PREVIEW_MAX_CHARS).join("") + "…"
    : trimmed;

  return {
    kind: "text_stats_preview",
    version: 1,
    chars,
    charsNoSpaces,
    words,
    lines,
    bytes,
    md5,
    sha1,
    sha256,
    preview,
  };
}

export function buildTextStatsArtifact(input: unknown): PluginDetectorArtifact | null {
  const payload = createTextStatsPayload(input);
  if (!payload) return null;
  return {
    attachmentType: ATTACHMENT_TYPE,
    attachmentKey: "primary",
    payloadJson: JSON.stringify(payload),
    searchProjection: {
      scope: "inspector",
      searchText: payload.sha256,
      label: "Text Stats",
    },
  };
}
