import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createEntitiesDetector } from "./features/entities-renderer/detector.ts";
import { createEntitiesRenderer } from "./features/entities-renderer/renderer.ts";
import { createEntitiesCopyAction } from "./features/entities-renderer/action.ts";
import { createRegexAction } from "./features/regex-tool/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "entities-renderer": createEntitiesRenderer(),
      },
      detectors: {
        "entities-detector": createEntitiesDetector(),
      },
      actions: {
        "entities-copy": createEntitiesCopyAction(),
        "regex-tool": createRegexAction(),
      },
      messageHandlers: {},
    };
  },
});
