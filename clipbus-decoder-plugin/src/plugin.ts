import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createBase64Detector } from "./features/base64-renderer/detector.ts";
import { createBase64Renderer } from "./features/base64-renderer/renderer.ts";
import { createBase64CopyAction } from "./features/base64-renderer/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "base64-renderer": createBase64Renderer(),
      },
      detectors: {
        "base64-detector": createBase64Detector(),
      },
      actions: {
        "base64-copy": createBase64CopyAction(),
      },
      messageHandlers: {},
    };
  },
});
