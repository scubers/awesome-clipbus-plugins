import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createEntitiesDetector } from "./features/entities-renderer/detector.ts";
import { createEntitiesRenderer } from "./features/entities-renderer/renderer.ts";
import { createRegexAction } from "./features/regex-tool/action.ts";
import { createUrlDetector } from "./features/url-parsed/detector.ts";
import { createUrlRenderer } from "./features/url-parsed/renderer.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "entities-renderer": createEntitiesRenderer(),
        "url-parsed": createUrlRenderer(),
      },
      detectors: {
        "entities-detector": createEntitiesDetector(),
        "url-detector": createUrlDetector(),
      },
      actions: {
        "regex-tool": createRegexAction(),
      },
      messageHandlers: {},
    };
  },
});
