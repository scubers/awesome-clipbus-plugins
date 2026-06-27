import type { PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";

export interface TimestampPayload {
  kind: "timestamp_preview";
  version: 1;
  original: string;
  unit: "seconds" | "milliseconds";
  epochMs: number;
  iso: string;
  utc: string;
  local: string;
  weekday: string;
}

const ATTACHMENT_TYPE = "plugin.converter.timestamp";
const SECONDS_RE = /^\d{10}$/;
const MILLIS_RE = /^\d{13}$/;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function createTimestampPayload(input: unknown): TimestampPayload | null {
  const content = (input as { content?: { kind?: string; text?: string } } | null)?.content;
  if (content?.kind !== "text" || typeof content.text !== "string") return null;

  const original = content.text.trim();

  let unit: "seconds" | "milliseconds";
  let epochMs: number;

  if (SECONDS_RE.test(original)) {
    unit = "seconds";
    epochMs = parseInt(original, 10) * 1000;
  } else if (MILLIS_RE.test(original)) {
    unit = "milliseconds";
    epochMs = parseInt(original, 10);
  } else {
    return null;
  }

  const date = new Date(epochMs);
  const utcYear = date.getUTCFullYear();
  if (utcYear < 2001 || utcYear > 2099) return null;

  return {
    kind: "timestamp_preview",
    version: 1,
    original,
    unit,
    epochMs,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    weekday: WEEKDAYS[date.getUTCDay()],
  };
}

export function decodeTimestampPayload(payloadJson: string | null | undefined): TimestampPayload | null {
  try {
    const p = JSON.parse(payloadJson ?? "{}") as { kind?: string };
    if (p.kind !== "timestamp_preview") return null;
    return p as TimestampPayload;
  } catch {
    return null;
  }
}

export function buildTimestampArtifact(input: unknown): PluginDetectorArtifact | null {
  const payload = createTimestampPayload(input);
  if (!payload) return null;
  return {
    attachmentType: ATTACHMENT_TYPE,
    attachmentKey: "primary",
    payloadJson: JSON.stringify(payload),
    searchProjection: {
      scope: "converter",
      searchText: payload.iso,
      label: "Unix Timestamp",
    },
  };
}
