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
