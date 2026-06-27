import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeRadixPayload } from "./payload.ts";

export function createRadixRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(input: PluginResolveAttachmentInput): Promise<PluginAttachmentResolveResult> {
      const payload = decodeRadixPayload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "进制转换", tintHex: "#4F46E5", shouldDisplay: false };
      return { displayName: "进制转换", tintHex: "#4F46E5" };
    },
  };
}
