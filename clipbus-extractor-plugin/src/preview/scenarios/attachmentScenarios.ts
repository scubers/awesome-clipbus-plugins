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
    id: "entities-renderer-mixed",
    label: "提取结果：URL + 邮箱 + IP",
    rendererComponent: "compact",
    searchTerms: ["extract", "url", "email", "ip"],
    accentHex: "#2563EB",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "entities_preview",
          version: 1,
          urls: ["https://example.com", "https://foo.org"],
          emails: ["john@example.com"],
          ips: ["192.168.1.1"],
          totalCount: 4,
        }),
      },
    },
  },
];
