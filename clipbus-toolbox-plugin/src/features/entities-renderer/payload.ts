import { defineAttachment } from "@clipbus/plugin-sdk";

export interface EntitiesPayload {
  kind: "entities_preview";
  version: 1;
  emails: string[];
  ips: string[];
  totalCount: number;
}

export const ATTACHMENT_TYPE = "plugin.toolbox.entities";

const URL_RE = /\bhttps?:\/\/[^\s<>"'`)\]}]+/gi;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const IPV4_RE = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;

function dedupe(arr: string[]): string[] {
  return [...new Set(arr)];
}

function extractEntities(text: string): { emails: string[]; ips: string[] } {
  // URL cards belong to the Host, including addresses inside URL hosts/queries.
  const body = text.replace(URL_RE, " ");
  const emails = dedupe(body.match(EMAIL_RE) ?? []);
  const ips = dedupe(body.match(IPV4_RE) ?? []);
  return { emails, ips };
}

export function createEntitiesPayload(input: unknown): EntitiesPayload | null {
  const content = (input as { content?: { kind?: string; text?: string } } | null)?.content;
  if (content?.kind !== "text" || typeof content.text !== "string") return null;

  const { emails, ips } = extractEntities(content.text);
  const totalCount = emails.length + ips.length;

  if (totalCount < 2) return null;

  return {
    kind: "entities_preview",
    version: 1,
    emails,
    ips,
    totalCount,
  };
}

export function decodeEntitiesPayload(value: unknown): EntitiesPayload | null {
  try {
    const p = (typeof value === "string" ? JSON.parse(value) : value) as { kind?: string };
    if (!p || typeof p !== "object" || p.kind !== "entities_preview") return null;
    return p as EntitiesPayload;
  } catch {
    return null;
  }
}

export const attachment = defineAttachment<EntitiesPayload>(ATTACHMENT_TYPE);
