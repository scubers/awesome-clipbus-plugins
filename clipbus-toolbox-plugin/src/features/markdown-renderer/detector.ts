import { PLUGIN_WRITE_LIMITS, type DetectorHandler } from "@clipbus/plugin-sdk/runtime";
import { attachment, detectMarkdownPayload } from "./payload.ts";

export function createMarkdownDetector(): DetectorHandler {
  return async (input, ctx) => {
    const payload = detectMarkdownPayload(input);
    if (payload === null) return;
    if (Buffer.byteLength(JSON.stringify(payload)) > PLUGIN_WRITE_LIMITS.maximumPayloadBytes) return;
    await attachment.replace(ctx, [{ key: "primary", payload }]);
  };
}
