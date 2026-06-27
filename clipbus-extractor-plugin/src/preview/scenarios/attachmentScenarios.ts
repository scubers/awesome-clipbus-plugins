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

const urlParsedPayload = JSON.stringify({
  kind: "url_parsed",
  version: 1,
  input: "https://user@example.com:8080/path/to/page?q=clip&lang=en#section",
  href: "https://user@example.com:8080/path/to/page?q=clip&lang=en#section",
  scheme: "https",
  username: "user",
  host: "example.com",
  port: "8080",
  path: "/path/to/page",
  query: [
    { key: "q", value: "clip" },
    { key: "lang", value: "en" },
  ],
  hash: "#section",
  display: {
    typeLabel: "URL",
    headline: "example.com",
    facts: [
      { label: "Scheme", value: "https" },
      { label: "Host", value: "example.com" },
      { label: "Port", value: "8080" },
      { label: "Path", value: "/path/to/page" },
      { label: "Hash", value: "#section" },
    ],
  },
});

export const attachmentScenarios: AttachmentScenario[] = [
  {
    id: "entities-renderer-mixed",
    label: "Extracted Entities: URL + Email + IP",
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
  {
    id: "url-parsed-basic",
    label: "URL: parsed structure",
    rendererComponent: "compact",
    searchTerms: ["url", "host", "query"],
    accentHex: "#2563EB",
    bootstrap: {
      attachment: {
        historyID: "preview-url",
        owner: "plugin.extractor",
        attachmentType: "plugin.extractor.url",
        attachmentKey: "primary",
        payloadJson: urlParsedPayload,
      },
    },
  },
];
