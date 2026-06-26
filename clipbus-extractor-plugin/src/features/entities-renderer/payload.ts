import type { PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";

export interface EntitiesPayload {
  kind: "entities_preview";
  version: 1;
  urls: string[];
  emails: string[];
  ips: string[];
  totalCount: number;
}

const ATTACHMENT_TYPE = "plugin.extractor.entities";

const URL_RE = /\bhttps?:\/\/[^\s<>"'`)\]}]+/gi;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const IPV4_RE = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;
const TRAILING_PUNCT_RE = /[.,;:!?]+$/;

function dedupe(arr: string[]): string[] {
  return [...new Set(arr)];
}

function extractEntities(text: string): { urls: string[]; emails: string[]; ips: string[] } {
  const rawUrls = (text.match(URL_RE) ?? []).map((u) => u.replace(TRAILING_PUNCT_RE, ""));
  const urls = dedupe(rawUrls);

  const emails = dedupe(text.match(EMAIL_RE) ?? []);

  const rawIps = text.match(IPV4_RE) ?? [];
  const allIps = dedupe(rawIps);
  // Remove IPs that are substrings of any extracted URL (e.g. host IP in URL)
  const ips = allIps.filter((ip) => !urls.some((u) => u.includes(ip)));

  return { urls, emails, ips };
}

export function createEntitiesPayload(input: unknown): EntitiesPayload | null {
  const content = (input as { content?: { kind?: string; text?: string } } | null)?.content;
  if (content?.kind !== "text" || typeof content.text !== "string") return null;

  const { urls, emails, ips } = extractEntities(content.text);
  const totalCount = urls.length + emails.length + ips.length;

  if (totalCount < 2) return null;

  return {
    kind: "entities_preview",
    version: 1,
    urls,
    emails,
    ips,
    totalCount,
  };
}

export function decodeEntitiesPayload(payloadJson: string | null | undefined): EntitiesPayload | null {
  try {
    const p = JSON.parse(payloadJson ?? "{}") as { kind?: string };
    if (p.kind !== "entities_preview") return null;
    return p as EntitiesPayload;
  } catch {
    return null;
  }
}

export function buildEntitiesArtifact(input: unknown): PluginDetectorArtifact | null {
  const payload = createEntitiesPayload(input);
  if (!payload) return null;
  const allTerms = [...payload.urls, ...payload.emails, ...payload.ips];
  return {
    attachmentType: ATTACHMENT_TYPE,
    attachmentKey: "primary",
    payloadJson: JSON.stringify(payload),
    searchProjection: {
      scope: "extractor",
      searchText: allTerms.join(" ").slice(0, 200),
      label: "提取结果",
    },
  };
}
