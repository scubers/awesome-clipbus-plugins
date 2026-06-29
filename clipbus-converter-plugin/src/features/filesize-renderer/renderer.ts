import type { PluginAttachmentRendererHandler, PluginResolveAttachmentInput, PluginAttachmentResolveResult } from "@clipbus/plugin-sdk/runtime";
import { decodeFilesizePayload } from "./payload.ts";

export function createFilesizeRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(input: PluginResolveAttachmentInput): Promise<PluginAttachmentResolveResult> {
      const payload = decodeFilesizePayload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "Data Size", tintHex: "#0369A1", shouldDisplay: false };
      return { displayName: "Data Size", tintHex: "#0369A1" };
    },
  };
}
