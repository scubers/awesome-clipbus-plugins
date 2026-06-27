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

export const attachmentScenarios: AttachmentScenario[] = [
  {
    id: "base64-renderer-hello",
    label: "Base64: Hello, World!",
    component: "base64-renderer",
    searchTerms: ["base64", "decode"],
    accentHex: "#0F766E",
    bootstrap: {
      attachment: {
        historyID: "preview-base64-hello",
        owner: "plugin.decoder",
        attachmentType: "plugin.decoder.base64",
        attachmentKey: "primary",
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
    component: "base64-renderer",
    searchTerms: ["base64", "json"],
    accentHex: "#0F766E",
    bootstrap: {
      attachment: {
        historyID: "preview-base64-json",
        owner: "plugin.decoder",
        attachmentType: "plugin.decoder.base64",
        attachmentKey: "primary",
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
    id: "data-uri-text-plain",
    label: "Data URI: text/plain base64",
    component: "data-uri",
    searchTerms: ["data-uri", "base64"],
    accentHex: "#0369A1",
    bootstrap: {
      attachment: {
        historyID: "preview-datauri-text",
        owner: "plugin.decoder",
        attachmentType: "plugin.decoder.datauri",
        attachmentKey: "primary",
        payloadJson: JSON.stringify({
          kind: "data_uri_preview",
          version: 1,
          mediaType: "text/plain",
          isDefault: false,
          isBase64: true,
          encodingLabel: "Base64",
          decodedSize: "5 B",
          isImage: false,
          isText: true,
          decodedTextPreview: "Hello",
          decodedTextTruncated: false,
          decodeError: false,
        }),
      },
    },
  },
  {
    id: "data-uri-image-png",
    label: "Data URI: image/png",
    component: "data-uri",
    searchTerms: ["data-uri", "image"],
    accentHex: "#0369A1",
    bootstrap: {
      attachment: {
        historyID: "preview-datauri-image",
        owner: "plugin.decoder",
        attachmentType: "plugin.decoder.datauri",
        attachmentKey: "primary",
        payloadJson: JSON.stringify({
          kind: "data_uri_preview",
          version: 1,
          mediaType: "image/png",
          isDefault: false,
          isBase64: true,
          encodingLabel: "Base64",
          decodedSize: "8 B",
          isImage: true,
          isText: false,
          decodedTextPreview: null,
          decodedTextTruncated: false,
          decodeError: false,
        }),
      },
    },
  },
  {
    id: "jwt-renderer-canonical",
    label: "JWT: HS256 canonical token",
    component: "jwt-renderer",
    searchTerms: ["jwt", "token"],
    accentHex: "#7C3AED",
    bootstrap: {
      attachment: {
        historyID: "preview-jwt-hs256",
        owner: "plugin.decoder",
        attachmentType: "plugin.decoder.jwt",
        attachmentKey: "primary",
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
