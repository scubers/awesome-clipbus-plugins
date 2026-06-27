import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createXmlDetector } from "./features/xml-renderer/detector.ts";
import { createXmlRenderer } from "./features/xml-renderer/renderer.ts";
import { createXmlCopyAction } from "./features/xml-renderer/action.ts";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {
        "xml-renderer": createXmlRenderer(),
      },
      detectors: {
        "xml-detector": createXmlDetector(),
      },
      actions: {
        "xml-copy": createXmlCopyAction(),
      },
      messageHandlers: {},
    };
  },
});
