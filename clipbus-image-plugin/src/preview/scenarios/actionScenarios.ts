import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";
import type { ImageEditDraft } from "../../features/image-edit/contracts";

const draft: ImageEditDraft = {
  origWidth: 1200,
  origHeight: 800,
  format: "png",
  quality: 80,
};

export const actionScenarios: PreviewScenario[] = [
  {
    id: "image-edit",
    label: "Crop & Compress",
    mode: "action",
    pluginID: "plugin.image",
    view: "image-edit",
    viewport: { heightPolicy: "bounded", min: 240, max: 720 },
    item: {
      id: "source-item-image-edit",
      type: "text",
      tags: ["image"],
      sourceAppID: "com.preview.editor",
    },
    actionInput: {
      kind: "image",
      width: draft.origWidth,
      height: draft.origHeight,
      format: draft.format,
      bytes: 245760,
    },
    draft: { ...draft },
    buttons: [{ id: "apply", title: "Apply", isEnabled: true }],
    defaultButtonID: "apply",
  },
];
