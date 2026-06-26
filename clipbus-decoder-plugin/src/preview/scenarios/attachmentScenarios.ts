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
    id: "base64-renderer-hello",
    label: "Base64: Hello, World!",
    rendererComponent: "compact",
    searchTerms: ["base64", "decode"],
    accentHex: "#0F766E",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "base64_preview",
          version: 1,
          originalSnippet: "SGVsbG8sIFdvcmxkIQ==",
          originalLength: 20,
          decoded: "Hello, World!",
          decodedLength: 13,
          isText: true,
          encoding: "standard",
        }),
      },
    },
  },
  {
    id: "base64-renderer-json",
    label: "Base64: JSON payload",
    rendererComponent: "compact",
    searchTerms: ["base64", "json"],
    accentHex: "#0F766E",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "base64_preview",
          version: 1,
          originalSnippet: "eyJ1c2VyIjoiYWxpY2UiLCJyb2xlIjoiYWRtaW4ifQ==",
          originalLength: 44,
          decoded: '{"user":"alice","role":"admin"}',
          decodedLength: 30,
          isText: true,
          encoding: "standard",
        }),
      },
    },
  },
];
