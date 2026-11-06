import { PLUGIN_WRITE_LIMITS, type DetectorHandler } from "@clipbus/plugin-sdk/runtime";
import { attachment, createMacPayload } from "./payload.ts";

export function createMacDetector(): DetectorHandler {
  return async (input, ctx) => {
    const payload = createMacPayload(input);
    if (payload === null) return;
    if (Buffer.byteLength(JSON.stringify(payload)) > PLUGIN_WRITE_LIMITS.maximumPayloadBytes) return;
    await attachment.set(ctx, [{ key: "primary", payload }]);
  };
}
