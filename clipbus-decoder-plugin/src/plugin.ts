import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createBase64Detector } from "./features/base64-renderer/detector.ts";
import { createBase64Renderer } from "./features/base64-renderer/renderer.ts";
import { createBase64CopyAction } from "./features/base64-renderer/action.ts";
import { createJwtDetector } from "./features/jwt-renderer/detector.ts";
import { createJwtRenderer } from "./features/jwt-renderer/renderer.ts";
import { createJwtCopyAction } from "./features/jwt-renderer/action.ts";
import { createEscapeAction } from "./features/escape-tool/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "base64-renderer": createBase64Renderer(),
        "jwt-renderer": createJwtRenderer(),
      },
      detectors: {
        "base64-detector": createBase64Detector(),
        "jwt-detector": createJwtDetector(),
      },
      actions: {
        "base64-copy": createBase64CopyAction(),
        "jwt-copy": createJwtCopyAction(),
        "escape-tool": createEscapeAction(),
      },
      messageHandlers: {},
    };
  },
});
