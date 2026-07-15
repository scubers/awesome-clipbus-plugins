// UI-safe: no node:* imports — this file is imported by both app.vue (browser) and runtime.
import type { PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";

export interface QueryPair {
  key: string;
  value: string;
}

export interface QueryPayload {
  kind: "query_table";
  version: 1;
  pairs: QueryPair[];
  count: number;
  hasDuplicateKeys: boolean;
  jsonObject: string;
  decodeError?: boolean;
}

const ATTACHMENT_TYPE = "plugin.formatter.query";
const CONTROL_RE = /\p{C}/u;

// Gate: anchored regex requiring at least two key=value pairs separated by &.
// Key: one or more chars that are not =, &, or whitespace.
// Value: zero or more chars that are not & or whitespace (values may contain "=").
const GATE_REGEX = /^\??[^=&\s]+=[^&\s]*(?:&[^=&\s]+=[^&\s]*)+$/;

function isQueryString(text: string): boolean {
  if (!text) return false;
  if (!isReadableText(text)) return false;
  // A full URL (scheme://...) belongs to the url-extractor, not here. Reject only
  // when the WHOLE string starts with a scheme://, NOT when "://" merely appears
  // inside a value — e.g. "redirect=https://x.com&a=1" is a legitimate query string.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(text)) return false;
  return GATE_REGEX.test(text);
}

function isReadableText(text: string): boolean {
  if (text.length === 0) return true;
  let printable = 0;
  let total = 0;
  for (const char of text) {
    total += 1;
    if (char === "\t" || char === "\n" || char === "\r" || !CONTROL_RE.test(char)) {
      printable += 1;
    }
  }
  return printable / total >= 0.95;
}

// Form-encoding: replace "+" with space BEFORE decodeURIComponent.
function decodeQueryPart(raw: string): { decoded: string; error: boolean } {
  try {
    const decoded = decodeURIComponent(raw.replace(/\+/g, " "));
    return isReadableText(decoded)
      ? { decoded, error: false }
      : { decoded: raw, error: true };
  } catch {
    // Malformed %XX — return raw and signal the error.
    return { decoded: raw, error: true };
  }
}

export function createQueryPayload(input: unknown): QueryPayload | null {
  const content = (
    input as { content?: { kind?: string; text?: string } } | null
  )?.content;
  if (content?.kind !== "text" || typeof content.text !== "string") return null;

  const text = content.text.trim();
  if (!isQueryString(text)) return null;

  // Strip the optional leading "?" before parsing.
  const qs = text.startsWith("?") ? text.slice(1) : text;

  let decodeError = false;
  const pairs: QueryPair[] = [];

  for (const segment of qs.split("&")) {
    const eqIdx = segment.indexOf("=");
    const rawKey = eqIdx === -1 ? segment : segment.slice(0, eqIdx);
    const rawValue = eqIdx === -1 ? "" : segment.slice(eqIdx + 1);

    const { decoded: key, error: keyErr } = decodeQueryPart(rawKey);
    const { decoded: value, error: valErr } = decodeQueryPart(rawValue);
    if (keyErr || valErr) decodeError = true;
    pairs.push({ key, value });
  }

  // Build object for "Copy as JSON" — last value wins on duplicate keys.
  const obj: Record<string, string> = {};
  for (const { key, value } of pairs) {
    obj[key] = value;
  }

  // Detect duplicate keys.
  const seen = new Set<string>();
  let hasDuplicateKeys = false;
  for (const { key } of pairs) {
    if (seen.has(key)) {
      hasDuplicateKeys = true;
      break;
    }
    seen.add(key);
  }

  const payload: QueryPayload = {
    kind: "query_table",
    version: 1,
    pairs,
    count: pairs.length,
    hasDuplicateKeys,
    jsonObject: JSON.stringify(obj),
  };
  if (decodeError) payload.decodeError = true;

  return payload;
}

export function decodeQueryPayload(
  payloadJson: string | null | undefined
): QueryPayload | null {
  try {
    const p = JSON.parse(payloadJson ?? "{}") as { kind?: string };
    if (p.kind !== "query_table") return null;
    return p as QueryPayload;
  } catch {
    return null;
  }
}

export function buildQueryArtifact(
  input: unknown
): PluginDetectorArtifact | null {
  const payload = createQueryPayload(input);
  if (!payload) return null;
  return {
    attachmentType: ATTACHMENT_TYPE,
    attachmentKey: "primary",
    payloadJson: JSON.stringify(payload),
    searchProjection: {
      scope: "formatter",
      searchText: payload.pairs
        .map((p) => p.key + " " + p.value)
        .join(" ")
        .slice(0, 200),
      label: "Query String",
    },
  };
}
