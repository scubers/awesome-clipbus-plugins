// action.ts — runtime-only draft action handler for lorem-tool.
// This file is never imported by app.vue (UI side).

import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type {
  PluginAutoRunActionHandler,
  PluginActionOperationResult,
  PluginAutoRunActionInput,
} from "@clipbus/plugin-sdk/runtime";
import { INITIAL_DRAFT } from "./payload.ts";

export function createLoremAction(): PluginAutoRunActionHandler {
  return {
    async resolveSession(_input, _ctx) {
      return {
        displayName: "Lorem Ipsum",
        buttons: [{ id: "submit", title: "Insert", isEnabled: true }],
        defaultButtonID: "submit",
        initialDraft: { ...INITIAL_DRAFT } as unknown as Record<string, unknown>,
      };
    },
    // Draft-lifecycle actions are driven by the UI; runAutoAction is a guarded stub
    // that satisfies the PluginAutoRunActionHandler interface.
    async runAutoAction(_input: PluginAutoRunActionInput): Promise<PluginActionOperationResult> {
      return actionResult.none({ userMessage: "draft is driven by the UI" });
    },
  };
}
