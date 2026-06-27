import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createColorDetector } from "./features/color-swatch/detector.ts";
import { createColorRenderer } from "./features/color-swatch/renderer.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "color-swatch": createColorRenderer(),
      },
      detectors: {
        "color-detector": createColorDetector(),
      },
      actions: {},
      messageHandlers: {},
    };
  },
});
