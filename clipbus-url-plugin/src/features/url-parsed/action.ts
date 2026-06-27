import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type {
  PluginAutoRunActionHandler,
  PluginAutoRunActionInput,
  PluginActionOperationResult,
  PluginActionResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { createUrlPayload } from "./payload.ts";

// auto-run has no UI; resolveSession is a required interface stub
const resolveStub = async (): Promise<PluginActionResolveResult> => ({
  buttons: [],
  initialDraft: {},
});

export function createUrlAction(): PluginAutoRunActionHandler {
  return {
    resolveSession: resolveStub,
    async runAutoAction(
      input: PluginAutoRunActionInput
    ): Promise<PluginActionOperationResult> {
      const payload = createUrlPayload(input);
      if (!payload) {
        return actionResult.none({ userMessage: "Not a URL" });
      }
      if (payload.query.length > 0) {
        const obj = Object.fromEntries(
          payload.query.map((q) => [q.key, q.value])
        );
        return actionResult.text(JSON.stringify(obj, null, 2), {
          userMessage: "Copied query params",
        });
      }
      return actionResult.text(payload.href, { userMessage: "Copied URL" });
    },
  };
}
