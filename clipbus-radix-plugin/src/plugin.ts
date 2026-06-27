import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createRadixDetector } from "./features/radix-renderer/detector.ts";
import { createRadixRenderer } from "./features/radix-renderer/renderer.ts";
import { createRadixCopyAction } from "./features/radix-renderer/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "radix-renderer": createRadixRenderer(),
      },
      detectors: {
        "radix-detector": createRadixDetector(),
      },
      actions: {
        "radix-copy": createRadixCopyAction(),
      },
      messageHandlers: {},
    };
  },
});
