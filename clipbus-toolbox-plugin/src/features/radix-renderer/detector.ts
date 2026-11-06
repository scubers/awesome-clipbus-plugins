import type { DetectorHandler } from "@clipbus/plugin-sdk/runtime";
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
    await attachment.set(ctx, [{ key: "primary", payload }]);
    await ctx.item.setSearchExtension({
      scope: "converter",
      entries: [{ key: "primary", text: `${payload.decimal} ${payload.hex} ${payload.binary}`.slice(0, 200), label: "Radix Conversion" }],
    });
  };
}
