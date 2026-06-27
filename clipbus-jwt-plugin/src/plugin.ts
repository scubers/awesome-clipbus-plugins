import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createJwtDetector } from "./features/jwt-renderer/detector.ts";
import { createJwtRenderer } from "./features/jwt-renderer/renderer.ts";
import { createJwtCopyAction } from "./features/jwt-renderer/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "jwt-renderer": createJwtRenderer(),
      },
      detectors: {
        "jwt-detector": createJwtDetector(),
      },
      actions: {
        "jwt-copy": createJwtCopyAction(),
      },
      messageHandlers: {},
    };
  },
});
