import type { DetectorHandler } from "@clipbus/plugin-sdk/runtime";
import { attachment, createRichTextPayload } from "../markdown-renderer/payload.ts";

export function createRichTextDetector(): DetectorHandler {
  return async (input, ctx) => {
    if (input.content.kind !== "text") return;
    const { richText } = await ctx.item.getRichText();
    const payload = createRichTextPayload(richText);
    await attachment.replace(ctx, payload ? [{ key: "primary", payload }] : []);
  };
}
