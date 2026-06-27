import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createEntitiesDetector } from "./features/entities-renderer/detector.ts";
import { createEntitiesRenderer } from "./features/entities-renderer/renderer.ts";
import { createIpDetector } from "./features/ip-details/detector.ts";
import { createIpRenderer } from "./features/ip-details/renderer.ts";
import { createRegexAction } from "./features/regex-tool/action.ts";
import { createUrlDetector } from "./features/url-parsed/detector.ts";
import { createUrlRenderer } from "./features/url-parsed/renderer.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "entities-renderer": createEntitiesRenderer(),
        "url-parsed": createUrlRenderer(),
        "ip-details": createIpRenderer(),
      },
      detectors: {
        "entities-detector": createEntitiesDetector(),
        "url-detector": createUrlDetector(),
        "ip-detector": createIpDetector(),
      },
      actions: {
        "regex-tool": createRegexAction(),
      },
      messageHandlers: {},
    };
  },
});
