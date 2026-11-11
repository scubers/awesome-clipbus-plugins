import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createBase64Detector } from "./features/base64-renderer/detector.ts";
import { createJwtDetector } from "./features/jwt-renderer/detector.ts";
import { createXmlDetector } from "./features/xml-renderer/detector.ts";
import { createCsvDetector } from "./features/csv-table/detector.ts";
import { createTimestampDetector } from "./features/timestamp-renderer/detector.ts";
import { createRadixDetector } from "./features/radix-renderer/detector.ts";
import { createDurationDetector } from "./features/duration/detector.ts";
import { createEntitiesDetector } from "./features/entities-renderer/detector.ts";
import { createUrlDetector } from "./features/url-parsed/detector.ts";
import { createIpDetector } from "./features/ip-details/detector.ts";
import { createGeoDetector } from "./features/geo-coordinates/detector.ts";
import { createMacDetector } from "./features/mac-address/detector.ts";
import { createUuidDetector } from "./features/uuid-details/detector.ts";
import { createMarkdownDetector } from "./features/markdown-renderer/detector.ts";
import { createRichTextDetector } from "./features/rich-text/detector.ts";
import { createGradientDetector } from "./features/gradient-swatch/detector.ts";
import { createCronDetector } from "./features/cron-renderer/detector.ts";
import { escapeActions } from "./features/escape-tool/action.ts";
import { caseActions } from "./features/case-tool/action.ts";
import { createPrettyJsonAction, createMinifyJsonAction, createYamlAction } from "./features/json-tool/action.ts";
import { createSortAction } from "./features/line-tools/sort.ts";
import { createDedupAction } from "./features/line-tools/dedup.ts";
import { createTrimAction } from "./features/line-tools/trim.ts";
import { createStripAnsiAction } from "./features/line-tools/strip-ansi.ts";
import { createReverseLinesAction } from "./features/line-tools/reverse-lines.ts";
import { createReverseCharactersAction } from "./features/line-tools/reverse-characters.ts";
import { createSortCharactersAction } from "./features/line-tools/sort-characters.ts";

export default definePlugin({
  detectors: {
    "base64-detector": createBase64Detector(),
    "jwt-detector": createJwtDetector(),
    "xml-detector": createXmlDetector(),
    "csv-detector": createCsvDetector(),
    "timestamp-detector": createTimestampDetector(),
    "radix-detector": createRadixDetector(),
    "duration-detector": createDurationDetector(),
    "entities-detector": createEntitiesDetector(),
    "url-detector": createUrlDetector(),
    "ip-detector": createIpDetector(),
    "geo-detector": createGeoDetector(),
    "mac-detector": createMacDetector(),
    "uuid-detector": createUuidDetector(),
    "markdown-detector": createMarkdownDetector(),
    "rich-text-detector": createRichTextDetector(),
    "gradient-detector": createGradientDetector(),
    "cron-detector": createCronDetector(),
  },
  actions: {
    ...escapeActions,
    ...caseActions,
    "text-sort": createSortAction(),
    "text-dedup": createDedupAction(),
    "text-trim": createTrimAction(),
    "text-strip-ansi": createStripAnsiAction(),
    "text-reverse-lines": createReverseLinesAction(),
    "text-reverse-characters": createReverseCharactersAction(),
    "text-sort-characters": createSortCharactersAction(),
    "text-pretty-json": createPrettyJsonAction(),
    "text-minify-json": createMinifyJsonAction(),
    "json-to-yaml": createYamlAction(),
  },
});
