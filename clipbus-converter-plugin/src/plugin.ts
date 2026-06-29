import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createTimestampDetector } from "./features/timestamp-renderer/detector.ts";
import { createTimestampRenderer } from "./features/timestamp-renderer/renderer.ts";
import { createRadixDetector } from "./features/radix-renderer/detector.ts";
import { createRadixRenderer } from "./features/radix-renderer/renderer.ts";
import { createCaseAction } from "./features/case-tool/action.ts";
import { createDurationDetector } from "./features/duration/detector.ts";
import { createDurationRenderer } from "./features/duration/renderer.ts";
import { createTemperatureDetector } from "./features/temperature/detector.ts";
import { createTemperatureRenderer } from "./features/temperature/renderer.ts";
import { createFilesizeDetector } from "./features/filesize-renderer/detector.ts";
import { createFilesizeRenderer } from "./features/filesize-renderer/renderer.ts";
import { createChmodDetector } from "./features/chmod-renderer/detector.ts";
import { createChmodRenderer } from "./features/chmod-renderer/renderer.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "timestamp-renderer": createTimestampRenderer(),
        "radix-renderer": createRadixRenderer(),
        "duration": createDurationRenderer(),
        "temperature": createTemperatureRenderer(),
        "filesize-renderer": createFilesizeRenderer(),
        "chmod-renderer": createChmodRenderer(),
      },
      detectors: {
        "timestamp-detector": createTimestampDetector(),
        "radix-detector": createRadixDetector(),
        "duration-detector": createDurationDetector(),
        "temperature-detector": createTemperatureDetector(),
        "filesize-detector": createFilesizeDetector(),
        "chmod-detector": createChmodDetector(),
      },
      actions: {
        "case-tool": createCaseAction(),
      },
      messageHandlers: {},
    };
  },
});
