import type { PluginAttachmentRendererHandler, PluginResolveAttachmentInput, PluginAttachmentResolveResult } from "@clipbus/plugin-sdk/runtime";
import { decodeTimestampPayload } from "./payload.ts";

export function createTimestampRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(input: PluginResolveAttachmentInput): Promise<PluginAttachmentResolveResult> {
      const payload = decodeTimestampPayload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "Unix Timestamp", tintHex: "#0F766E", shouldDisplay: false };
      return { displayName: "Unix Timestamp Converter", tintHex: "#0F766E" };
    },
  };
}
