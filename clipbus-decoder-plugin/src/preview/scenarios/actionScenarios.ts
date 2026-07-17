// Action preview scenarios for the dev workbench.
// Consumed by createPreviewWorkbench (preview-host/main.ts); `view` selects the
// feature component to mount. Add one entry per draft action feature.

import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";
import { INITIAL_DRAFT } from "../../features/escape-tool/payload";

const PLUGIN_ID = "plugin.decoder";

export const actionScenarios: PreviewScenario[] = [
  {
    id: "escape-tool-url",
    label: "Escape Tool: URL encode",
    mode: "action",
    pluginID: PLUGIN_ID,
    view: "escape-tool",
    viewport: { heightPolicy: "fixed", height: 360 },
    item: {
      id: "action-item-escape-tool-url",
      type: "text",
      tags: ["decoder"],
      sourceAppID: "com.preview.editor",
    },
    actionInput: {
      kind: "text",
      text: "hello world & more",
    },
    draft: {
      ...INITIAL_DRAFT,
      mode: "url",
      input: "hello world & more",
    },
    buttons: [{ id: "submit", title: "Copy Encoded Result", isEnabled: true }],
    defaultButtonID: "submit",
  },
];
