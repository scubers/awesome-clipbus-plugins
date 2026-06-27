import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createCronDetector } from "./features/cron-renderer/detector.ts";
import { createCronRenderer } from "./features/cron-renderer/renderer.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "cron-renderer": createCronRenderer(),
      },
      detectors: {
        "cron-detector": createCronDetector(),
      },
      actions: {},
      messageHandlers: {},
    };
  },
});
