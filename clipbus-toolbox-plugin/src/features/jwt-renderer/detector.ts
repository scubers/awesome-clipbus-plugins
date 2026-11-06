import { PLUGIN_WRITE_LIMITS, type DetectorHandler } from "@clipbus/plugin-sdk/runtime";
import { attachment, createJwtPayload } from "./payload.ts";
import { searchSnippet } from "../../shared/search.ts";

export function createJwtDetector(): DetectorHandler {
  return async (input, ctx) => {
    const payload = createJwtPayload(input);
    if (payload === null) return;
    if (Buffer.byteLength(JSON.stringify(payload)) > PLUGIN_WRITE_LIMITS.maximumPayloadBytes) return;
    await attachment.set(ctx, [{ key: "primary", payload }]);
    const { values } = await ctx.settings.get<{ indexJwt?: boolean }>();
    if (values?.indexJwt === true) {
      await ctx.item.setSearchExtension({
        scope: "jwt",
        entries: [{ key: "primary", text: searchSnippet(payload.payloadPretty), label: "JWT" }],
      });
    }
  };
}
