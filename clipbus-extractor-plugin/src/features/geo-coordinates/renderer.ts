import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeGeoPayload } from "./payload.ts";

export function createGeoRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeGeoPayload(input?.attachment?.payloadJson);
      if (!payload) {
        return { displayName: "Coordinates", tintHex: "#888888", shouldDisplay: false };
      }
      return { displayName: "Coordinates", tintHex: "#16A34A" };
    },
  };
}
