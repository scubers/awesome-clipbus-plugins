import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeIpPayload } from "./payload.ts";

export function createIpRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeIpPayload(input?.attachment?.payloadJson);
      if (!payload) {
        return { displayName: "IP Address", tintHex: "#888888", shouldDisplay: false };
      }
      return { displayName: "IP Address", tintHex: "#0891B2" };
    },
  };
}
