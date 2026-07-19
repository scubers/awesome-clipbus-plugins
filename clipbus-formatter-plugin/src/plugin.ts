import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createJsonDetector } from "./features/json-renderer/detector.ts";
import { createJsonRenderer } from "./features/json-renderer/renderer.ts";
import { createXmlDetector } from "./features/xml-renderer/detector.ts";
import { createXmlRenderer } from "./features/xml-renderer/renderer.ts";
import { createCsvDetector } from "./features/csv-table/detector.ts";
import { createCsvRenderer } from "./features/csv-table/renderer.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "json-renderer": createJsonRenderer(),
        "xml-renderer": createXmlRenderer(),
        "csv-table": createCsvRenderer(),
      },
      detectors: {
        "json-detector": createJsonDetector(),
        "xml-detector": createXmlDetector(),
        "csv-detector": createCsvDetector(),
      },
      actions: {},
      messageHandlers: {},
    };
  },
});
