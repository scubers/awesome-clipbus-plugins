import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createColorDetector } from "./features/color-swatch/detector.ts";
import { createColorRenderer } from "./features/color-swatch/renderer.ts";
import { createMarkdownDetector } from "./features/markdown-renderer/detector.ts";
import { createMarkdownRenderer } from "./features/markdown-renderer/renderer.ts";
import { createGradientDetector } from "./features/gradient-swatch/detector.ts";
import { createGradientRenderer } from "./features/gradient-swatch/renderer.ts";
import { createQrDetector } from "./features/qr-code/detector.ts";
import { createQrRenderer } from "./features/qr-code/renderer.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "color-swatch": createColorRenderer(),
        "markdown-renderer": createMarkdownRenderer(),
        "gradient-swatch": createGradientRenderer(),
        "qr-code": createQrRenderer(),
      },
      detectors: {
        "color-detector": createColorDetector(),
        "markdown-detector": createMarkdownDetector(),
        "gradient-detector": createGradientDetector(),
        "qr-detector": createQrDetector(),
      },
      actions: {},
      messageHandlers: {},
    };
  },
});
