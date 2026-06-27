import type { PluginAttachmentRendererHandler, PluginResolveAttachmentInput, PluginAttachmentResolveResult } from "@clipbus/plugin-sdk/runtime";
import { decodeEntitiesPayload } from "./payload.ts";

export function createEntitiesRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(input: PluginResolveAttachmentInput): Promise<PluginAttachmentResolveResult> {
      const payload = decodeEntitiesPayload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "Extracted Entities", tintHex: "#2563EB", shouldDisplay: false };
      return { displayName: "Extracted Entities", tintHex: "#2563EB" };
    },
  };
}
