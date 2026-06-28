// Attachment preview scenarios for the dev workbench.
// Consumed by createPreviewWorkbench (preview-host/main.ts); `view` selects the
// feature component to mount. Add one entry per attachment renderer feature.

import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";

const PLUGIN_ID = "plugin.inspector";
const ITEM_TAGS = ["inspector"];
const SOURCE_APP = "com.preview.editor";

const textStatsPayload = JSON.stringify({
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
});

const imageInfoPayload = JSON.stringify({
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
});

const charInfoPayload = JSON.stringify({
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
});

const diffPayload = JSON.stringify({
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
});

/** Build an attachmentRenderer scenario; `view` routes to the feature component. */
function renderer(opts: {
  id: string;
  label: string;
  view: string;
  accentHex: string;
  attachmentType: string;
  payloadJson: string;
  min: number;
  max: number;
}): PreviewScenario {
  const item = {
    id: `item-${opts.id}`,
    type: "text",
    tags: ITEM_TAGS,
    sourceAppID: SOURCE_APP,
  };
  return {
    id: opts.id,
    label: opts.label,
    mode: "attachmentRenderer",
    pluginID: PLUGIN_ID,
    accentHex: opts.accentHex,
    view: opts.view,
    viewport: { heightPolicy: "bounded", min: opts.min, max: opts.max },
    item,
    attachment: {
      item,
      attachment: {
        historyID: `preview-${opts.id}`,
        owner: PLUGIN_ID,
        attachmentType: opts.attachmentType,
        attachmentKey: "primary",
        payloadJson: opts.payloadJson,
      },
    },
  };
}

export const attachmentScenarios: PreviewScenario[] = [
  renderer({
    id: "text-stats-renderer-sample",
    label: "Text Stats: Sample Long Text",
    view: "text-stats-renderer",
    accentHex: "#7C3AED",
    attachmentType: "plugin.inspector.text-stats",
    min: 160,
    max: 360,
    payloadJson: textStatsPayload,
  }),
  renderer({
    id: "image-info-renderer-sample",
    label: "Image Details: 1920×1080 PNG",
    view: "image-info-renderer",
    accentHex: "#0369a1",
    attachmentType: "plugin.inspector.image-info",
    min: 160,
    max: 360,
    payloadJson: imageInfoPayload,
  }),
  renderer({
    id: "char-info-renderer-sample",
    label: "Character: 😀 Grinning Face (U+1F600)",
    view: "char-info-renderer",
    accentHex: "#7c3aed",
    attachmentType: "plugin.inspector.char-info",
    min: 160,
    max: 360,
    payloadJson: charInfoPayload,
  }),
  renderer({
    id: "diff-sample",
    label: "Unified Diff Sample",
    view: "diff-renderer",
    accentHex: "#0F766E",
    attachmentType: "plugin.inspector.diff",
    min: 140,
    max: 480,
    payloadJson: diffPayload,
  }),
];
