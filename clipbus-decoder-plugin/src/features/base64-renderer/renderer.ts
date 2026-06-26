import type { PluginAttachmentRendererHandler, PluginResolveAttachmentInput, PluginAttachmentResolveResult } from "@clipbus/plugin-sdk/runtime";
import { decodeBase64Payload } from "./payload.ts";

export function createBase64Renderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(input: PluginResolveAttachmentInput): Promise<PluginAttachmentResolveResult> {
      const payload = decodeBase64Payload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "Base64", tintHex: "#0F766E", shouldDisplay: false };
      return { displayName: "Base64 解码", tintHex: "#0F766E" };
    },
  };
}
