import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createDiffDetector } from "./features/diff-renderer/detector.ts";
import { createDiffRenderer } from "./features/diff-renderer/renderer.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "diff-renderer": createDiffRenderer(),
      },
      detectors: {
        "diff-detector": createDiffDetector(),
      },
      actions: {},
      messageHandlers: {},
    };
  },
});
