/**
 * Pure string transform helpers — no external dependencies.
 */

/** Sort lines alphabetically/numerically (case-insensitive, natural order). */
export function sortLines(text: string): string {
  const lines = text.split(/\r?\n/);
  lines.sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base", numeric: true })
  );
  return lines.join("\n");
}

/** Remove duplicate lines, preserving first occurrence and original order. */
export function dedupLines(text: string): string {
  const lines = text.split(/\r?\n/);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    if (!seen.has(line)) {
      seen.add(line);
      result.push(line);
    }
  }
  return result.join("\n");
}

/**
 * Strip ANSI escape sequences from a string.
 * Covers CSI (SGR colors, cursor moves, etc.), OSC, and other single-char escapes.
 */
export function stripAnsi(text: string): string {
  const ESC = "\x1b";
  // OSC: ESC ] ... terminated by BEL or ST (ESC \) — match first (longest)
  const oscRe = new RegExp(`${ESC}\\][^]*?(?:\\x07|${ESC}\\\\)`, "g");
  // CSI: ESC [ <param bytes> <intermediate bytes> <final byte>
  const csiRe = new RegExp(`${ESC}\\[[0-9;?]*[ -/]*[@-~]`, "g");
  // Other single-char escapes: ESC followed by one char in range @-Z or \-_
  const otherRe = new RegExp(`${ESC}[@-Z\\\\-_]`, "g");
  return text.replace(oscRe, "").replace(csiRe, "").replace(otherRe, "");
}

/**
 * Tidy whitespace:
 *  - trim trailing spaces on each line
 *  - trim leading/trailing blank lines overall
 *  - collapse runs of 2+ consecutive blank lines into a single blank line
 */
export function tidyWhitespace(text: string): string {
  const lines = text.split(/\r?\n/);

  // trim leading and trailing spaces per line
  const trimmed = lines.map((l) => l.trim());

  // collapse runs of 2+ blank lines into one
  const collapsed: string[] = [];
  let blanks = 0;
  for (const line of trimmed) {
    if (line === "") {
      blanks++;
      if (blanks <= 1) collapsed.push(line);
    } else {
      blanks = 0;
      collapsed.push(line);
    }
  }

  // trim leading/trailing blank lines
  let start = 0;
  while (start < collapsed.length && collapsed[start] === "") start++;
  let end = collapsed.length - 1;
  while (end >= 0 && collapsed[end] === "") end--;

  return collapsed.slice(start, end + 1).join("\n");
}
