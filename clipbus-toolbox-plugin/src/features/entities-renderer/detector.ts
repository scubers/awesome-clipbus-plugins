import { PLUGIN_WRITE_LIMITS, type DetectorHandler } from "@clipbus/plugin-sdk/runtime";
import { attachment, createEntitiesPayload } from "./payload.ts";

export function createEntitiesDetector(): DetectorHandler {
  return async (input, ctx) => {
    const payload = createEntitiesPayload(input);
    if (payload === null) return;
    if (Buffer.byteLength(JSON.stringify(payload)) > PLUGIN_WRITE_LIMITS.maximumPayloadBytes) return;
    await attachment.set(ctx, [{ key: "primary", payload }]);
  };
}
