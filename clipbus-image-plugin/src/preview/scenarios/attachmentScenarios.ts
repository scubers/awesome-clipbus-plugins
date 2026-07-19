// Attachment preview scenarios for the dev workbench (createPreviewWorkbench).
// Add one PreviewScenario per attachment renderer feature, then import its app.vue
// in preview-host/main.ts and map it in COMPONENTS by view (= feature dir name).
//
// Shape (authoritative: @clipbus/plugin-sdk docs/preview.md):
//   { id, label, mode: "attachmentRenderer", pluginID: "<your plugin.id>",
//     accentHex, view: "<feature-dir>",
//     viewport: { heightPolicy: "bounded", min, max },   // match the manifest height
//     item: { id, type: "text", tags: [], sourceAppID: "com.preview.editor" },
//     attachment: { item, attachment: { historyID, owner: "<plugin.id>",
//       attachmentType: "<from manifest>", attachmentKey: "primary", payloadJson } } }

import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";

export const attachmentScenarios: PreviewScenario[] = [];
