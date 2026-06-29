import type { PluginAttachmentRendererHandler, PluginResolveAttachmentInput, PluginAttachmentResolveResult } from "@clipbus/plugin-sdk/runtime";
import { decodeSecretPayload } from "./payload.ts";

export function createSecretRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(input: PluginResolveAttachmentInput): Promise<PluginAttachmentResolveResult> {
      const payload = decodeSecretPayload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "Sensitive Data", tintHex: "#dc2626", shouldDisplay: false };
      return { displayName: "Sensitive Data", tintHex: "#dc2626" };
    },
  };
}
