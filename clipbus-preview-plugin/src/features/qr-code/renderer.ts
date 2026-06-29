import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeQrPayload } from "./payload.ts";

export function createQrRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeQrPayload(input?.attachment?.payloadJson);
      if (!payload) {
        return { displayName: "QR Code", tintHex: "#1a1a1a", shouldDisplay: false };
      }
      return { displayName: payload.display.headline };
    },
  };
}
