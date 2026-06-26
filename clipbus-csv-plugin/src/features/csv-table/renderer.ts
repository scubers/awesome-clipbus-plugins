import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeCsvPayload } from "./payload.ts";

export function createCsvRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeCsvPayload(input?.attachment?.payloadJson);
      if (!payload) {
        return { displayName: "CSV", tintHex: "#0F766E", shouldDisplay: false };
      }
      return { displayName: "CSV", tintHex: "#0F766E" };
    },
  };
}
