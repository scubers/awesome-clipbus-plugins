import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeGradientPayload } from "./payload.ts";

export function createGradientRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeGradientPayload(input?.attachment?.payloadJson);
      if (!payload) {
        return { displayName: "Gradient", shouldDisplay: false };
      }
      return { displayName: "Gradient" };
    },
  };
}
