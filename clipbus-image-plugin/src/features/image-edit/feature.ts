import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type { PluginAutoRunActionHandler } from "@clipbus/plugin-sdk/runtime";
import { PROCESS_IMAGE, type ImageEditDraft, type ProcessImageReq, type ProcessImageResp } from "./contracts.ts";
import { processImage, type ImageEditHost } from "./process.ts";

const DEFAULT_QUALITY = 80;

// Draft-lifecycle action. resolveSession seeds the form; the WebView edits
// params and submits via clipbus.action.complete. runAutoAction is required by
// the handler type but never invoked for a draft action (the inverse of
// case-convert, which stubs resolveSession). The actual crop+compress runs in
// the process-image messageHandler, which the UI calls via clipbus.runtime.invoke
// before completing with the resulting image temp path.
export const imageEditAction: PluginAutoRunActionHandler = {
  async resolveSession(input) {
    if (input.content.kind !== "image") {
      // The host only offers this action for the current image value
      // (supportedInputKinds),
      // but stay defensive: an empty session is harmless.
      return { buttons: [], initialDraft: {} };
    }
    const draft: ImageEditDraft = {
      origWidth: input.content.width,
      origHeight: input.content.height,
      format: input.content.format,
      quality: DEFAULT_QUALITY,
    };
    return {
      displayName: "Crop & Compress",
      buttons: [{ id: "apply", title: "Apply", isEnabled: true }],
      defaultButtonID: "apply",
      initialDraft: draft as unknown as Record<string, unknown>,
    };
  },
  async runAutoAction() {
    return actionResult.none();
  },
};

async function handleProcessImage(request: unknown, ctx: unknown): Promise<ProcessImageResp> {
  const { host } = ctx as { host: ImageEditHost };
  return processImage(host, request as ProcessImageReq);
}

export const imageEditMessageHandlers = { [PROCESS_IMAGE]: handleProcessImage };
