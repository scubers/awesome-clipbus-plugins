import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import {
  imageEditAction,
  imageEditMessageHandlers,
} from "./features/image-edit/feature.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {},
      detectors: {},
      actions: { "image-edit": imageEditAction },
      messageHandlers: imageEditMessageHandlers,
    };
  },
});
