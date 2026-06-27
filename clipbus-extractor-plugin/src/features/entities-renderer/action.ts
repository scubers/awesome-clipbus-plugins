import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type { PluginAutoRunActionHandler, PluginAutoRunActionInput, PluginActionOperationResult, PluginActionResolveResult } from "@clipbus/plugin-sdk/runtime";
import { createEntitiesPayload } from "./payload.ts";

const resolveStub = async (): Promise<PluginActionResolveResult> => ({
  buttons: [],
  initialDraft: {},
});

export function createEntitiesCopyAction(): PluginAutoRunActionHandler {
  return {
    resolveSession: resolveStub,
    async runAutoAction(input: PluginAutoRunActionInput): Promise<PluginActionOperationResult> {
      const payload = createEntitiesPayload(input);
      if (!payload) {
        return actionResult.none({ userMessage: "No URLs, emails, or IPs found (need at least 2)" });
      }
      const allItems = [...payload.urls, ...payload.emails, ...payload.ips];
      const joined = allItems.join("\n");
      return actionResult.text(joined, { userMessage: `Copied ${payload.totalCount} item(s)` });
    },
  };
}
