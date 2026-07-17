// Action preview scenarios for the dev workbench.
// Consumed by createPreviewWorkbench (preview-host/main.ts); `view` selects the
// feature component to mount. Add one entry per draft action feature.

import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";
import { INITIAL_DRAFT } from "../../features/regex-tool/payload";

const PLUGIN_ID = "plugin.extractor";

export const actionScenarios: PreviewScenario[] = [
  {
    id: "regex-tool",
    label: "Regex Tester",
    mode: "action",
    pluginID: PLUGIN_ID,
    view: "regex-tool",
    viewport: { heightPolicy: "fixed", height: 360 },
    item: {
      id: "action-item-regex-tool",
      type: "text",
      tags: ["extractor"],
      sourceAppID: "com.preview.editor",
    },
    actionInput: {
      kind: "text",
      text: "Price: $99, discounted $49, save $10",
    },
    draft: {
      ...INITIAL_DRAFT,
      pattern: "\\d+",
      flags: "g",
      text: "Price: $99, discounted $49, save $10",
    },
    buttons: [{ id: "submit", title: "Copy Matches", isEnabled: true }],
    defaultButtonID: "submit",
  },
];
