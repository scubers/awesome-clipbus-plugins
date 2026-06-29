import type { PluginAttachmentRendererHandler, PluginResolveAttachmentInput, PluginAttachmentResolveResult } from "@clipbus/plugin-sdk/runtime";
import { decodeChmodPayload } from "./payload.ts";

export function createChmodRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(input: PluginResolveAttachmentInput): Promise<PluginAttachmentResolveResult> {
      const payload = decodeChmodPayload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "File Permissions", tintHex: "#475569", shouldDisplay: false };
      return { displayName: "File Permissions", tintHex: "#475569" };
    },
  };
}
