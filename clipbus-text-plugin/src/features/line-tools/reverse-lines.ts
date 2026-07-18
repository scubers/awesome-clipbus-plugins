import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type {
  PluginAutoRunActionHandler,
  PluginAutoRunActionInput,
  PluginActionOperationResult,
  PluginActionResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { reverseLines } from "./transforms.ts";

const resolveStub = async (): Promise<PluginActionResolveResult> => ({
  buttons: [],
  initialDraft: {},
});

export function createReverseLinesAction(): PluginAutoRunActionHandler {
  return {
    resolveSession: resolveStub,
    async runAutoAction(
      input: PluginAutoRunActionInput
    ): Promise<PluginActionOperationResult> {
      const { content } = input;
      if (content.kind !== "text" || !content.text.trim()) {
        return actionResult.none({ userMessage: "Nothing to process" });
      }
      return actionResult.text(reverseLines(content.text), {
        userMessage: "Done",
      });
    },
  };
}
