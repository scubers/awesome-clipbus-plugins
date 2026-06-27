// Attachment preview scenarios for the dev workbench.
// Add entries here as you implement attachment renderer features.
// Each entry must import its feature's app.vue and be referenced in PreviewShellApp.vue.

export interface AttachmentScenario {
  id: string;
  label: string;
  rendererComponent: "compact" | "expanded";
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

export const attachmentScenarios: AttachmentScenario[] = [
  {
    id: "json-renderer-object",
    label: "JSON Object",
    rendererComponent: "compact",
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
    rendererComponent: "compact",
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
];
