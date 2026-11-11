import { PLUGIN_WRITE_LIMITS, type DetectorHandler } from "@clipbus/plugin-sdk/runtime";
import { attachment, createTimestampPayload } from "./payload.ts";

export function createTimestampDetector(): DetectorHandler {
  return async (input, ctx) => {
    const payload = createTimestampPayload(input);
    if (payload === null) return;
    if (Buffer.byteLength(JSON.stringify(payload)) > PLUGIN_WRITE_LIMITS.maximumPayloadBytes) return;
    await attachment.replace(ctx, [{ key: "primary", payload }]);
  };
}
