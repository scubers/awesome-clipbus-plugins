// Action preview scenarios for the dev workbench (createPreviewWorkbench).
// Add one PreviewScenario per draft action feature, then import its app.vue in
// preview-host/main.ts and map it in COMPONENTS by view (= feature dir name).
//
// Shape (authoritative: @clipbus/plugin-sdk docs/preview.md):
//   { id, label, mode: "action", pluginID: "<your plugin.id>", view: "<feature-dir>",
//     viewport: { heightPolicy: "fixed", height: 320 },
//     item: { id, type: "text", tags: [], sourceAppID: "com.preview.editor" },
//     draft: { ...INITIAL_DRAFT },
//     buttons: [{ id, title, isEnabled }], defaultButtonID: "<id>" }

import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";

export const actionScenarios: PreviewScenario[] = [];
