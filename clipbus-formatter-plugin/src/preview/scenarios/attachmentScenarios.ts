// Attachment preview scenarios for the dev workbench.
// Consumed by createPreviewWorkbench (preview-host/main.ts); `view` selects the
// feature component to mount. Add one entry per attachment renderer feature.

import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";

const PLUGIN_ID = "plugin.formatter";
const ITEM_TAGS = ["formatter"];
const SOURCE_APP = "com.preview.editor";

// Richer sample: nested array + a string that needs quoting (contains ": ")
// so the YAML view demonstrates both cases clearly.
const jsonObjectPayload = JSON.stringify({
  kind: "json_formatter_preview",
  version: 1,
  originalLength: 99,
  formatted:
    '{\n  "name": "api",\n  "url": "https://x.y/z?a=1",\n  "note": "value: with colon",\n  "ports": [\n    80,\n    443\n  ],\n  "enabled": true\n}',
  formattedLength: 133,
  yaml: 'name: api\nurl: https://x.y/z?a=1\nnote: "value: with colon"\nports:\n  - 80\n  - 443\nenabled: true',
  minified: '{"name":"api","url":"https://x.y/z?a=1","note":"value: with colon","ports":[80,443],"enabled":true}',
  topLevelType: "object",
  topLevelCount: 5,
  display: {
    typeLabel: "JSON Object",
    headline: "JSON Object · 5 keys",
    subheadline: "99 → 133 chars",
  },
});

const jsonArrayPayload = JSON.stringify({
  kind: "json_formatter_preview",
  version: 1,
  originalLength: 9,
  formatted: '[\n  1,\n  2,\n  3\n]',
  formattedLength: 16,
  yaml: "- 1\n- 2\n- 3",
  minified: "[1,2,3]",
  topLevelType: "array",
  topLevelCount: 3,
  display: {
    typeLabel: "JSON Array",
    headline: "JSON Array · 3 items",
    subheadline: "9 → 16 chars",
  },
});

// 3-column, 3-row sample; "note" column has a value that contains a comma
// (the result of parsing a quoted field like `"handles, UX & motion"`) to
// demonstrate that CSV quoting is preserved through the JSON export.
const csvTablePayload = JSON.stringify({
  kind: "csv_table",
  version: 1,
  delimiter: ",",
  headers: ["name", "role", "note"],
  rows: [
    ["Alice", "Engineer", "works on infra"],
    ["Bob", "Designer", "handles, UX & motion"],
    ["Carol", "PM", "leads roadmap"],
  ],
  rowCount: 3,
  colCount: 3,
  display: {
    typeLabel: "CSV Table",
    headline: "3 columns × 3 rows",
    facts: [
      { label: "Rows", value: "3" },
      { label: "Columns", value: "3" },
      { label: "Delimiter", value: "comma" },
    ],
  },
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
    id: "csv-table-basic",
    label: "CSV Table",
    view: "csv-table",
    accentHex: "#0F766E",
    attachmentType: "plugin.formatter.csv",
    min: 160,
    max: 460,
    payloadJson: csvTablePayload,
  }),
];
