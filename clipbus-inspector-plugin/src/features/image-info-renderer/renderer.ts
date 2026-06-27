import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeImageInfoPayload } from "./payload.ts";

export function createImageInfoRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeImageInfoPayload(input?.attachment?.payloadJson);
      if (!payload)
        return { displayName: "Image Details", tintHex: "#0369a1", shouldDisplay: false };
      return { displayName: "Image Details", tintHex: "#0369a1" };
    },
  };
}
