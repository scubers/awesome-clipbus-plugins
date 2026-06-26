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
        return actionResult.none({ userMessage: "不是 CSV 表格" });
      }
      const md = buildMarkdownTable(payload);
      return actionResult.text(md, { userMessage: "已复制 Markdown 表" });
    },
  };
}
