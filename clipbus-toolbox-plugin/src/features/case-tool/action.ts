import { result } from "@clipbus/plugin-sdk/runtime";
import type { ActionHandler } from "@clipbus/plugin-sdk/runtime";
import {
  toCamel,
  toConstant,
  toDot,
  toKebab,
  toLowercase,
  toPascal,
  toSentence,
  toSnake,
  toTitle,
  toUppercase,
} from "./payload.ts";

export function createCaseAction(
  transform: (text: string) => string,
): ActionHandler {
  return async (input) => {
    if (input.content.kind !== "text" || input.content.text.length === 0) {
      return result.none("Nothing to convert");
    }
    return result.text(transform(input.content.text));
  };
}

export const caseActions: Record<string, ActionHandler> = {
  uppercase: createCaseAction(toUppercase),
  lowercase: createCaseAction(toLowercase),
  camelCase: createCaseAction(toCamel),
  pascalCase: createCaseAction(toPascal),
  snakeCase: createCaseAction(toSnake),
  kebabCase: createCaseAction(toKebab),
  constantCase: createCaseAction(toConstant),
  titleCase: createCaseAction(toTitle),
  sentenceCase: createCaseAction(toSentence),
  dotCase: createCaseAction(toDot),
};
