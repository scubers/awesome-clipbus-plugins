import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type {
  PluginAutoRunActionHandler,
  PluginAutoRunActionInput,
  PluginActionOperationResult,
  PluginActionResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import { createRadixPayload } from "./payload.ts";

const resolveStub = async (): Promise<PluginActionResolveResult> => ({
  buttons: [],
  initialDraft: {},
});

export function createRadixCopyAction(): PluginAutoRunActionHandler {
  return {
    resolveSession: resolveStub,
    async runAutoAction(input: PluginAutoRunActionInput): Promise<PluginActionOperationResult> {
      const payload = createRadixPayload(input);
      if (!payload) {
        return actionResult.none({ userMessage: "未识别到整数" });
      }
      const text = `DEC: ${payload.decimal}\nHEX: ${payload.hex}\nOCT: ${payload.octal}\nBIN: ${payload.binary}`;
      return actionResult.text(text, { userMessage: "已复制各进制" });
    },
  };
}
