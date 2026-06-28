import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";

const PLUGIN_ID = "plugin.vibe";

export const attachmentScenarios: PreviewScenario[] = [
  {
    id: "fallback-text",
    label: "Fallback — Plain Text",
    mode: "attachmentRenderer",
    pluginID: PLUGIN_ID,
    accentHex: "#7C5CFF",
    view: "vibe-fallback",
    viewport: { heightPolicy: "fixed", height: 220 },
    item: { id: "item-vibe", type: "text", tags: [], sourceAppID: "com.preview.editor" },
    attachment: {
      item: { id: "item-vibe", type: "text", tags: [], sourceAppID: "com.preview.editor" },
      attachment: {
        historyID: "preview-vibe",
        owner: PLUGIN_ID,
        attachmentType: "plugin.vibe.fallback",
        attachmentKey: "primary",
        payloadJson: JSON.stringify({ kind: "vibe_fallback", version: 1, text: "hello world", charCount: 11 }),
      },
    },
    buttons: [],
  },
  {
    id: "fallback-short",
    label: "Fallback — Short Word",
    mode: "attachmentRenderer",
    pluginID: PLUGIN_ID,
    accentHex: "#7C5CFF",
    view: "vibe-fallback",
    viewport: { heightPolicy: "fixed", height: 220 },
    item: { id: "item-vibe2", type: "text", tags: [], sourceAppID: "com.preview.editor" },
    attachment: {
      item: { id: "item-vibe2", type: "text", tags: [], sourceAppID: "com.preview.editor" },
      attachment: {
        historyID: "preview-vibe2",
        owner: PLUGIN_ID,
        attachmentType: "plugin.vibe.fallback",
        attachmentKey: "primary",
        payloadJson: JSON.stringify({ kind: "vibe_fallback", version: 1, text: "Vibe", charCount: 4 }),
      },
    },
    buttons: [],
  },
];
