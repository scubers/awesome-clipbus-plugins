import type { PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";

export interface QrPayload {
  kind: "qr_code";
  version: 1;
  url: string;
  display: {
    typeLabel: string;
    headline: string;
  };
}

/**
 * Accept only a whole trimmed string that is an http/https URL with a hostname.
 * Returns the url string or null.
 */
export function parseUrl(text: string): string | null {
  const s = text.trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) return null;
  try {
    const parsed = new URL(s);
    if (!parsed.hostname) return null;
    return s;
  } catch {
    return null;
  }
}

/**
 * Build a QrPayload from a detector input object.
 * Returns null unless content is text and the text is a valid http/https URL.
 */
export function createQrPayload(input: unknown): QrPayload | null {
  const content = (
    input as { content?: { kind?: string; text?: string } } | null
  )?.content;
  if (content?.kind !== "text" || typeof content.text !== "string") return null;

  const url = parseUrl(content.text);
  if (!url) return null;

  let hostname = url;
  try {
    hostname = new URL(url).hostname;
  } catch {
    // fallback to full url
  }

  return {
    kind: "qr_code",
    version: 1,
    url,
    display: {
      typeLabel: "QR Code",
      headline: hostname,
    },
  };
}

/**
 * Decode and validate a payloadJson string. Returns null for bad/missing data.
 */
export function decodeQrPayload(
  payloadJson: string | null | undefined
): QrPayload | null {
  try {
    const p = JSON.parse(payloadJson ?? "{}") as { kind?: string };
    if (p.kind !== "qr_code") return null;
    return p as QrPayload;
  } catch {
    return null;
  }
}

/**
 * Build a detector artifact from an input object. Returns null if content is not a URL.
 */
export function buildQrArtifact(input: unknown): PluginDetectorArtifact | null {
  const payload = createQrPayload(input);
  if (!payload) return null;

  let hostname = payload.url;
  try {
    hostname = new URL(payload.url).hostname;
  } catch {
    // fallback
  }

  return {
    attachmentType: "plugin.preview.qr",
    attachmentKey: "primary",
    payloadJson: JSON.stringify(payload),
    searchProjection: {
      scope: "url",
      searchText: hostname,
      label: "QR Code",
    },
  };
}
