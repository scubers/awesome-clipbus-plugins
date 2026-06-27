import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createEscapeAction } from "./features/escape-tool/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {},
      detectors: {},
      actions: {
        "escape-tool": createEscapeAction(),
      },
      messageHandlers: {},
    };
  },
});
