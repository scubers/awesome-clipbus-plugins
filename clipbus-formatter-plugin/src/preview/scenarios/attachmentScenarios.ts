// Attachment preview scenarios for the dev workbench.
// Add entries here as you implement attachment renderer features.
// Each entry must import its feature's app.vue and be referenced in PreviewShellApp.vue.

export interface AttachmentScenario {
  id: string;
  label: string;
  component: string;
  searchTerms: string[];
  accentHex: string;
  bootstrap: Record<string, unknown>;
}

const jsonObjectPayload = JSON.stringify({
  kind: "json_formatter_preview",
  version: 1,
  originalLength: 25,
  formatted: '{\n  "name": "Alice",\n  "age": 30\n}',
  formattedLength: 30,
  topLevelType: "object",
  topLevelCount: 2,
  display: {
    typeLabel: "JSON Object",
    headline: "JSON Object · 2 keys",
    subheadline: "25 → 30 chars",
  },
});

const jsonArrayPayload = JSON.stringify({
  kind: "json_formatter_preview",
  version: 1,
  originalLength: 9,
  formatted: '[\n  1,\n  2,\n  3\n]',
  formattedLength: 16,
  topLevelType: "array",
  topLevelCount: 3,
  display: {
    typeLabel: "JSON Array",
    headline: "JSON Array · 3 items",
    subheadline: "9 → 16 chars",
  },
});

const csvTablePayload = JSON.stringify({
  kind: "csv_table",
  version: 1,
  delimiter: ",",
  headers: ["name", "age"],
  rows: [
    ["Alice", "30"],
    ["Bob", "25"],
  ],
  rowCount: 2,
  colCount: 2,
  display: {
    typeLabel: "CSV Table",
    headline: "2 columns × 2 rows",
    facts: [
      { label: "Rows", value: "2" },
      { label: "Columns", value: "2" },
      { label: "Delimiter", value: "comma" },
    ],
  },
});

const queryTablePayload = JSON.stringify({
  kind: "query_table",
  version: 1,
  pairs: [
    { key: "utm_source", value: "newsletter" },
    { key: "utm_medium", value: "email" },
    { key: "utm_campaign", value: "spring sale" },
  ],
  count: 3,
  hasDuplicateKeys: false,
  jsonObject: JSON.stringify({
    utm_source: "newsletter",
    utm_medium: "email",
    utm_campaign: "spring sale",
  }),
});

const xmlPayload = JSON.stringify({
  kind: "xml_preview",
  version: 1,
  formatted:
    '<?xml version="1.0" encoding="UTF-8"?>\n<catalog>\n  <book id="bk101">\n    <author>Gambardella, Matthew</author>\n    <title>XML Developer\'s Guide</title>\n    <genre>Computer</genre>\n    <price>44.95</price>\n  </book>\n  <book id="bk102">\n    <author>Ralls, Kim</author>\n    <title>Midnight Rain</title>\n    <genre>Fantasy</genre>\n    <price>5.95</price>\n  </book>\n</catalog>',
  elementCount: 10,
  attributeCount: 2,
  maxDepth: 3,
});

const sqlPayload = JSON.stringify({
  kind: "sql_preview",
  version: 1,
  statementType: "SELECT",
  formatted:
    "SELECT u.id, u.name, o.total\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.total > 100\nORDER BY o.total DESC\nLIMIT 20",
  original:
    "SELECT u.id, u.name, o.total FROM users u INNER JOIN orders o ON u.id = o.user_id WHERE o.total > 100 ORDER BY o.total DESC LIMIT 20",
});

export const attachmentScenarios: AttachmentScenario[] = [
  {
    id: "json-renderer-object",
    label: "JSON Object",
    component: "json-renderer",
    searchTerms: ["json", "object", "format"],
    accentHex: "#7C3AED",
    bootstrap: {
      attachment: {
        historyID: "preview-1",
        owner: "plugin.formatter",
        attachmentType: "plugin.formatter.json",
        attachmentKey: "primary",
        payloadJson: jsonObjectPayload,
      },
    },
  },
  {
    id: "json-renderer-array",
    label: "JSON Array",
    component: "json-renderer",
    searchTerms: ["json", "array", "formatter"],
    accentHex: "#7C3AED",
    bootstrap: {
      attachment: {
        historyID: "preview-2",
        owner: "plugin.formatter",
        attachmentType: "plugin.formatter.json",
        attachmentKey: "primary",
        payloadJson: jsonArrayPayload,
      },
    },
  },
  {
    id: "xml-renderer-catalog",
    label: "XML: book catalog",
    component: "xml-renderer",
    searchTerms: ["xml", "markup", "format"],
    accentHex: "#7C3AED",
    bootstrap: {
      attachment: {
        historyID: "preview-xml",
        owner: "plugin.formatter",
        attachmentType: "plugin.formatter.xml",
        attachmentKey: "primary",
        payloadJson: xmlPayload,
      },
    },
  },
  {
    id: "sql-renderer-select",
    label: "SQL: SELECT with JOIN",
    component: "sql-renderer",
    searchTerms: ["sql", "select", "query"],
    accentHex: "#0369A1",
    bootstrap: {
      attachment: {
        historyID: "preview-sql",
        owner: "plugin.formatter",
        attachmentType: "plugin.formatter.sql",
        attachmentKey: "primary",
        payloadJson: sqlPayload,
      },
    },
  },
  {
    id: "csv-table-basic",
    label: "CSV Table",
    component: "csv-table",
    searchTerms: ["csv", "table"],
    accentHex: "#0F766E",
    bootstrap: {
      attachment: {
        historyID: "preview-csv",
        owner: "plugin.formatter",
        attachmentType: "plugin.formatter.csv",
        attachmentKey: "primary",
        payloadJson: csvTablePayload,
      },
    },
  },
  {
    id: "query-table-basic",
    label: "Query String",
    component: "query-table",
    searchTerms: ["query", "url", "params"],
    accentHex: "#0F766E",
    bootstrap: {
      attachment: {
        historyID: "preview-query",
        owner: "plugin.formatter",
        attachmentType: "plugin.formatter.query",
        attachmentKey: "primary",
        payloadJson: queryTablePayload,
      },
    },
  },
];
