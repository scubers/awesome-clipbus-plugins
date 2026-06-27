import type { PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";

export interface JsonFormatterPayload {
  kind: "json_formatter_preview";
  version: 1;
  originalLength: number;
  formatted: string;
  formattedLength: number;
  topLevelType: "object" | "array" | "other";
  topLevelCount: number;
  display: {
    typeLabel: string;
    headline: string;
    subheadline: string;
  };
}

const ATTACHMENT_TYPE = "plugin.formatter.json";
const MAX_INPUT_CHARS = 50_000;
const MAX_FORMATTED_CHARS = 20_000;

function describeTopLevel(parsed: unknown): {
  type: "object" | "array" | "other";
  count: number;
} {
  if (Array.isArray(parsed)) return { type: "array", count: parsed.length };
  if (parsed !== null && typeof parsed === "object") {
    return { type: "object", count: Object.keys(parsed as object).length };
  }
  return { type: "other", count: 0 };
}

export function createJsonPayload(input: unknown): JsonFormatterPayload | null {
  const content = (
    input as { content?: { kind?: string; text?: string } } | null
  )?.content;
  if (content?.kind !== "text" || typeof content.text !== "string") return null;

  const raw = content.text.trim();
  if (raw.length < 2 || raw.length > MAX_INPUT_CHARS) return null;
  // Quick reject: only detect JSON objects and arrays
  if (raw[0] !== "{" && raw[0] !== "[") return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  // Only handle objects and arrays (not bare primitives)
  if (parsed === null || typeof parsed !== "object") return null;

  const { type, count } = describeTopLevel(parsed);
  const formatted = JSON.stringify(parsed, null, 2);
  const truncatedFormatted =
    formatted.length > MAX_FORMATTED_CHARS
      ? formatted.slice(0, MAX_FORMATTED_CHARS) + "\n…"
      : formatted;

  const typeLabel = type === "array" ? "JSON Array" : "JSON Object";
  const countLabel = type === "array" ? `${count} items` : `${count} keys`;
  const headline = `${typeLabel} · ${countLabel}`;
  const isAlreadyFormatted = raw === formatted;
  const subheadline = isAlreadyFormatted
    ? `already formatted · ${raw.length} chars`
    : `${raw.length} → ${formatted.length} chars`;

  return {
    kind: "json_formatter_preview",
    version: 1,
    originalLength: raw.length,
    formatted: truncatedFormatted,
    formattedLength: formatted.length,
    topLevelType: type,
    topLevelCount: count,
    display: { typeLabel, headline, subheadline },
  };
}

export function decodeJsonPayload(
  payloadJson: string | null | undefined
): JsonFormatterPayload | null {
  try {
    const p = JSON.parse(payloadJson ?? "{}") as { kind?: string };
    if (p.kind !== "json_formatter_preview") return null;
    return p as JsonFormatterPayload;
  } catch {
    return null;
  }
}

export function buildJsonArtifact(input: unknown): PluginDetectorArtifact | null {
  const payload = createJsonPayload(input);
  if (!payload) return null;
  return {
    attachmentType: ATTACHMENT_TYPE,
    attachmentKey: "primary",
    payloadJson: JSON.stringify(payload),
    searchProjection: {
      scope: "formatter",
      searchText: payload.formatted.slice(0, 200),
      label: payload.display.typeLabel,
    },
  };
}
