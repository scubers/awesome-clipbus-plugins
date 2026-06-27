import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createSqlDetector } from "./features/sql-renderer/detector.ts";
import { createSqlRenderer } from "./features/sql-renderer/renderer.ts";
import { createSqlCopyAction } from "./features/sql-renderer/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "sql-renderer": createSqlRenderer(),
      },
      detectors: {
        "sql-detector": createSqlDetector(),
      },
      actions: {
        "sql-copy": createSqlCopyAction(),
      },
      messageHandlers: {},
    };
  },
});
