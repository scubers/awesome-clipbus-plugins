// Attachment preview scenarios for the dev workbench.
// Consumed by createPreviewWorkbench (preview-host/main.ts); `view` selects the
// feature component to mount. Add one entry per attachment renderer feature.

import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";

const PLUGIN_ID = "plugin.formatter";
const ITEM_TAGS = ["formatter"];
const SOURCE_APP = "com.preview.editor";

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

/** Build an attachmentRenderer scenario; `view` routes to the feature component. */
function renderer(opts: {
  id: string;
  label: string;
  view: string;
  accentHex: string;
  attachmentType: string;
  payloadJson: string;
  min: number;
  max: number;
}): PreviewScenario {
  const item = {
    id: `item-${opts.id}`,
    type: "text",
    tags: ITEM_TAGS,
    sourceAppID: SOURCE_APP,
  };
  return {
    id: opts.id,
    label: opts.label,
    mode: "attachmentRenderer",
    pluginID: PLUGIN_ID,
    accentHex: opts.accentHex,
    view: opts.view,
    viewport: { heightPolicy: "bounded", min: opts.min, max: opts.max },
    item,
    attachment: {
      item,
      attachment: {
        historyID: `preview-${opts.id}`,
        owner: PLUGIN_ID,
        attachmentType: opts.attachmentType,
        attachmentKey: "primary",
        payloadJson: opts.payloadJson,
      },
    },
  };
}

export const attachmentScenarios: PreviewScenario[] = [
  renderer({
    id: "json-renderer-object",
    label: "JSON Object",
    view: "json-renderer",
    accentHex: "#7C3AED",
    attachmentType: "plugin.formatter.json",
    min: 160,
    max: 480,
    payloadJson: jsonObjectPayload,
  }),
  renderer({
    id: "json-renderer-array",
    label: "JSON Array",
    view: "json-renderer",
    accentHex: "#7C3AED",
    attachmentType: "plugin.formatter.json",
    min: 160,
    max: 480,
    payloadJson: jsonArrayPayload,
  }),
  renderer({
    id: "xml-renderer-catalog",
    label: "XML: book catalog",
    view: "xml-renderer",
    accentHex: "#7C3AED",
    attachmentType: "plugin.formatter.xml",
    min: 140,
    max: 480,
    payloadJson: xmlPayload,
  }),
  renderer({
    id: "sql-renderer-select",
    label: "SQL: SELECT with JOIN",
    view: "sql-renderer",
    accentHex: "#0369A1",
    attachmentType: "plugin.formatter.sql",
    min: 140,
    max: 460,
    payloadJson: sqlPayload,
  }),
  renderer({
    id: "csv-table-basic",
    label: "CSV Table",
    view: "csv-table",
    accentHex: "#0F766E",
    attachmentType: "plugin.formatter.csv",
    min: 160,
    max: 460,
    payloadJson: csvTablePayload,
  }),
  renderer({
    id: "query-table-basic",
    label: "Query String",
    view: "query-table",
    accentHex: "#0F766E",
    attachmentType: "plugin.formatter.query",
    min: 140,
    max: 420,
    payloadJson: queryTablePayload,
  }),
];
