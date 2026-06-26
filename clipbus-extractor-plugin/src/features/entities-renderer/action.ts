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
        return actionResult.none({ userMessage: "未找到足够的链接/邮箱/IP（至少需要 2 个）" });
      }
      const allItems = [...payload.urls, ...payload.emails, ...payload.ips];
      const joined = allItems.join("\n");
      return actionResult.text(joined, { userMessage: `已复制 ${payload.totalCount} 个提取项` });
    },
  };
}
