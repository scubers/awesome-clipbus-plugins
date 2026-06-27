import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createUrlDetector } from "./features/url-parsed/detector.ts";
import { createUrlRenderer } from "./features/url-parsed/renderer.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "url-parsed": createUrlRenderer(),
      },
      detectors: {
        "url-detector": createUrlDetector(),
      },
      actions: {},
      messageHandlers: {},
    };
  },
});
