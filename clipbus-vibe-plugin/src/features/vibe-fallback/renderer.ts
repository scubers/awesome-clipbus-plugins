import type { PluginAttachmentRendererHandler, PluginResolveAttachmentInput, PluginAttachmentResolveResult } from "@clipbus/plugin-sdk/runtime";
import { decodeVibePayload } from "./payload.ts";

const NAMESPACE = "plugin.vibe.";

function resolveAttachment(input: PluginResolveAttachmentInput): PluginAttachmentResolveResult {
  // 让位：item 上若存在任一"非本插件命名空间"的附件 → 有更专业的展示，本卡不显示
  const refs = input?.attachments ?? [];
  const hasForeign = refs.some((r) => typeof r?.attachmentType === "string" && !r.attachmentType.startsWith(NAMESPACE));
  if (hasForeign) return { displayName: "Vibe", shouldDisplay: false };

  const payload = decodeVibePayload(input?.attachment?.payloadJson);
  if (!payload) return { displayName: "Vibe", shouldDisplay: false };

  return { displayName: "Vibe", tintHex: "#7C5CFF" };   // shouldDisplay 省略 = true
}

export function createVibeRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(input: PluginResolveAttachmentInput): Promise<PluginAttachmentResolveResult> {
      return resolveAttachment(input);
    },
  };
}

export { resolveAttachment };
