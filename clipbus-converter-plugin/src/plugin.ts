import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createTimestampDetector } from "./features/timestamp-renderer/detector.ts";
import { createTimestampRenderer } from "./features/timestamp-renderer/renderer.ts";
import { createRadixDetector } from "./features/radix-renderer/detector.ts";
import { createRadixRenderer } from "./features/radix-renderer/renderer.ts";
import { createCaseAction } from "./features/case-tool/action.ts";
import { createDurationDetector } from "./features/duration/detector.ts";
import { createDurationRenderer } from "./features/duration/renderer.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "timestamp-renderer": createTimestampRenderer(),
        "radix-renderer": createRadixRenderer(),
        "duration": createDurationRenderer(),
      },
      detectors: {
        "timestamp-detector": createTimestampDetector(),
        "radix-detector": createRadixDetector(),
        "duration-detector": createDurationDetector(),
      },
      actions: {
        "case-tool": createCaseAction(),
      },
      messageHandlers: {},
    };
  },
});
