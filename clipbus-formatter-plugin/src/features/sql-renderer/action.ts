import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type {
  PluginAutoRunActionHandler,
  PluginAutoRunActionInput,
  PluginActionOperationResult,
  PluginActionResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { createSqlPayload } from "./payload.ts";

const resolveStub = async (): Promise<PluginActionResolveResult> => ({
  buttons: [],
  initialDraft: {},
});

export function createSqlCopyAction(): PluginAutoRunActionHandler {
  return {
    resolveSession: resolveStub,
    async runAutoAction(input: PluginAutoRunActionInput): Promise<PluginActionOperationResult> {
      const payload = createSqlPayload(input);
      if (!payload) {
        return actionResult.none({ userMessage: "Could not detect SQL" });
      }
      return actionResult.text(payload.formatted, { userMessage: "Formatted SQL copied" });
    },
  };
}
