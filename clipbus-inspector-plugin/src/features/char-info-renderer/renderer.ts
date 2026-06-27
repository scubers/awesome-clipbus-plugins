import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeCharPayload } from "./payload.ts";

export function createCharInfoRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeCharPayload(input?.attachment?.payloadJson);
      if (!payload)
        return { displayName: "Character", tintHex: "#7c3aed", shouldDisplay: false };
      return { displayName: "Character", tintHex: "#7c3aed" };
    },
  };
}
