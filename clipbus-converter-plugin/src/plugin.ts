import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createTimestampDetector } from "./features/timestamp-renderer/detector.ts";
import { createTimestampRenderer } from "./features/timestamp-renderer/renderer.ts";
import { createTimestampCopyAction } from "./features/timestamp-renderer/action.ts";
import { createRadixDetector } from "./features/radix-renderer/detector.ts";
import { createRadixRenderer } from "./features/radix-renderer/renderer.ts";
import { createRadixCopyAction } from "./features/radix-renderer/action.ts";
import { createCaseAction } from "./features/case-tool/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "timestamp-renderer": createTimestampRenderer(),
        "radix-renderer": createRadixRenderer(),
      },
      detectors: {
        "timestamp-detector": createTimestampDetector(),
        "radix-detector": createRadixDetector(),
      },
      actions: {
        "timestamp-copy": createTimestampCopyAction(),
        "radix-copy": createRadixCopyAction(),
        "case-tool": createCaseAction(),
      },
      messageHandlers: {},
    };
  },
});
