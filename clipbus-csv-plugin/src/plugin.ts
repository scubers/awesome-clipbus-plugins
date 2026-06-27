import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createCsvDetector } from "./features/csv-table/detector.ts";
import { createCsvRenderer } from "./features/csv-table/renderer.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "csv-table": createCsvRenderer(),
      },
      detectors: {
        "csv-detector": createCsvDetector(),
      },
      actions: {},
      messageHandlers: {},
    };
  },
});
