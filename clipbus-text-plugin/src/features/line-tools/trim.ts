import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type {
  PluginAutoRunActionHandler,
  PluginAutoRunActionInput,
  PluginActionOperationResult,
  PluginActionResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { tidyWhitespace } from "./transforms.ts";

// auto-run has no UI; resolveSession is a required interface stub
const resolveStub = async (): Promise<PluginActionResolveResult> => ({
  buttons: [],
  initialDraft: {},
});

export function createTrimAction(): PluginAutoRunActionHandler {
  return {
    resolveSession: resolveStub,
    async runAutoAction(
      input: PluginAutoRunActionInput
    ): Promise<PluginActionOperationResult> {
      const { content } = input;
      if (content.kind !== "text" || !content.text.trim()) {
        return actionResult.none({ userMessage: "Nothing to process" });
      }
      const out = tidyWhitespace(content.text);
      return actionResult.text(out, { userMessage: "Done" });
    },
  };
}
