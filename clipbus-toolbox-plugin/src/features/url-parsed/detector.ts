import { PLUGIN_WRITE_LIMITS, type DetectorHandler } from "@clipbus/plugin-sdk/runtime";
import { attachment, createUrlPayload, createUrlCard } from "./payload.ts";

export function createUrlDetector(): DetectorHandler {
  return async (input, ctx) => {
    const payload = createUrlPayload(input);
    if (payload === null) return;
    if (payload.query.length === 0) return;
    if (Buffer.byteLength(JSON.stringify(payload)) > PLUGIN_WRITE_LIMITS.maximumPayloadBytes) return;
    await attachment.replace(ctx, [{ key: "primary", payload, card: createUrlCard(payload) }]);
  };
}
