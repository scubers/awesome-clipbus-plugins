import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeJwtPayload } from "./payload.ts";

export function createJwtRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(input: PluginResolveAttachmentInput): Promise<PluginAttachmentResolveResult> {
      const payload = decodeJwtPayload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "JWT", tintHex: "#7C3AED", shouldDisplay: false };
      return { displayName: "JWT Decoded", tintHex: "#7C3AED" };
    },
  };
}
