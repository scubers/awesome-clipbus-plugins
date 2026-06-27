// Attachment preview scenarios for the dev workbench.
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
    id: "jwt-renderer-hs256",
    label: "JWT: HS256 (John Doe)",
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
          payloadPretty:
            '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}',
          claimFacts: [
            { label: "主题 (sub)", value: "1234567890" },
            { label: "name", value: "John Doe" },
            { label: "签发时间 (iat)", value: "2018-01-18T01:30:22Z" },
          ],
          expIso: null,
          isExpired: null,
          relativeLabel: null,
          signaturePresent: true,
        }),
      },
    },
  },
  {
    id: "jwt-renderer-expired",
    label: "JWT: expired RS256",
    rendererComponent: "compact",
    searchTerms: ["jwt", "expired"],
    accentHex: "#7C3AED",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "jwt_preview",
          version: 1,
          alg: "RS256",
          typ: "JWT",
          headerPretty: '{\n  "alg": "RS256",\n  "typ": "JWT"\n}',
          payloadPretty:
            '{\n  "iss": "https://auth.example.com",\n  "sub": "user-42",\n  "exp": 1000000000\n}',
          claimFacts: [
            { label: "签发者 (iss)", value: "https://auth.example.com" },
            { label: "主题 (sub)", value: "user-42" },
          ],
          expIso: "2001-09-09T01:46:40Z",
          isExpired: true,
          relativeLabel: "已过期 8000 天",
          signaturePresent: true,
        }),
      },
    },
  },
];
