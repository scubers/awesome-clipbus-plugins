import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeUuidPayload } from "./payload.ts";

export function createUuidRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeUuidPayload(input?.attachment?.payloadJson);
      if (!payload) {
        return { displayName: "UUID", tintHex: "#888888", shouldDisplay: false };
      }
      return { displayName: "UUID", tintHex: "#7C3AED" };
    },
  };
}
