// payload.ts — UI-safe pure logic for the regex-tool draft action.
// NO node:* imports — this file is imported by both app.vue (browser) and action.ts (runtime).

export interface RegexDraft {
  pattern: string;
  flags: string;
  text: string;
}

export const INITIAL_DRAFT: RegexDraft = {
  pattern: "",
  flags: "g",
  text: "",
};

export interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
}

export interface RegexResult {
  ok: boolean;
  error?: string;
  matchCount: number;
  matches: RegexMatch[];
}

const MAX_MATCHES = 200;
const MAX_TEXT_LENGTH = 20000;

/**
 * Run a regex against text and return structured results.
 * Handles invalid patterns gracefully.
 * Caps at MAX_MATCHES matches and MAX_TEXT_LENGTH chars of input to avoid hangs.
 */
export function runRegex(pattern: string, flags: string, text: string): RegexResult {
  if (!pattern) {
    return { ok: true, matchCount: 0, matches: [] };
  }

  // Truncate very long input to avoid freezing the UI thread
  const input = text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text;

  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch (e) {
    return { ok: false, error: (e as Error).message, matchCount: 0, matches: [] };
  }

  const matches: RegexMatch[] = [];

  if (flags.includes("g") || flags.includes("y")) {
    for (const m of input.matchAll(re)) {
      // Capture groups: skip index 0 (full match), map undefined to ""
      const groups = m.slice(1).map((g) => (g !== undefined ? g : ""));
      matches.push({ match: m[0], index: m.index ?? 0, groups });
      if (matches.length >= MAX_MATCHES) break;
    }
  } else {
    const m = re.exec(input);
    if (m !== null) {
      const groups = m.slice(1).map((g) => (g !== undefined ? g : ""));
      matches.push({ match: m[0], index: m.index, groups });
    }
  }

  return { ok: true, matchCount: matches.length, matches };
}

/** Parse and validate a raw draft record; merges onto INITIAL_DRAFT as fallback. */
export function decodeRegexDraft(json: unknown): RegexDraft | null {
  try {
    const raw = typeof json === "string" ? JSON.parse(json) : json;
    if (raw === null || raw === undefined || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    return {
      pattern: typeof r["pattern"] === "string" ? r["pattern"] : INITIAL_DRAFT.pattern,
      flags: typeof r["flags"] === "string" ? r["flags"] : INITIAL_DRAFT.flags,
      text: typeof r["text"] === "string" ? r["text"] : INITIAL_DRAFT.text,
    };
  } catch {
    return null;
  }
}
