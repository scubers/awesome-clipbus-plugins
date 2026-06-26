import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createJsonDetector } from "./features/json-renderer/detector.ts";
import { createJsonRenderer } from "./features/json-renderer/renderer.ts";
import { createJsonCopyAction } from "./features/json-renderer/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "json-renderer": createJsonRenderer(),
      },
      detectors: {
        "json-detector": createJsonDetector(),
      },
      actions: {
        "json-copy": createJsonCopyAction(),
      },
      messageHandlers: {},
    };
  },
});
