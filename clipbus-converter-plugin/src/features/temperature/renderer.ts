import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeTemperaturePayload } from "./payload.ts";

export function createTemperatureRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeTemperaturePayload(input?.attachment?.payloadJson);
      if (!payload)
        return { displayName: "Temperature", tintHex: "#EF4444", shouldDisplay: false };
      return { displayName: "Temperature", tintHex: "#EF4444" };
    },
  };
}
