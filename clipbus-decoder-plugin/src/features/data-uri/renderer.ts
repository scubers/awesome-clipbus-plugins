import type { PluginAttachmentRendererHandler, PluginResolveAttachmentInput, PluginAttachmentResolveResult } from "@clipbus/plugin-sdk/runtime";
import { decodeDataUriPayload } from "./payload.ts";

export function createDataUriRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(input: PluginResolveAttachmentInput): Promise<PluginAttachmentResolveResult> {
      const payload = decodeDataUriPayload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "Data URI", tintHex: "#0369A1", shouldDisplay: false };
      return { displayName: "Data URI", tintHex: "#0369A1" };
    },
  };
}
