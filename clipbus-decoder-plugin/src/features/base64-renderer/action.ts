import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type { PluginAutoRunActionHandler, PluginAutoRunActionInput, PluginActionOperationResult, PluginActionResolveResult } from "@clipbus/plugin-sdk/runtime";
import { createBase64Payload } from "./payload.ts";

const resolveStub = async (): Promise<PluginActionResolveResult> => ({
  buttons: [],
  initialDraft: {},
});

export function createBase64CopyAction(): PluginAutoRunActionHandler {
  return {
    resolveSession: resolveStub,
    async runAutoAction(input: PluginAutoRunActionInput): Promise<PluginActionOperationResult> {
      const payload = createBase64Payload(input);
      if (!payload) {
        return actionResult.none({ userMessage: "无法识别 Base64 内容" });
      }
      return actionResult.text(payload.decoded, { userMessage: "已复制 Base64 解码结果" });
    },
  };
}
