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
  cleanHref: string;
  trackingParams: { key: string; value: string }[];
  display: {
    typeLabel: string;
    headline: string;
    facts: { label: string; value: string }[];
  };
}

const CONTROL_RE = /\p{C}/u;

/** Known tracking query parameter keys (exact match, lowercased). */
const TRACKING_EXACT = new Set([
  "fbclid",
  "fb_action_ids",
  "fb_action_types",
  "fb_source",
  "fb_ref",
  "gclid",
  "gclsrc",
  "dclid",
  "gbraid",
  "wbraid",
  "gad_source",
  "msclkid",
  "mc_cid",
  "mc_eid",
  "_hsenc",
  "_hsmi",
  "__hssc",
  "__hstc",
  "__hsfp",
  "igshid",
  "igsh",
  "yclid",
  "_openstat",
  "vero_id",
  "vero_conv",
  "oly_anon_id",
  "oly_enc_id",
  "wickedid",
  "twclid",
  "ttclid",
  "scid",
  "mkt_tok",
  "_branch_match_id",
  "s_cid",
  "ncid",
  "cmpid",
  "spm",
]);

function isTracking(key: string): boolean {
  const lower = key.toLowerCase();
  return lower.startsWith("utm_") || TRACKING_EXACT.has(lower);
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

function decodeQueryPart(raw: string): string {
  try {
    const decoded = decodeURIComponent(raw.replace(/\+/g, " "));
    return isReadableText(decoded) ? decoded : raw;
  } catch {
    return raw;
  }
}

function parseReadableQuery(search: string): { key: string; value: string }[] {
  const rawQuery = search.startsWith("?") ? search.slice(1) : search;
  if (!rawQuery) return [];

  return rawQuery
    .split("&")
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      const separator = segment.indexOf("=");
      const rawKey = separator === -1 ? segment : segment.slice(0, separator);
      const rawValue = separator === -1 ? "" : segment.slice(separator + 1);
      return {
        key: decodeQueryPart(rawKey),
        value: decodeQueryPart(rawValue),
      };
    });
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
  const query = parseReadableQuery(u.search);

  const trackingParams = query.filter((q) => isTracking(q.key));
  let cleanHref: string;
  if (trackingParams.length > 0) {
    const cu = new URL(u.href);
    for (const { key } of trackingParams) cu.searchParams.delete(key);
    cleanHref = cu.href;
  } else {
    cleanHref = u.href;
  }

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
    cleanHref,
    trackingParams,
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
    const withDefaults: unknown = {
      trackingParams: [],
      cleanHref: (p as { href?: string }).href ?? "",
      ...(p as object),
    };
    return withDefaults as UrlPayload;
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
