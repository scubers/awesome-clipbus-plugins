import type { DetectorHandler } from "@clipbus/plugin-sdk/runtime";
import { createVibePayload, vibeAttachment } from "./payload.ts";

export const vibeDetector: DetectorHandler = async (input, ctx) => {
  // Other plugins take priority. Recopy preserves unwritten groups, so clear our stale fallback explicitly.
  if (input.item.attachments.some((reference) => !reference.own)) {
    if (input.trigger === "recopy") await vibeAttachment.replace(ctx, []);
    return;
  }
  const payload = createVibePayload(input);
  if (!payload) return;
  await vibeAttachment.replace(ctx, [{ key: "primary", payload }]);
};
