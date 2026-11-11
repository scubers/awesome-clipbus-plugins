import { PLUGIN_WRITE_LIMITS, type DetectorHandler } from "@clipbus/plugin-sdk/runtime";
import { attachment, createBase64Payload } from "./payload.ts";
import { searchSnippet } from "../../shared/search.ts";

export function createBase64Detector(): DetectorHandler {
  return async (input, ctx) => {
    const payload = createBase64Payload(input);
    if (payload === null) return;
    if (Buffer.byteLength(JSON.stringify(payload)) > PLUGIN_WRITE_LIMITS.maximumPayloadBytes) return;
    await attachment.replace(ctx, [{ key: "primary", payload }]);
    const { values } = await ctx.settings.get<{ indexBase64?: boolean }>();
    if (values?.indexBase64 === true) {
      await ctx.item.replaceSearchExtension({
        scope: "base64",
        entries: [{ key: "primary", text: searchSnippet(payload.decoded), label: "Base64 Decoded" }],
      });
    } else if (input.trigger === "recopy") {
      await ctx.item.replaceSearchExtension({ scope: "base64", entries: [] });
    }
  };
}
