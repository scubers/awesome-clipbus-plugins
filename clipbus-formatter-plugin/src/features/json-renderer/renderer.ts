import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeJsonPayload } from "./payload.ts";

export function createJsonRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeJsonPayload(input?.attachment?.payloadJson);
      if (!payload) {
        return { displayName: "JSON", tintHex: "#7C3AED", shouldDisplay: false };
      }
      return { displayName: payload.display.typeLabel, tintHex: "#7C3AED" };
    },
  };
}
