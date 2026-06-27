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
  {
    id: "jwt-renderer-canonical",
    label: "JWT: HS256 canonical token",
    rendererComponent: "compact",
    searchTerms: ["jwt", "token"],
    accentHex: "#7C3AED",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "jwt_preview",
          version: 1,
          alg: "HS256",
          typ: "JWT",
          headerPretty: '{\n  "alg": "HS256",\n  "typ": "JWT"\n}',
          payloadPretty: '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}',
          claimFacts: [
            { label: "sub", value: "1234567890" },
            { label: "name", value: "John Doe" },
          ],
          expIso: null,
          isExpired: null,
          relativeLabel: null,
          signaturePresent: true,
        }),
      },
    },
  },
];
