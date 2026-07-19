import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeUrlPayload } from "./payload.ts";

export function createUrlRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeUrlPayload(input?.attachment?.payloadJson);
      if (!payload) {
        return { displayName: "URL Details", tintHex: "#888888", shouldDisplay: false };
      }
      return {
        displayName: payload.inputType === "query" ? "Query String" : "URL Details",
        tintHex: "#2563EB",
      };
    },
  };
}
