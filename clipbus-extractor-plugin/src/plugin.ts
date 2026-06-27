import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createEntitiesDetector } from "./features/entities-renderer/detector.ts";
import { createEntitiesRenderer } from "./features/entities-renderer/renderer.ts";
import { createGeoDetector } from "./features/geo-coordinates/detector.ts";
import { createGeoRenderer } from "./features/geo-coordinates/renderer.ts";
import { createIpDetector } from "./features/ip-details/detector.ts";
import { createIpRenderer } from "./features/ip-details/renderer.ts";
import { createMacDetector } from "./features/mac-address/detector.ts";
import { createMacRenderer } from "./features/mac-address/renderer.ts";
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
        "geo-coordinates": createGeoRenderer(),
        "mac-address": createMacRenderer(),
      },
      detectors: {
        "entities-detector": createEntitiesDetector(),
        "url-detector": createUrlDetector(),
        "ip-detector": createIpDetector(),
        "geo-detector": createGeoDetector(),
        "mac-detector": createMacDetector(),
      },
      actions: {
        "regex-tool": createRegexAction(),
      },
      messageHandlers: {},
    };
  },
});
