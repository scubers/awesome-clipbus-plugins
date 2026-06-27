import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type { PluginAutoRunActionHandler, PluginAutoRunActionInput, PluginActionOperationResult, PluginActionResolveResult } from "@clipbus/plugin-sdk/runtime";
import { createTimestampPayload } from "./payload.ts";

const resolveStub = async (): Promise<PluginActionResolveResult> => ({
  buttons: [],
  initialDraft: {},
});

export function createTimestampCopyAction(): PluginAutoRunActionHandler {
  return {
    resolveSession: resolveStub,
    async runAutoAction(input: PluginAutoRunActionInput): Promise<PluginActionOperationResult> {
      const payload = createTimestampPayload(input);
      if (!payload) {
        return actionResult.none({ userMessage: "No timestamp detected" });
      }
      return actionResult.text(payload.iso, { userMessage: "Copied ISO 8601 timestamp" });
    },
  };
}
