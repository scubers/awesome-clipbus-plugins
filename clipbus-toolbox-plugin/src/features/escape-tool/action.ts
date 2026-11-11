import { result } from "@clipbus/plugin-sdk/runtime";
import type { ActionHandler } from "@clipbus/plugin-sdk/runtime";
import {
  htmlDecode,
  htmlEncode,
  unicodeDecode,
  unicodeEncode,
} from "./payload.ts";

function createTransformAction(
  transform: (text: string) => string | null,
): ActionHandler {
  return async (input) => {
    if (input.content.kind !== "text") {
      return result.none("Text input required");
    }
    try {
      const output = transform(input.content.text);
      if (output === null) {
        return result.none("Invalid encoded input");
      }
      return result.text(output);
    } catch {
      return result.none("Invalid encoded input");
    }
  };
}

export const escapeActions: Record<string, ActionHandler> = {
  "html-encode": createTransformAction(htmlEncode),
  "html-decode": createTransformAction(htmlDecode),
  "unicode-escape": createTransformAction(unicodeEncode),
  "unicode-unescape": createTransformAction(unicodeDecode),
};
