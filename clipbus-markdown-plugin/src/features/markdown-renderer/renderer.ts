import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeMarkdownPayload } from "./payload.ts";

const TINT_HEX = "#0EA5E9";

export function createMarkdownRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(input: PluginResolveAttachmentInput): Promise<PluginAttachmentResolveResult> {
      const payload = decodeMarkdownPayload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "Markdown", tintHex: TINT_HEX, shouldDisplay: false };
      return { displayName: "Markdown 预览", tintHex: TINT_HEX };
    },
  };
}
