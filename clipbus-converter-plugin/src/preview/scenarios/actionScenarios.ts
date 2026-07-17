// Action preview scenarios for the dev workbench.
// Consumed by createPreviewWorkbench (preview-host/main.ts); `view` selects the
// feature component to mount. Add one entry per draft action feature.

import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";
import { INITIAL_DRAFT } from "../../features/case-tool/payload";

const PLUGIN_ID = "plugin.converter";

export const actionScenarios: PreviewScenario[] = [
  {
    id: "case-tool",
    label: "Case Converter",
    mode: "action",
    pluginID: PLUGIN_ID,
    view: "case-tool",
    viewport: { heightPolicy: "fixed", height: 320 },
    item: {
      id: "action-item-case-tool",
      type: "text",
      tags: ["converter"],
      sourceAppID: "com.preview.editor",
    },
    actionInput: {
      kind: "text",
      text: "helloWorldFooBar",
    },
    draft: {
      ...INITIAL_DRAFT,
      input: "helloWorldFooBar",
    },
    buttons: [{ id: "submit", title: "Copy camelCase", isEnabled: true }],
    defaultButtonID: "submit",
  },
];
