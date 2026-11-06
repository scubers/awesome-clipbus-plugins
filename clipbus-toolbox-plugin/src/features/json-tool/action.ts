import { result } from "@clipbus/plugin-sdk/runtime";
import type { ActionHandler } from "@clipbus/plugin-sdk/runtime";
import { jsonToYaml } from "./yaml.ts";

function createJsonAction(format?: number | "yaml"): ActionHandler {
  return async ({ content }) => {
    if (content.kind !== "text" || !content.text.trim()) {
      return result.none("Nothing to process");
    }
    try {
      const parsed: unknown = JSON.parse(content.text);
      const output = format === "yaml" ? jsonToYaml(parsed) : JSON.stringify(parsed, null, format);
      return output === undefined
        ? result.none("Invalid JSON")
        : result.text(output, "Done");
    } catch {
      return result.none("Invalid JSON");
    }
  };
}

export function createPrettyJsonAction(): ActionHandler {
  return createJsonAction(2);
}

export function createMinifyJsonAction(): ActionHandler {
  return createJsonAction();
}

export function createYamlAction(): ActionHandler {
  return createJsonAction("yaml");
}
