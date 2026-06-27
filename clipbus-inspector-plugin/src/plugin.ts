import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createTextStatsDetector } from "./features/text-stats-renderer/detector.ts";
import { createTextStatsRenderer } from "./features/text-stats-renderer/renderer.ts";
import { createDiffDetector } from "./features/diff-renderer/detector.ts";
import { createDiffRenderer } from "./features/diff-renderer/renderer.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "text-stats-renderer": createTextStatsRenderer(),
        "diff-renderer": createDiffRenderer(),
      },
      detectors: {
        "text-stats-detector": createTextStatsDetector(),
        "diff-detector": createDiffDetector(),
      },
      actions: {},
      messageHandlers: {},
    };
  },
});
