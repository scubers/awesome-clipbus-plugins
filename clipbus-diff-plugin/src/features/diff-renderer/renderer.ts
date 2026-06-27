import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeDiffPayload } from "./payload.ts";

export function createDiffRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeDiffPayload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "Diff", tintHex: "#0F766E", shouldDisplay: false };
      return {
        displayName: `+${payload.additions} −${payload.deletions}`,
        tintHex: "#0F766E",
      };
    },
  };
}
