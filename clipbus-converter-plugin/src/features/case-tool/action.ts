import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type {
  PluginAutoRunActionHandler,
  PluginActionResolveResult,
} from "@clipbus/plugin-sdk/runtime";
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

const resolveStub = async (): Promise<PluginActionResolveResult> => ({
  buttons: [],
  initialDraft: {},
});

export function createCaseAction(
  transform: (text: string) => string,
  userMessage: string,
): PluginAutoRunActionHandler {
  return {
    resolveSession: resolveStub,
    async runAutoAction(input) {
      if (input.content.kind !== "text" || input.content.text.length === 0) {
        return actionResult.none({ userMessage: "Nothing to convert" });
      }
      return actionResult.text(transform(input.content.text), { userMessage });
    },
  };
}

export const caseActions: Record<string, PluginAutoRunActionHandler> = {
  uppercase: createCaseAction(toUppercase, "Converted to uppercase"),
  lowercase: createCaseAction(toLowercase, "Converted to lowercase"),
  camelCase: createCaseAction(toCamel, "Converted to camelCase"),
  pascalCase: createCaseAction(toPascal, "Converted to PascalCase"),
  snakeCase: createCaseAction(toSnake, "Converted to snake_case"),
  kebabCase: createCaseAction(toKebab, "Converted to kebab-case"),
  constantCase: createCaseAction(toConstant, "Converted to CONSTANT_CASE"),
  titleCase: createCaseAction(toTitle, "Converted to Title Case"),
  sentenceCase: createCaseAction(toSentence, "Converted to Sentence case"),
  dotCase: createCaseAction(toDot, "Converted to dot.case"),
};
