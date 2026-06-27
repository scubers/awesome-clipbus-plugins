import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type {
  PluginAutoRunActionHandler,
  PluginAutoRunActionInput,
  PluginActionOperationResult,
  PluginActionResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { dedupLines } from "./transforms.ts";

// auto-run has no UI; resolveSession is a required interface stub
const resolveStub = async (): Promise<PluginActionResolveResult> => ({
  buttons: [],
  initialDraft: {},
});

export function createDedupAction(): PluginAutoRunActionHandler {
  return {
    resolveSession: resolveStub,
    async runAutoAction(
      input: PluginAutoRunActionInput
    ): Promise<PluginActionOperationResult> {
      const { content } = input;
      if (content.kind !== "text" || !content.text.trim()) {
        return actionResult.none({ userMessage: "Nothing to process" });
      }
      const out = dedupLines(content.text);
      return actionResult.text(out, { userMessage: "Done" });
    },
  };
}
