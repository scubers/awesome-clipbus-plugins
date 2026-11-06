import { PLUGIN_WRITE_LIMITS, type DetectorHandler } from "@clipbus/plugin-sdk/runtime";
import { attachment, createGeoPayload } from "./payload.ts";

export function createGeoDetector(): DetectorHandler {
  return async (input, ctx) => {
    const payload = createGeoPayload(input);
    if (payload === null) return;
    if (!/[°NSEW]/i.test(payload.input)) {
      const { values } = await ctx.settings.get<{ decimalCoordinates?: boolean }>();
      if (values?.decimalCoordinates !== true) return;
    }
    if (Buffer.byteLength(JSON.stringify(payload)) > PLUGIN_WRITE_LIMITS.maximumPayloadBytes) return;
    await attachment.set(ctx, [{ key: "primary", payload }]);
  };
}
