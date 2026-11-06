import { PLUGIN_WRITE_LIMITS, type DetectorHandler } from "@clipbus/plugin-sdk/runtime";
import { attachment, createRadixPayload } from "./payload.ts";
import { createTimestampPayload } from "../timestamp-renderer/payload.ts";

export function createRadixDetector(): DetectorHandler {
  return async (input, ctx) => {
    const payload = createRadixPayload(input);
    if (payload === null) return;
    if (payload.inputBase === "dec") {
      if (createTimestampPayload(input)) return;
      const { values } = await ctx.settings.get<{ decimalRadix?: boolean }>();
      if (values?.decimalRadix !== true) return;
    }
    if (Buffer.byteLength(JSON.stringify(payload)) > PLUGIN_WRITE_LIMITS.maximumPayloadBytes) return;
    await attachment.set(ctx, [{ key: "primary", payload }]);
  };
}
