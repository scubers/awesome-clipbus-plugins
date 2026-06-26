import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createTextStatsDetector } from "./features/text-stats-renderer/detector.ts";
import { createTextStatsRenderer } from "./features/text-stats-renderer/renderer.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "text-stats-renderer": createTextStatsRenderer(),
      },
      detectors: {
        "text-stats-detector": createTextStatsDetector(),
      },
      actions: {},
      messageHandlers: {},
    };
  },
});
