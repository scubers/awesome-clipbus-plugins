import type { PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";

export interface UrlPayload {
  kind: "url_parsed";
  version: 1;
  input: string;
  href: string;
  scheme: string;
  username: string;
  host: string;
  port: string;
  path: string;
  query: { key: string; value: string }[];
  hash: string;
  display: {
    typeLabel: string;
    headline: string;
    facts: { label: string; value: string }[];
  };
}

/**
 * Parse a trimmed string as a URL. Accepts only URLs with a scheme + '//' authority
 * (http, https, ftp, ws, wss, or any custom scheme with '//') and a non-empty hostname.
 * Rejects 'mailto:', 'tel:', bare 'a:b', and plain prose.
 */
export function parseUrl(text: string): URL | null {
  const s = text.trim();
  if (!s) return null;
  // Require scheme + '//' (authority-based URL)
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) return null;
  try {
    const u = new URL(s);
    if (!u.hostname) return null;
    return u;
  } catch {
    return null;
  }
}

/**
 * Build a complete UrlPayload from a detector input object.
 */
export function createUrlPayload(input: unknown): UrlPayload | null {
  const content = (
    input as { content?: { kind?: string; text?: string } } | null
  )?.content;
  if (content?.kind !== "text" || typeof content.text !== "string") return null;

  const text = content.text.trim();
  const u = parseUrl(text);
  if (!u) return null;

  const scheme = u.protocol.replace(/:$/, "");
  const host = u.hostname;
  const port = u.port;
  const path = u.pathname;
  const hash = u.hash;
  const username = u.username;
  const query = [...u.searchParams].map(([key, value]) => ({ key, value }));

  const facts: { label: string; value: string }[] = [
    { label: "Scheme", value: scheme },
    { label: "Host", value: host },
  ];
  if (port) facts.push({ label: "Port", value: port });
  facts.push({ label: "Path", value: path || "/" });
  if (hash) facts.push({ label: "Hash", value: hash });

  return {
    kind: "url_parsed",
    version: 1,
    input: text,
    href: u.href,
    scheme,
    username,
    host,
    port,
    path,
    query,
    hash,
    display: {
      typeLabel: "URL",
      headline: host,
      facts,
    },
  };
}

/**
 * Decode and validate a payloadJson string. Returns null for bad/missing data.
 */
export function decodeUrlPayload(
  payloadJson: string | null | undefined
): UrlPayload | null {
  try {
    const p = JSON.parse(payloadJson ?? "{}") as { kind?: string };
    if (p.kind !== "url_parsed") return null;
    return p as UrlPayload;
  } catch {
    return null;
  }
}

/**
 * Build a detector artifact from an input object. Returns null if content is not a URL.
 */
export function buildUrlArtifact(input: unknown): PluginDetectorArtifact | null {
  const payload = createUrlPayload(input);
  if (!payload) return null;
  return {
    attachmentType: "plugin.extractor.url",
    attachmentKey: "primary",
    payloadJson: JSON.stringify(payload),
    searchProjection: {
      scope: "url",
      searchText: payload.host,
      label: "URL",
    },
  };
}
