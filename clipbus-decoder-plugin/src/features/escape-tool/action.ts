import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type {
  PluginAutoRunActionHandler,
  PluginActionResolveResult,
} from "@clipbus/plugin-sdk/runtime";
import {
  base64Decode,
  base64Encode,
  htmlDecode,
  htmlEncode,
  jsonDecode,
  jsonEncode,
  unicodeDecode,
  unicodeEncode,
  urlDecode,
  urlEncode,
} from "./payload.ts";

const resolveStub = async (): Promise<PluginActionResolveResult> => ({
  buttons: [],
  initialDraft: {},
});

function createTransformAction(
  transform: (text: string) => string | null,
  userMessage: string,
): PluginAutoRunActionHandler {
  return {
    resolveSession: resolveStub,
    async runAutoAction(input) {
      if (input.content.kind !== "text") {
        return actionResult.none({ userMessage: "Text input required" });
      }
      try {
        const output = transform(input.content.text);
        if (output === null) {
          return actionResult.none({ userMessage: "Invalid encoded input" });
        }
        return actionResult.text(output, { userMessage });
      } catch {
        return actionResult.none({ userMessage: "Invalid encoded input" });
      }
    },
  };
}

export const escapeActions: Record<string, PluginAutoRunActionHandler> = {
  "url-encode": createTransformAction(urlEncode, "URL encoded"),
  "url-decode": createTransformAction(urlDecode, "URL decoded"),
  "html-encode": createTransformAction(htmlEncode, "HTML encoded"),
  "html-decode": createTransformAction(htmlDecode, "HTML decoded"),
  "base64-encode": createTransformAction(base64Encode, "Base64 encoded"),
  "base64-decode": createTransformAction(base64Decode, "Base64 decoded"),
  "unicode-escape": createTransformAction(unicodeEncode, "Unicode escaped"),
  "unicode-unescape": createTransformAction(unicodeDecode, "Unicode unescaped"),
  "json-escape": createTransformAction(jsonEncode, "JSON escaped"),
  "json-unescape": createTransformAction(jsonDecode, "JSON unescaped"),
};
