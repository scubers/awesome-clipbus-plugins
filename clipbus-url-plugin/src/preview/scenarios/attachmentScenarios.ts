// Attachment preview scenarios for the dev workbench.
// Each entry here feeds the scenario selector in PreviewShellApp.vue.

export interface AttachmentScenario {
  id: string;
  label: string;
  rendererComponent: "compact" | "expanded";
  searchTerms: string[];
  accentHex: string;
  bootstrap: Record<string, unknown>;
}

// Pre-computed UrlPayload for https://example.com/p?a=1
const urlParsedBootstrapPayload = JSON.stringify({
  kind: "url_parsed",
  version: 1,
  input: "https://example.com/p?a=1",
  href: "https://example.com/p?a=1",
  scheme: "https",
  username: "",
  host: "example.com",
  port: "",
  path: "/p",
  query: [{ key: "a", value: "1" }],
  hash: "",
  display: {
    typeLabel: "URL",
    headline: "example.com",
    facts: [
      { label: "Scheme", value: "https" },
      { label: "Host", value: "example.com" },
      { label: "Path", value: "/p" },
    ],
  },
});

export const attachmentScenarios: AttachmentScenario[] = [
  {
    id: "url-parsed-example",
    label: "https://example.com/p?a=1",
    rendererComponent: "compact",
    searchTerms: ["example.com", "url"],
    accentHex: "#2563EB",
    bootstrap: {
      attachment: { payloadJson: urlParsedBootstrapPayload },
    },
  },
];
