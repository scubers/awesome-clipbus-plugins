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
    id: "text-stats-renderer-sample",
    label: "文本统计: 示例长文本",
    rendererComponent: "compact",
    searchTerms: ["stats", "hash", "sha256"],
    accentHex: "#7C3AED",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "text_stats_preview",
          version: 1,
          chars: 29,
          charsNoSpaces: 23,
          words: 6,
          lines: 2,
          bytes: 29,
          md5: "5f4dcc3b5aa765d61d8327deb882cf99",
          sha1: "0a4d55a8d778e5022fab701977c5d840bbc486d0",
          sha256: "315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3",
          preview: "Hello, World!\nThis is a test.",
        }),
      },
    },
  },
];
