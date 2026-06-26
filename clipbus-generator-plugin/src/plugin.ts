import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createGenAction } from "./features/gen-tool/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {},
      detectors: {},
      actions: {
        "gen-tool": createGenAction(),
      },
      messageHandlers: {},
    };
  },
});
