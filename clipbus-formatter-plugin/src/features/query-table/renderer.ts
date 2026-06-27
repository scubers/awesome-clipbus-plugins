import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeQueryPayload } from "./payload.ts";

export function createQueryRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeQueryPayload(input?.attachment?.payloadJson);
      if (!payload) {
        return { displayName: "Query String", shouldDisplay: false };
      }
      return { displayName: "Query String" };
    },
  };
}
