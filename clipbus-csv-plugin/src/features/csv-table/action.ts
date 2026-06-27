import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type {
  PluginAutoRunActionHandler,
  PluginAutoRunActionInput,
  PluginActionOperationResult,
  PluginActionResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { createCsvPayload, buildMarkdownTable } from "./payload.ts";

// auto-run has no UI; resolveSession is an interface stub required by the SDK
const resolveStub = async (): Promise<PluginActionResolveResult> => ({
  buttons: [],
  initialDraft: {},
});

export function createCsvAction(): PluginAutoRunActionHandler {
  return {
    resolveSession: resolveStub,
    async runAutoAction(
      input: PluginAutoRunActionInput
    ): Promise<PluginActionOperationResult> {
      const payload = createCsvPayload(input);
      if (!payload) {
        return actionResult.none({ userMessage: "Not a CSV table" });
      }
      const md = buildMarkdownTable(payload);
      return actionResult.text(md, { userMessage: "Markdown table copied" });
    },
  };
}
