import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type {
  PluginAutoRunActionHandler,
  PluginAutoRunActionInput,
  PluginActionOperationResult,
  PluginActionResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { createColorPayload } from "./payload.ts";

// auto-run has no UI; resolveSession is a required interface stub
const resolveStub = async (): Promise<PluginActionResolveResult> => ({
  buttons: [],
  initialDraft: {},
});

export function createColorAction(): PluginAutoRunActionHandler {
  return {
    resolveSession: resolveStub,
    async runAutoAction(
      input: PluginAutoRunActionInput
    ): Promise<PluginActionOperationResult> {
      const payload = createColorPayload(input);
      if (!payload) {
        return actionResult.none({ userMessage: "Not a color value" });
      }
      const text = `${payload.hex}\n${payload.rgbString}\n${payload.hslString}`;
      return actionResult.text(text, { userMessage: "Color formats copied" });
    },
  };
}
