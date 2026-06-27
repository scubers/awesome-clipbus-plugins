import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeXmlPayload } from "./payload.ts";

export function createXmlRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(input: PluginResolveAttachmentInput): Promise<PluginAttachmentResolveResult> {
      const payload = decodeXmlPayload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "XML", tintHex: "#7C3AED", shouldDisplay: false };
      return { displayName: "XML 格式化", tintHex: "#7C3AED" };
    },
  };
}
