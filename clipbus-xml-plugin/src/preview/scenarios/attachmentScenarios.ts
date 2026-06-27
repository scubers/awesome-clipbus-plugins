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

export const attachmentScenarios: AttachmentScenario[] = [
  {
    id: "xml-sample",
    label: "XML 格式化示例",
    rendererComponent: "expanded",
    searchTerms: ["xml", "format"],
    accentHex: "#7C3AED",
    bootstrap: {
      kind: "xml_preview",
      version: 1,
      formatted:
        '<root>\n  <item id="1">\n    <name>Alice</name>\n    <role>admin</role>\n  </item>\n  <item id="2">\n    <name>Bob</name>\n    <role>user</role>\n  </item>\n</root>',
      elementCount: 7,
      attributeCount: 2,
      maxDepth: 3,
    },
  },
];
