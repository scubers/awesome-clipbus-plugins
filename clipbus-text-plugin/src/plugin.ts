import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createSortAction } from "./features/line-tools/sort.ts";
import { createDedupAction } from "./features/line-tools/dedup.ts";
import { createTrimAction } from "./features/line-tools/trim.ts";
import { createStripAnsiAction } from "./features/line-tools/strip-ansi.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {},
      detectors: {},
      actions: {
        "text-sort": createSortAction(),
        "text-dedup": createDedupAction(),
        "text-trim": createTrimAction(),
        "text-strip-ansi": createStripAnsiAction(),
      },
      messageHandlers: {},
    };
  },
});
