// action.ts — runtime-only draft action handler for case-tool.
// This file is never imported by app.vue (UI side).

import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type {
  PluginAutoRunActionHandler,
  PluginActionOperationResult,
  PluginAutoRunActionInput,
} from "@clipbus/plugin-sdk/runtime";
import { INITIAL_DRAFT } from "./payload.ts";

export function createCaseAction(): PluginAutoRunActionHandler {
  return {
    async resolveSession(input, _ctx) {
      const prefill = ((input as unknown) as { content?: { text?: string } })?.content?.text ?? "";
      return {
        displayName: "Case Converter",
        buttons: [{ id: "submit", title: "Copy camelCase", isEnabled: true }],
        defaultButtonID: "submit",
        initialDraft: { ...INITIAL_DRAFT, input: prefill } as unknown as Record<string, unknown>,
      };
    },
    // Draft-lifecycle actions are driven by the UI; runAutoAction is a guarded stub
    // that satisfies the PluginAutoRunActionHandler interface.
    async runAutoAction(_input: PluginAutoRunActionInput): Promise<PluginActionOperationResult> {
      return actionResult.none({ userMessage: "driven by the UI" });
    },
  };
}
