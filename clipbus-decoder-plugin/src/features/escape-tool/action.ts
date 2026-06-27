// action.ts — runtime-only draft action handler for escape-tool.
// This file is never imported by app.vue (UI side).

import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type {
  PluginAutoRunActionHandler,
  PluginActionOperationResult,
  PluginAutoRunActionInput,
} from "@clipbus/plugin-sdk/runtime";
import { INITIAL_DRAFT } from "./payload.ts";

export function createEscapeAction(): PluginAutoRunActionHandler {
  return {
    async resolveSession(input, _ctx) {
      const inputText =
        (input as { content?: { text?: string } } | undefined)?.content?.text ?? "";
      return {
        displayName: "Escape & Encode",
        buttons: [{ id: "submit", title: "Copy Encoded Result", isEnabled: true }],
        defaultButtonID: "submit",
        initialDraft: {
          ...INITIAL_DRAFT,
          input: inputText,
        } as unknown as Record<string, unknown>,
      };
    },
    // Draft-lifecycle actions are driven by the UI; runAutoAction is a guarded stub
    // that satisfies the PluginAutoRunActionHandler interface.
    async runAutoAction(_input: PluginAutoRunActionInput): Promise<PluginActionOperationResult> {
      return actionResult.none({ userMessage: "Draft is driven by the UI" });
    },
  };
}
