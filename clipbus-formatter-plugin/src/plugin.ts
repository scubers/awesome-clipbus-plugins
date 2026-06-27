import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createJsonDetector } from "./features/json-renderer/detector.ts";
import { createJsonRenderer } from "./features/json-renderer/renderer.ts";
import { createJsonCopyAction } from "./features/json-renderer/action.ts";
import { createXmlDetector } from "./features/xml-renderer/detector.ts";
import { createXmlRenderer } from "./features/xml-renderer/renderer.ts";
import { createXmlCopyAction } from "./features/xml-renderer/action.ts";
import { createSqlDetector } from "./features/sql-renderer/detector.ts";
import { createSqlRenderer } from "./features/sql-renderer/renderer.ts";
import { createSqlCopyAction } from "./features/sql-renderer/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "json-renderer": createJsonRenderer(),
        "xml-renderer": createXmlRenderer(),
        "sql-renderer": createSqlRenderer(),
      },
      detectors: {
        "json-detector": createJsonDetector(),
        "xml-detector": createXmlDetector(),
        "sql-detector": createSqlDetector(),
      },
      actions: {
        "json-copy": createJsonCopyAction(),
        "xml-copy": createXmlCopyAction(),
        "sql-copy": createSqlCopyAction(),
      },
      messageHandlers: {},
    };
  },
});
