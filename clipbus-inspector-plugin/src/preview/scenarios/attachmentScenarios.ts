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
    label: "Text Stats: Sample Long Text",
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
  {
    id: "image-info-renderer-sample",
    label: "Image Details: 1920×1080 PNG",
    rendererComponent: "compact",
    searchTerms: ["image", "png", "dimensions"],
    accentHex: "#0369a1",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "image_info",
          version: 1,
          format: "PNG",
          width: 1920,
          height: 1080,
          orientation: "Landscape",
          aspectRatioReduced: "16:9",
          aspectRatioDecimal: "1.78:1",
          megapixels: 2.07,
          fileSizeHuman: "1 MB",
          fileSizeBytes: 1048576,
          commonLabel: "Full HD 1080p",
        }),
      },
    },
  },
  {
    id: "char-info-renderer-sample",
    label: "Character: 😀 Grinning Face (U+1F600)",
    rendererComponent: "compact",
    searchTerms: ["emoji", "unicode", "character"],
    accentHex: "#7c3aed",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "char_info",
          version: 1,
          glyph: "😀",
          codePoints: ["U+1F600"],
          primaryDecimal: 128512,
          utf8: "F0 9F 98 80",
          utf16: "D83D DE00",
          htmlEntity: "&#x1F600;",
          category: "Emoji",
          isInvisible: false,
        }),
      },
    },
  },
  {
    id: "diff-sample",
    label: "Unified Diff Sample",
    rendererComponent: "expanded",
    searchTerms: ["diff", "patch", "unified"],
    accentHex: "#0F766E",
    bootstrap: {
      payloadJson: JSON.stringify({
        kind: "diff_preview",
        version: 1,
        lines: [
          { type: "meta", text: "diff --git a/src/app.ts b/src/app.ts" },
          { type: "meta", text: "--- a/src/app.ts" },
          { type: "meta", text: "+++ b/src/app.ts" },
          { type: "hunk", text: "@@ -1,3 +1,4 @@" },
          { type: "ctx", text: " const x = 1;" },
          { type: "del", text: "-const y = 2;" },
          { type: "add", text: "+const y = 3;" },
          { type: "add", text: "+const z = 4;" },
          { type: "ctx", text: " export { x, y };" },
        ],
        additions: 2,
        deletions: 1,
        files: 1,
      }),
    },
  },
];
