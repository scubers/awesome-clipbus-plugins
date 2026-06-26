// UI-safe: no node:crypto or Node-only imports.
// Imported by both the runtime and the browser UI (app.vue).

export interface TextStatsPayload {
  kind: "text_stats_preview";
  version: 1;
  chars: number;
  charsNoSpaces: number;
  words: number;
  lines: number;
  bytes: number;
  md5: string;
  sha1: string;
  sha256: string;
  preview: string;
}

export function decodeTextStatsPayload(payloadJson: string | null | undefined): TextStatsPayload | null {
  try {
    const p = JSON.parse(payloadJson ?? "{}") as { kind?: string };
    if (p.kind !== "text_stats_preview") return null;
    return p as TextStatsPayload;
  } catch {
    return null;
  }
}
