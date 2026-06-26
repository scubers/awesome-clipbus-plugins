import type { PluginAttachmentRendererHandler, PluginResolveAttachmentInput, PluginAttachmentResolveResult } from "@clipbus/plugin-sdk/runtime";
import { decodeTextStatsPayload } from "./payload.ts";

export function createTextStatsRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(input: PluginResolveAttachmentInput): Promise<PluginAttachmentResolveResult> {
      const payload = decodeTextStatsPayload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "文本统计", tintHex: "#7C3AED", shouldDisplay: false };
      return { displayName: "文本统计", tintHex: "#7C3AED" };
    },
  };
}
