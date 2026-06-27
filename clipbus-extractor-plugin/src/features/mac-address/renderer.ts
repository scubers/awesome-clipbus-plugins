import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeMacPayload } from "./payload.ts";

export function createMacRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeMacPayload(input?.attachment?.payloadJson);
      if (!payload) {
        return { displayName: "MAC Address", tintHex: "#888888", shouldDisplay: false };
      }
      return { displayName: "MAC Address", tintHex: "#7C3AED" };
    },
  };
}
