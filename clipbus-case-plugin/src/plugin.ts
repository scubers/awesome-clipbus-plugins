import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createCaseAction } from "./features/case-tool/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {},
      detectors: {},
      actions: {
        "case-tool": createCaseAction(),
      },
      messageHandlers: {},
    };
  },
});
