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
    id: "radix-renderer-255",
    label: "Number Base: 255 (0xff / 0b11111111)",
    rendererComponent: "compact",
    searchTerms: ["radix", "hex", "binary", "255"],
    accentHex: "#4F46E5",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "radix_preview",
          version: 1,
          inputBase: "dec",
          decimal: "255",
          hex: "0xff",
          octal: "0o377",
          binary: "0b11111111",
          bits: 8,
          asciiChar: null,
          isNegative: false,
        }),
      },
    },
  },
];
