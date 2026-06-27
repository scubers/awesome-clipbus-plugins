import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createRegexAction } from "./features/regex-tool/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {},
      detectors: {},
      actions: {
        "regex-tool": createRegexAction(),
      },
      messageHandlers: {},
    };
  },
});
