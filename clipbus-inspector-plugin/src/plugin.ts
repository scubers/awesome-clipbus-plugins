import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createTextStatsDetector } from "./features/text-stats-renderer/detector.ts";
import { createTextStatsRenderer } from "./features/text-stats-renderer/renderer.ts";
import { createDiffDetector } from "./features/diff-renderer/detector.ts";
import { createDiffRenderer } from "./features/diff-renderer/renderer.ts";
import { createImageInfoDetector } from "./features/image-info-renderer/detector.ts";
import { createImageInfoRenderer } from "./features/image-info-renderer/renderer.ts";
import { createCharInfoDetector } from "./features/char-info-renderer/detector.ts";
import { createCharInfoRenderer } from "./features/char-info-renderer/renderer.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "text-stats-renderer": createTextStatsRenderer(),
        "diff-renderer": createDiffRenderer(),
        "image-info-renderer": createImageInfoRenderer(),
        "char-info-renderer": createCharInfoRenderer(),
      },
      detectors: {
        "text-stats-detector": createTextStatsDetector(),
        "diff-detector": createDiffDetector(),
        "image-info-detector": createImageInfoDetector(),
        "char-info-detector": createCharInfoDetector(),
      },
      actions: {},
      messageHandlers: {},
    };
  },
});
