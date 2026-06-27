// payload.ts — UI-safe pure logic for the case-tool draft action.
// NO node:* imports — this file is imported by both app.vue (browser) and action.ts (runtime).

export interface CaseDraft {
  input: string;
}

export const INITIAL_DRAFT: CaseDraft = {
  input: "",
};

/**
 * Split a string into lowercase words by:
 *   - whitespace, underscore, hyphen, slash, dot boundaries
 *   - camelCase / PascalCase transitions (uppercase following lowercase)
 */
export function splitWords(s: string): string[] {
  // Insert a space before uppercase letters that follow a lowercase letter (camelCase split)
  const spaced = s.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced
    .split(/[\s_\-/.]+/)
    .map((w) => w.toLowerCase())
    .filter((w) => w.length > 0);
}

/** helloWorldFooBar */
export function toCamel(s: string): string {
  const words = splitWords(s);
  return words
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}

/** HelloWorldFooBar */
export function toPascal(s: string): string {
  return splitWords(s)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

/** hello_world_foo_bar */
export function toSnake(s: string): string {
  return splitWords(s).join("_");
}

/** HELLO_WORLD_FOO_BAR */
export function toConstant(s: string): string {
  return splitWords(s).join("_").toUpperCase();
}

/** hello-world-foo-bar */
export function toKebab(s: string): string {
  return splitWords(s).join("-");
}

/** Hello World Foo Bar */
export function toTitle(s: string): string {
  return splitWords(s)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Hello world foo bar (only first word capitalised) */
export function toSentence(s: string): string {
  const words = splitWords(s);
  if (words.length === 0) return "";
  return [words[0].charAt(0).toUpperCase() + words[0].slice(1), ...words.slice(1)].join(" ");
}

/** hello.world.foo.bar */
export function toDot(s: string): string {
  return splitWords(s).join(".");
}

export interface CaseVariant {
  label: string;
  value: string;
}

/** Produce all eight case variants for the given input. */
export function buildAllCases(input: string): CaseVariant[] {
  return [
    { label: "camelCase", value: toCamel(input) },
    { label: "PascalCase", value: toPascal(input) },
    { label: "snake_case", value: toSnake(input) },
    { label: "CONSTANT_CASE", value: toConstant(input) },
    { label: "kebab-case", value: toKebab(input) },
    { label: "Title Case", value: toTitle(input) },
    { label: "Sentence case", value: toSentence(input) },
    { label: "dot.case", value: toDot(input) },
  ];
}

/** Parse and validate a raw draft record; falls back to INITIAL_DRAFT fields. */
export function decodeCaseDraft(json: unknown): CaseDraft | null {
  try {
    const raw = typeof json === "string" ? JSON.parse(json) : json;
    if (raw === null || raw === undefined || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    return {
      input: typeof r["input"] === "string" ? r["input"] : INITIAL_DRAFT.input,
    };
  } catch {
    return null;
  }
}
