import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createVibeDetector } from "./features/vibe-fallback/detector";
import { createVibeRenderer } from "./features/vibe-fallback/renderer";

export default definePlugin({
  setup() {
    return {
      detectors:           { "vibe-detector": createVibeDetector() },
      attachmentRenderers: { "vibe-fallback":  createVibeRenderer() },
      actions:             {},
      messageHandlers:     {},
    };
  },
});
