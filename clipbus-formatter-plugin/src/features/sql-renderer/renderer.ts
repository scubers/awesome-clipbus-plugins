import type {
  PluginAttachmentRendererHandler,
  PluginResolveAttachmentInput,
  PluginAttachmentResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { decodeSqlPayload } from "./payload.ts";

export function createSqlRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(input: PluginResolveAttachmentInput): Promise<PluginAttachmentResolveResult> {
      const payload = decodeSqlPayload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "SQL", tintHex: "#0369A1", shouldDisplay: false };
      return { displayName: "SQL Formatter", tintHex: "#0369A1" };
    },
  };
}
