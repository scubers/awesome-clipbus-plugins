// UI-safe: no node:* imports — this file is imported by both app.vue (browser) and runtime.
import { defineAttachment } from "@clipbus/plugin-sdk";

export interface CsvPayload {
  kind: "csv_table";
  version: 1;
  delimiter: string;
  headers: string[];
  rows: string[][];
  rowCount: number;
  colCount: number;
  display: {
    typeLabel: string;
    headline: string;
    facts: { label: string; value: string }[];
  };
}

const ATTACHMENT_TYPE = "plugin.awesome.toolbox.csv";

// Map raw delimiter char to a human-readable label.
function delimiterLabel(delim: string): string {
  if (delim === ",") return "comma";
  if (delim === "\t") return "tab";
  if (delim === ";") return "semicolon";
  return delim;
}

interface ParseResult {
  delimiter: string;
  headers: string[];
  rows: string[][];
}

/** Parse complete records, including escaped quotes, multiline cells and trailing empty cells. */
function parseRecords(text: string, delimiter: string): string[][] | null {
  const records: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let closedQuote = false;
  const finishField = () => {
    row.push(closedQuote ? field : field.trim());
    field = "";
    closedQuote = false;
  };
  const finishRecord = () => {
    finishField();
    if (row.length > 1 || row[0] !== "") records.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { quoted = false; closedQuote = true; }
      } else {
        field += char;
      }
    } else if (char === delimiter) {
      finishField();
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      finishRecord();
    } else if (closedQuote) {
      return null;
    } else if (char === '"') {
      if (field !== "") return null;
      quoted = true;
    } else {
      field += char;
    }
  }
  if (quoted) return null;
  if (field !== "" || row.length > 0 || closedQuote) finishRecord();
  return records;
}

/** Require a header, at least one data row, and consistent columns in every record. */
export function parseCsv(text: string): ParseResult | null {
  const source = text.replace(/^\uFEFF/, "");
  for (const delimiter of ["\t", ",", ";"]) {
    const records = parseRecords(source, delimiter);
    if (!records || records.length < 2) continue;
    const headers = records[0];
    if (headers.length < 2 || records.some(row => row.length !== headers.length)) continue;
    return { delimiter, headers, rows: records.slice(1) };
  }
  return null;
}

export function createCsvPayload(input: unknown): CsvPayload | null {
  const content = (
    input as { content?: { kind?: string; text?: string } } | null
  )?.content;
  if (content?.kind !== "text" || typeof content.text !== "string") return null;

  const parsed = parseCsv(content.text);
  if (!parsed) return null;

  const { delimiter, headers, rows } = parsed;
  // Comma-space prose is ambiguous; only quoted records opt in to that form.
  const firstLine = content.text.split(/\r?\n/).find(line => line.trim()) ?? "";
  if (delimiter === "," && /,\s/.test(firstLine) && !firstLine.includes('"')) return null;
  const rowCount = rows.length;
  const colCount = headers.length;
  const headline = `${colCount} columns × ${rowCount} rows`;

  return {
    kind: "csv_table",
    version: 1,
    delimiter,
    headers,
    rows,
    rowCount,
    colCount,
    display: {
      typeLabel: "CSV Table",
      headline,
      facts: [
        { label: "Rows", value: String(rowCount) },
        { label: "Columns", value: String(colCount) },
        { label: "Delimiter", value: delimiterLabel(delimiter) },
      ],
    },
  };
}

export function decodeCsvPayload(
  value: unknown
): CsvPayload | null {
  try {
    const p = (typeof value === "string" ? JSON.parse(value) : value ?? {}) as { kind?: string };
    if (p.kind !== "csv_table") return null;
    return p as CsvPayload;
  } catch {
    return null;
  }
}

// Escape pipe characters within a cell for Markdown table syntax.
function escapeCell(cell: string): string {
  return cell.replace(/\|/g, "\\|");
}

// Build a GitHub-flavored Markdown table string from payload.
export function buildMarkdownTable(payload: CsvPayload): string {
  const headerRow = "| " + payload.headers.map(escapeCell).join(" | ") + " |";
  const separatorRow =
    "| " + payload.headers.map(() => "---").join(" | ") + " |";
  const dataRows = payload.rows.map(
    (row) => "| " + row.map(escapeCell).join(" | ") + " |"
  );
  return [headerRow, separatorRow, ...dataRows].join("\n");
}

// Build a JSON array-of-objects from payload. Values stay strings (lossless —
// avoids leading-zero / big-int / locale footguns). Missing cells → "".
// Extra cells beyond headers are ignored. Repeated headers → last value wins
// (Object.fromEntries semantics).
export function buildCsvJson(payload: CsvPayload): string {
  const objects = payload.rows.map((row) =>
    Object.fromEntries(
      payload.headers.map((header, i) => [header, row[i] ?? ""])
    )
  );
  return JSON.stringify(objects, null, 2);
}

export const attachment = defineAttachment<CsvPayload>(ATTACHMENT_TYPE);
