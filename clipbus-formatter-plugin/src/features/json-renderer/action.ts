import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type {
  PluginAutoRunActionHandler,
  PluginAutoRunActionInput,
  PluginActionOperationResult,
  PluginActionResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { createJsonPayload } from "./payload.ts";

// auto-run has no UI; resolveSession is an interface stub required by the SDK
const resolveStub = async (): Promise<PluginActionResolveResult> => ({
  buttons: [],
  initialDraft: {},
});

export function createJsonCopyAction(): PluginAutoRunActionHandler {
  return {
    resolveSession: resolveStub,
    async runAutoAction(
      input: PluginAutoRunActionInput
    ): Promise<PluginActionOperationResult> {
      const payload = createJsonPayload(input);
      if (!payload) {
        return actionResult.none({ userMessage: "Could not parse JSON content" });
      }
      return actionResult.text(payload.formatted, {
        userMessage: "Formatted JSON copied",
      });
    },
  };
}
