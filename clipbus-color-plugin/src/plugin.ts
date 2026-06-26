import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createColorDetector } from "./features/color-swatch/detector.ts";
import { createColorRenderer } from "./features/color-swatch/renderer.ts";
import { createColorAction } from "./features/color-swatch/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "color-swatch": createColorRenderer(),
      },
      detectors: {
        "color-detector": createColorDetector(),
      },
      actions: {
        "color-copy": createColorAction(),
      },
      messageHandlers: {},
    };
  },
});
