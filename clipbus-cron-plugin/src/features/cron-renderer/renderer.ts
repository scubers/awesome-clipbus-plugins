import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeCronPayload } from "./payload.ts";

const TINT = "#B45309";

export function createCronRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(
      input: PluginResolveAttachmentInput,
    ): Promise<PluginAttachmentResolveResult> {
      const payload = decodeCronPayload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "Cron", tintHex: TINT, shouldDisplay: false };
      return { displayName: "Cron Schedule", tintHex: TINT };
    },
  };
}
