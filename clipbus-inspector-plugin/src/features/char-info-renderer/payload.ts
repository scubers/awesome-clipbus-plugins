// UI-safe: no node:* imports.
// Imported by both the runtime and the browser UI (app.vue).

import type { PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";

export const ATTACHMENT_TYPE = "plugin.inspector.char-info" as const;

export interface CharInfoPayload {
  kind: "char_info";
  version: 1;
  glyph: string;
  codePoints: string[];
  primaryDecimal: number;
  utf8: string;
  utf16: string;
  htmlEntity: string;
  category: string;
  isInvisible: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns grapheme clusters for the given text.
 * Uses Intl.Segmenter (ES2022 global) with a fallback that treats each
 * Unicode code point as a grapheme cluster (safe for single-codepoint inputs).
 */
function getGraphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter !== "undefined") {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return [...segmenter.segment(text)].map((s) => s.segment);
  }
  // Fallback: treat each Unicode code point as a grapheme cluster.
  return [...text];
}

function formatCodePoints(glyph: string): string[] {
  return [...glyph].map((ch) => {
    const cp = ch.codePointAt(0) ?? 0;
    const hex = cp.toString(16).toUpperCase().padStart(4, "0");
    return `U+${hex}`;
  });
}

function toUtf8Hex(glyph: string): string {
  const bytes = new TextEncoder().encode(glyph);
  return Array.from(bytes, (b) =>
    b.toString(16).toUpperCase().padStart(2, "0")
  ).join(" ");
}

function toUtf16Hex(glyph: string): string {
  const units: string[] = [];
  for (let i = 0; i < glyph.length; i++) {
    units.push(
      glyph.charCodeAt(i).toString(16).toUpperCase().padStart(4, "0")
    );
  }
  return units.join(" ");
}

// Small set of named HTML entities for common characters.
const NAMED_ENTITIES: Record<number, string> = {
  0x26: "&amp;",
  0x3c: "&lt;",
  0x3e: "&gt;",
  0x22: "&quot;",
  0x27: "&apos;",
  0xa0: "&nbsp;",
  0xa9: "&copy;",
  0xae: "&reg;",
  0x20ac: "&euro;",
  0x2122: "&trade;",
};

function toHtmlEntity(glyph: string): string {
  const cps = [...glyph];
  const numericParts = cps.map((ch) => {
    const cp = ch.codePointAt(0) ?? 0;
    return `&#x${cp.toString(16).toUpperCase()};`;
  });
  const numeric = numericParts.join("");

  // For a single code point, also show the named entity when available.
  if (cps.length === 1) {
    const cp = cps[0].codePointAt(0) ?? 0;
    const named = NAMED_ENTITIES[cp];
    if (named) return `${numeric} (${named})`;
  }
  return numeric;
}

function classifyCodePoint(cp: number): string {
  const ch = String.fromCodePoint(cp);
  if (/\p{Extended_Pictographic}/u.test(ch)) return "Emoji";
  if (/\p{Lu}/u.test(ch)) return "Uppercase Letter";
  if (/\p{Ll}/u.test(ch)) return "Lowercase Letter";
  if (/\p{L}/u.test(ch)) return "Letter";
  if (/\p{N}/u.test(ch)) return "Number";
  if (/\p{P}/u.test(ch)) return "Punctuation";
  if (/\p{S}/u.test(ch)) return "Symbol";
  if (/\p{M}/u.test(ch)) return "Mark";
  if (/\p{Z}/u.test(ch)) return "Separator";
  if (/\p{C}/u.test(ch)) return "Other/Control";
  return "Other";
}

function isGlyphInvisible(glyph: string): boolean {
  // Invisible only when EVERY code point is a separator / control / format char.
  // Testing "contains" would wrongly flag visible ZWJ emoji (e.g. "👩‍💻",
  // "👨‍👩‍👧") whose joiner U+200D is \p{Cf} as invisible.
  // \p{Z} = separators, \p{Cc} = control, \p{Cf} = format (ZWJ/ZWNJ/ZWSP/BOM).
  return [...glyph].every(
    (ch) => /\p{Z}/u.test(ch) || /\p{Cc}/u.test(ch) || /\p{Cf}/u.test(ch)
  );
}

/** Resolves a trimmed text string to a display glyph, or null if it should not fire. */
function resolveGlyphFromText(raw: string): string | null {
  if (raw.length === 0) return null;

  // Path (b): explicit U+ code point notation — fires even for ASCII.
  const uPlusMatch = /^U\+([0-9A-Fa-f]{1,6})$/i.exec(raw);
  if (uPlusMatch) {
    const cp = parseInt(uPlusMatch[1], 16);
    // Reject out-of-range and lone surrogate code points.
    if (cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) return null;
    return String.fromCodePoint(cp);
  }

  // Path (a): exactly one grapheme cluster containing at least one non-ASCII code point.
  const graphemes = getGraphemes(raw);
  if (graphemes.length !== 1) return null;
  const glyph = graphemes[0];
  const hasNonAscii = [...glyph].some((ch) => (ch.codePointAt(0) ?? 0) > 0x7f);
  return hasNonAscii ? glyph : null;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function createCharPayload(input: unknown): CharInfoPayload | null {
  const content = (
    input as { content?: { kind?: string; text?: string } } | null
  )?.content;
  if (content?.kind !== "text" || typeof content.text !== "string") return null;

  const glyph = resolveGlyphFromText(content.text.trim());
  if (!glyph) return null;

  const codePoints = formatCodePoints(glyph);
  const primaryCp = [...glyph][0].codePointAt(0) ?? 0;

  return {
    kind: "char_info",
    version: 1,
    glyph,
    codePoints,
    primaryDecimal: primaryCp,
    utf8: toUtf8Hex(glyph),
    utf16: toUtf16Hex(glyph),
    htmlEntity: toHtmlEntity(glyph),
    category: classifyCodePoint(primaryCp),
    isInvisible: isGlyphInvisible(glyph),
  };
}

export function decodeCharPayload(
  payloadJson: string | null | undefined
): CharInfoPayload | null {
  try {
    const p = JSON.parse(payloadJson ?? "{}") as { kind?: string };
    if (p.kind !== "char_info") return null;
    return p as CharInfoPayload;
  } catch {
    return null;
  }
}

export function buildCharArtifact(
  input: unknown
): PluginDetectorArtifact | null {
  const payload = createCharPayload(input);
  if (!payload) return null;

  return {
    attachmentType: ATTACHMENT_TYPE,
    attachmentKey: "primary",
    payloadJson: JSON.stringify(payload),
    searchProjection: {
      scope: "inspector",
      searchText: `${payload.codePoints.join(" ")} ${payload.category}`,
      label: "Character",
    },
  };
}
