import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeDurationPayload } from "./payload.ts";

export function createDurationRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeDurationPayload(input?.attachment?.payloadJson);
      if (!payload)
        return { displayName: "Duration", tintHex: "#7C3AED", shouldDisplay: false };
      return { displayName: "Duration", tintHex: "#7C3AED" };
    },
  };
}
