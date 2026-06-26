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
        return { displayName: "URL", tintHex: "#888888", shouldDisplay: false };
      }
      return { displayName: "URL", tintHex: "#2563EB" };
    },
  };
}
