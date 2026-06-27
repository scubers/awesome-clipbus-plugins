// payload.ts — UI-safe single source of truth for the SQL formatter attachment.
// NO `import … from "node:*"` here: this file is imported by app.vue (browser) too.

import type { PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";

const ATTACHMENT_TYPE = "plugin.formatter.sql";

export interface SqlPayload {
  kind: "sql_preview";
  version: 1;
  statementType: string;
  formatted: string;
  original: string;
}

// Statement-start patterns (case-insensitive). Order matters: more specific first.
const STATEMENT_PATTERNS: Array<{ type: string; re: RegExp }> = [
  { type: "SELECT", re: /^SELECT\b/i },
  { type: "INSERT", re: /^INSERT\s+INTO\b/i },
  { type: "UPDATE", re: /^UPDATE\b/i },
  { type: "DELETE", re: /^DELETE\s+FROM\b/i },
  { type: "CREATE", re: /^CREATE\s+(TABLE|VIEW|INDEX|DATABASE)\b/i },
  { type: "ALTER", re: /^ALTER\b/i },
  { type: "DROP", re: /^DROP\b/i },
  { type: "WITH", re: /^WITH\b/i },
];

// Extra SQL signals required to prevent false-positive matches on prose.
// At least one of: semicolon, asterisk, equals sign, open-paren, or a second-clause keyword.
const SECOND_CLAUSE_RE =
  /\b(WHERE|JOIN|LEFT\s+JOIN|INNER\s+JOIN|GROUP\s+BY|ORDER\s+BY|VALUES|SET|HAVING|LIMIT)\b/i;
const SIGNAL_RE = /[;*=(]/;

function hasSqlSignal(text: string): boolean {
  return SIGNAL_RE.test(text) || SECOND_CLAUSE_RE.test(text);
}

function detectStatementType(trimmed: string): string | null {
  for (const { type, re } of STATEMENT_PATTERNS) {
    if (re.test(trimmed)) return type;
  }
  return null;
}

// ── Lightweight SQL formatter ────────────────────────────────────────────────

// Major clause keywords that should be placed on their own line.
const CLAUSE_RE =
  /\b(SELECT|FROM|WHERE|AND|OR|JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|INNER\s+JOIN|OUTER\s+JOIN|FULL\s+OUTER\s+JOIN|CROSS\s+JOIN|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|UNION\s+ALL|UNION|INTERSECT|EXCEPT|INSERT\s+INTO|VALUES|UPDATE|SET|DELETE\s+FROM|ON|INTO)\b/gi;

export function formatSql(sql: string): string {
  // Collapse whitespace.
  const flat = sql.replace(/\s+/g, " ").trim();

  // Split on clause keywords while keeping the delimiter.
  const parts = flat.split(CLAUSE_RE);
  const lines: string[] = [];

  // The regex uses capturing groups, so parts interleave: [before, kw, before, kw, ...].
  // Reconstruct: the first part is preamble (should be empty or the keyword itself at idx 0).
  let i = 0;
  // When split by a capturing regex the array is: [pre, match1, between, match2, ...]
  // parts[0] is the text before the first match (empty if text starts with keyword).
  if (parts[0].trim()) {
    lines.push(parts[0].trim());
  }

  for (i = 1; i < parts.length; i += 2) {
    const keyword = parts[i]?.replace(/\s+/g, " ").toUpperCase();
    const body = parts[i + 1]?.trim() ?? "";
    if (!keyword) continue;
    const line = body ? `${keyword} ${body}` : keyword;
    lines.push(line);
  }

  return lines.join("\n").trim();
}

// ── Public API ───────────────────────────────────────────────────────────────

export function createSqlPayload(input: unknown): SqlPayload | null {
  const content = (input as { content?: { kind?: string; text?: string } } | null)?.content;
  if (content?.kind !== "text" || typeof content.text !== "string") return null;

  const trimmed = content.text.trim();
  if (!trimmed) return null;

  const statementType = detectStatementType(trimmed);
  if (!statementType) return null;

  // Guard against English prose that happens to start with "select", "update", etc.
  if (!hasSqlSignal(trimmed)) return null;

  const formatted = formatSql(trimmed);

  return {
    kind: "sql_preview",
    version: 1,
    statementType,
    formatted,
    original: trimmed,
  };
}

export function decodeSqlPayload(payloadJson: string | null | undefined): SqlPayload | null {
  try {
    const parsed = JSON.parse(payloadJson ?? "{}") as { kind?: string };
    if (parsed.kind !== "sql_preview") return null;
    return parsed as SqlPayload;
  } catch {
    return null;
  }
}

export function buildSqlArtifact(input: unknown): PluginDetectorArtifact | null {
  const payload = createSqlPayload(input);
  if (!payload) return null;
  return {
    attachmentType: ATTACHMENT_TYPE,
    attachmentKey: "primary",
    payloadJson: JSON.stringify(payload),
    searchProjection: {
      scope: "sql",
      searchText: payload.original.slice(0, 200),
      label: "SQL",
    },
  };
}
