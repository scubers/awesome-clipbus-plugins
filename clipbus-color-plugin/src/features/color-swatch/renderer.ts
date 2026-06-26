import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeColorPayload } from "./payload.ts";

export function createColorRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeColorPayload(input?.attachment?.payloadJson);
      if (!payload) {
        return { displayName: "Color", tintHex: "#888888", shouldDisplay: false };
      }
      return { displayName: "Color", tintHex: payload.hex };
    },
  };
}
