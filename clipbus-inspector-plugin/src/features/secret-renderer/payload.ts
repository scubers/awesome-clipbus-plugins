// UI-safe: no node:* imports. Pure regex-based secret detection.
// Imported by both the runtime (detector.ts) and the browser UI (app.vue).

import type { PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";

const ATTACHMENT_TYPE = "plugin.inspector.secret";

export interface SecretMatch {
  type: string;
  label: string;
  masked: string;
  confidence: "high" | "medium";
}

export interface SecretPayload {
  kind: "secret_scan";
  version: 1;
  matches: SecretMatch[];
  display: { headline: string };
}

/** Reveal at most first-3 and last-3 chars; replace middle with U+2022 bullets. */
function maskSecret(value: string): string {
  const chars = Array.from(value);
  const len = chars.length;
  if (len <= 6) return "•".repeat(len);
  if (len <= 9) {
    return chars.slice(0, 2).join("") + "•".repeat(len - 4) + chars.slice(-2).join("");
  }
  return chars.slice(0, 3).join("") + "•".repeat(len - 6) + chars.slice(-3).join("");
}

interface PatternDef {
  type: string;
  label: string;
  confidence: "high" | "medium";
  regex: RegExp;
  /** When true the matched value IS the label (PEM header line) — store as-is. */
  isPem?: boolean;
}

/**
 * High-confidence patterns first; generic assignment runs only when none match.
 * One match per type (first hit wins); same type never reported twice.
 */
const SPECIFIC_PATTERNS: PatternDef[] = [
  {
    type: "aws-access-key",
    label: "AWS Access Key ID",
    confidence: "high",
    regex: /\b(AKIA|ASIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA)[0-9A-Z]{16}\b/,
  },
  {
    type: "github-token",
    label: "GitHub Token",
    confidence: "high",
    regex: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/,
  },
  {
    type: "github-pat",
    label: "GitHub Fine-grained Token",
    confidence: "high",
    regex: /\bgithub_pat_[A-Za-z0-9_]{82}\b/,
  },
  {
    type: "google-api-key",
    label: "Google API Key",
    confidence: "high",
    regex: /\bAIza[0-9A-Za-z\-_]{35}\b/,
  },
  {
    type: "slack-token",
    label: "Slack Token",
    confidence: "high",
    regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}/,
  },
  {
    type: "slack-webhook",
    label: "Slack Webhook URL",
    confidence: "high",
    regex: /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9/]+/,
  },
  {
    type: "stripe-key",
    label: "Stripe Live Key",
    confidence: "high",
    regex: /\b(sk|rk)_live_[0-9A-Za-z]{24,}\b/,
  },
  {
    type: "anthropic-key",
    label: "Anthropic API Key",
    confidence: "high",
    regex: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/,
  },
  {
    type: "openai-key",
    label: "OpenAI API Key",
    confidence: "medium",
    // Negative lookahead excludes Anthropic keys (sk-ant-) from this pattern.
    regex: /\bsk-(?!ant-)(proj-)?[A-Za-z0-9_-]{20,}\b/,
  },
  {
    type: "sendgrid-key",
    label: "SendGrid API Key",
    confidence: "high",
    regex: /\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}\b/,
  },
  {
    type: "npm-token",
    label: "npm Token",
    confidence: "high",
    regex: /\bnpm_[A-Za-z0-9]{36}\b/,
  },
  {
    type: "twilio-sid",
    label: "Twilio Account SID",
    confidence: "medium",
    regex: /\bAC[0-9a-fA-F]{32}\b/,
  },
  {
    type: "pem-key",
    label: "Private Key (PEM)",
    confidence: "high",
    // Match only the BEGIN header line — never capture the key body.
    regex: /-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/,
    isPem: true,
  },
];

/** Generic assignment pattern — run only when no specific pattern matched. */
const GENERIC_RE =
  /(api[_-]?key|secret|token|password|passwd|pwd|access[_-]?key|auth)\s*[:=]\s*['"]?([A-Za-z0-9_\-/+]{12,})/i;

export function scanSecrets(text: string): SecretMatch[] {
  const matches: SecretMatch[] = [];
  const seenTypes = new Set<string>();

  for (const pat of SPECIFIC_PATTERNS) {
    if (seenTypes.has(pat.type)) continue;
    const m = text.match(pat.regex);
    if (!m) continue;
    seenTypes.add(pat.type);

    // PEM: the matched text IS just the header line — safe to store as-is (no key body).
    const masked = pat.isPem ? m[0] : maskSecret(m[0]);
    matches.push({ type: pat.type, label: pat.label, masked, confidence: pat.confidence });
  }

  // Generic assignment — only when no specific pattern already fired.
  if (matches.length === 0) {
    const gm = text.match(GENERIC_RE);
    if (gm) {
      const valueStr = gm[2];
      // Do not flag JWTs (decoder plugin owns them).
      if (!valueStr.startsWith("eyJ")) {
        matches.push({
          type: "generic-secret",
          label: "Possible secret assignment",
          masked: maskSecret(valueStr),
          confidence: "medium",
        });
      }
    }
  }

  return matches;
}

export function createSecretPayload(input: unknown): SecretPayload | null {
  const content = (input as { content?: { kind?: string; text?: string } } | null)?.content;
  if (content?.kind !== "text" || typeof content.text !== "string") return null;

  const matches = scanSecrets(content.text);
  if (matches.length === 0) return null;

  const headline =
    matches.length === 1
      ? `${matches[0].label} detected`
      : `${matches.length} sensitive credentials detected`;

  return { kind: "secret_scan", version: 1, matches, display: { headline } };
}

export function decodeSecretPayload(payloadJson: string | null | undefined): SecretPayload | null {
  try {
    const p = JSON.parse(payloadJson ?? "{}") as { kind?: string };
    if (p.kind !== "secret_scan") return null;
    return p as SecretPayload;
  } catch {
    return null;
  }
}

export function buildSecretArtifact(input: unknown): PluginDetectorArtifact | null {
  const payload = createSecretPayload(input);
  if (!payload) return null;
  return {
    attachmentType: ATTACHMENT_TYPE,
    attachmentKey: "primary",
    payloadJson: JSON.stringify(payload),
    // NO searchProjection — secrets must never be indexed into search.
  };
}
