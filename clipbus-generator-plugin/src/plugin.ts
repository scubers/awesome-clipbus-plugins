import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createGenAction } from "./features/gen-tool/action.ts";
import { createLoremAction } from "./features/lorem-tool/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {},
      detectors: {},
      actions: {
        "gen-tool": createGenAction(),
        "lorem-tool": createLoremAction(),
      },
      messageHandlers: {},
    };
  },
});
