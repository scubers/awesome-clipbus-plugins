// payload.ts — UI-safe pure logic for the gen-tool draft action.
// NO node:* imports — this file is imported by both app.vue (browser) and action.ts (runtime).

export interface GenDraft {
  mode: "uuid" | "password";
  count: number;
  length: number;
  useUppercase: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
  result: string;
}

export const INITIAL_DRAFT: GenDraft = {
  mode: "uuid",
  count: 1,
  length: 16,
  useUppercase: true,
  useNumbers: true,
  useSymbols: true,
  result: "",
};

/** Charset for password generation. Lowercase is always included as the base. */
export function passwordCharset(d: Pick<GenDraft, "useUppercase" | "useNumbers" | "useSymbols">): string {
  let cs = "abcdefghijklmnopqrstuvwxyz";
  if (d.useUppercase) cs += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (d.useNumbers) cs += "0123456789";
  if (d.useSymbols) cs += "!@#$%^&*()-_=+[]{}";
  return cs;
}

/**
 * Build a password of the given length from the charset.
 * Caller supplies one random byte per character position.
 */
export function buildPassword(length: number, charset: string, randomBytes: number[] | Uint8Array): string {
  const arr = Array.from(randomBytes);
  return arr
    .slice(0, length)
    .map((b) => charset[b % charset.length])
    .join("");
}

/** Join an array of UUID strings with newlines. */
export function formatUuids(uuids: string[]): string {
  return uuids.join("\n");
}

/**
 * Construct a UUID v4 string from 16 raw bytes.
 * Sets the version nibble to 4 and the variant bits to 10xx.
 * Pure function — the caller supplies the random bytes (testable, works in any env).
 */
export function uuidFromBytes(bytes: number[] | Uint8Array): string {
  const b = Array.from(bytes);
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant 10xx
  const hex = b.map((n) => n.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/** Parse and validate a raw draft record; merges onto INITIAL_DRAFT as fallback. */
export function decodeGenDraft(json: unknown): GenDraft | null {
  try {
    const raw = typeof json === "string" ? JSON.parse(json) : json;
    if (raw === null || raw === undefined || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    return {
      mode: r["mode"] === "password" ? "password" : "uuid",
      count: typeof r["count"] === "number" ? Math.max(1, Math.min(20, r["count"])) : INITIAL_DRAFT.count,
      length: typeof r["length"] === "number" ? Math.max(8, Math.min(64, r["length"])) : INITIAL_DRAFT.length,
      useUppercase: typeof r["useUppercase"] === "boolean" ? r["useUppercase"] : INITIAL_DRAFT.useUppercase,
      useNumbers: typeof r["useNumbers"] === "boolean" ? r["useNumbers"] : INITIAL_DRAFT.useNumbers,
      useSymbols: typeof r["useSymbols"] === "boolean" ? r["useSymbols"] : INITIAL_DRAFT.useSymbols,
      result: typeof r["result"] === "string" ? r["result"] : "",
    };
  } catch {
    return null;
  }
}
