// Action preview scenarios for the dev workbench.
// Consumed by createPreviewWorkbench (preview-host/main.ts); `view` selects the
// feature component to mount. Add one entry per draft action feature.

import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";
import { INITIAL_DRAFT as GEN_INITIAL_DRAFT } from "../../features/gen-tool/payload";
import { INITIAL_DRAFT as LOREM_INITIAL_DRAFT } from "../../features/lorem-tool/payload";

const PLUGIN_ID = "plugin.generator";

export const actionScenarios: PreviewScenario[] = [
  {
    id: "gen-tool",
    label: "Generator (UUID / Password / ULID)",
    mode: "action",
    pluginID: PLUGIN_ID,
    view: "gen-tool",
    viewport: { heightPolicy: "fixed", height: 320 },
    item: {
      id: "action-item-gen-tool",
      type: "text",
      tags: ["generator"],
      sourceAppID: "com.preview.editor",
    },
    draft: { ...GEN_INITIAL_DRAFT },
    buttons: [{ id: "submit", title: "Generate & Copy", isEnabled: true }],
    defaultButtonID: "submit",
  },
  {
    id: "gen-tool-ulid",
    label: "Generator (ULID mode)",
    mode: "action",
    pluginID: PLUGIN_ID,
    view: "gen-tool",
    viewport: { heightPolicy: "fixed", height: 320 },
    item: {
      id: "action-item-gen-tool-ulid",
      type: "text",
      tags: ["generator"],
      sourceAppID: "com.preview.editor",
    },
    draft: { ...GEN_INITIAL_DRAFT, mode: "ulid" },
    buttons: [{ id: "submit", title: "Generate & Copy", isEnabled: true }],
    defaultButtonID: "submit",
  },
  {
    id: "lorem-tool",
    label: "Lorem Ipsum Generator",
    mode: "action",
    pluginID: PLUGIN_ID,
    view: "lorem-tool",
    viewport: { heightPolicy: "fixed", height: 320 },
    item: {
      id: "action-item-lorem-tool",
      type: "text",
      tags: ["generator"],
      sourceAppID: "com.preview.editor",
    },
    draft: { ...LOREM_INITIAL_DRAFT },
    buttons: [{ id: "submit", title: "Insert", isEnabled: true }],
    defaultButtonID: "submit",
  },
];
