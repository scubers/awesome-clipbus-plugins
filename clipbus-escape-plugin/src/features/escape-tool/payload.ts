// payload.ts — UI-safe pure logic for the escape-tool draft action.
// NO node:* imports — this file is imported by both app.vue (browser) and action.ts (runtime).

export type EscapeMode = "url" | "html" | "base64" | "unicode" | "json";

export interface EscapeDraft {
  mode: EscapeMode;
  input: string;
}

export const INITIAL_DRAFT: EscapeDraft = {
  mode: "url",
  input: "",
};

/** Decode and validate a raw draft record; falls back to INITIAL_DRAFT fields. */
export function decodeEscapeDraft(json: unknown): EscapeDraft | null {
  try {
    const raw = typeof json === "string" ? JSON.parse(json) : json;
    if (raw === null || raw === undefined || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    const validModes: EscapeMode[] = ["url", "html", "base64", "unicode", "json"];
    return {
      mode: validModes.includes(r["mode"] as EscapeMode) ? (r["mode"] as EscapeMode) : INITIAL_DRAFT.mode,
      input: typeof r["input"] === "string" ? r["input"] : INITIAL_DRAFT.input,
    };
  } catch {
    return null;
  }
}

// ── URL ──────────────────────────────────────────────────────────────────────

export function urlEncode(s: string): string {
  return encodeURIComponent(s);
}

export function urlDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

// ── HTML ─────────────────────────────────────────────────────────────────────

const HTML_ENCODE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const HTML_DECODE_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

export function htmlEncode(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => HTML_ENCODE_MAP[ch] ?? ch);
}

export function htmlDecode(s: string): string {
  return s.replace(
    /&(?:#(\d+)|#x([0-9a-fA-F]+)|([a-zA-Z]+));/g,
    (match, dec, hex, named) => {
      if (named) return HTML_DECODE_MAP[`&${named};`] ?? match;
      if (dec) return String.fromCodePoint(parseInt(dec, 10));
      if (hex) return String.fromCodePoint(parseInt(hex, 16));
      return match;
    }
  );
}

// ── Base64 ───────────────────────────────────────────────────────────────────

/** UTF-8–safe base64 encode. Uses TextEncoder so multi-byte chars are handled correctly. */
export function base64Encode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** UTF-8–safe base64 decode. Returns an error placeholder on invalid input. */
export function base64Decode(s: string): string {
  try {
    const binary = atob(s);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return "[无效 Base64]";
  }
}

// ── Unicode escape ────────────────────────────────────────────────────────────

/** Encode every code point in s as \uXXXX (BMP) or surrogate pair \uXXXX\uXXXX. */
export function unicodeEncode(s: string): string {
  const result: string[] = [];
  for (const char of s) {
    const cp = char.codePointAt(0) ?? 0;
    if (cp > 0xffff) {
      // Supplementary plane: encode as surrogate pair
      const high = 0xd800 + ((cp - 0x10000) >> 10);
      const low = 0xdc00 + ((cp - 0x10000) & 0x3ff);
      result.push(`\\u${high.toString(16).toUpperCase().padStart(4, "0")}`);
      result.push(`\\u${low.toString(16).toUpperCase().padStart(4, "0")}`);
    } else {
      result.push(`\\u${cp.toString(16).toUpperCase().padStart(4, "0")}`);
    }
  }
  return result.join("");
}

/** Decode \uXXXX escape sequences back to characters. */
export function unicodeDecode(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}

// ── JSON string escape ────────────────────────────────────────────────────────

/** Escape s as a JSON string value (without surrounding quotes). */
export function jsonEncode(s: string): string {
  // JSON.stringify wraps in quotes; strip them to expose the escape sequences only.
  return JSON.stringify(s).slice(1, -1);
}

/** Unescape a JSON-escaped string value (input must not include surrounding quotes). */
export function jsonDecode(s: string): string {
  try {
    return JSON.parse(`"${s}"`);
  } catch {
    return "[无效 JSON 转义]";
  }
}

// ── Unified transform ─────────────────────────────────────────────────────────

/** Return both the encoded and decoded form of input under the given mode. */
export function transform(
  mode: EscapeMode,
  input: string
): { encoded: string; decoded: string } {
  switch (mode) {
    case "url":
      return { encoded: urlEncode(input), decoded: urlDecode(input) };
    case "html":
      return { encoded: htmlEncode(input), decoded: htmlDecode(input) };
    case "base64":
      return { encoded: base64Encode(input), decoded: base64Decode(input) };
    case "unicode":
      return { encoded: unicodeEncode(input), decoded: unicodeDecode(input) };
    case "json":
      return { encoded: jsonEncode(input), decoded: jsonDecode(input) };
  }
}
