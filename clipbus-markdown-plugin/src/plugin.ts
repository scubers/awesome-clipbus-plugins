import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createMarkdownDetector } from "./features/markdown-renderer/detector.ts";
import { createMarkdownRenderer } from "./features/markdown-renderer/renderer.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "markdown-renderer": createMarkdownRenderer(),
      },
      detectors: {
        "markdown-detector": createMarkdownDetector(),
      },
      actions: {},
      messageHandlers: {},
    };
  },
});
