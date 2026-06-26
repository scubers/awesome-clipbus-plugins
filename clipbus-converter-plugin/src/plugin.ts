import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createTimestampDetector } from "./features/timestamp-renderer/detector.ts";
import { createTimestampRenderer } from "./features/timestamp-renderer/renderer.ts";
import { createTimestampCopyAction } from "./features/timestamp-renderer/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "timestamp-renderer": createTimestampRenderer(),
      },
      detectors: {
        "timestamp-detector": createTimestampDetector(),
      },
      actions: {
        "timestamp-copy": createTimestampCopyAction(),
      },
      messageHandlers: {},
    };
  },
});
