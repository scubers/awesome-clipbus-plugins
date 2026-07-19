import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createBase64Detector } from "./features/base64-renderer/detector.ts";
import { createBase64Renderer } from "./features/base64-renderer/renderer.ts";
import { createJwtDetector } from "./features/jwt-renderer/detector.ts";
import { createJwtRenderer } from "./features/jwt-renderer/renderer.ts";
import { createDataUriDetector } from "./features/data-uri/detector.ts";
import { createDataUriRenderer } from "./features/data-uri/renderer.ts";
import { escapeActions } from "./features/escape-tool/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "base64-renderer": createBase64Renderer(),
        "jwt-renderer": createJwtRenderer(),
        "data-uri": createDataUriRenderer(),
      },
      detectors: {
        "base64-detector": createBase64Detector(),
        "jwt-detector": createJwtDetector(),
        "data-uri-detector": createDataUriDetector(),
      },
      actions: escapeActions,
      messageHandlers: {},
    };
  },
});
