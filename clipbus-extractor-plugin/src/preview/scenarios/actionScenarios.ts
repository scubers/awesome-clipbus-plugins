// Action preview scenarios for the dev workbench.
// Add entries here as you implement draft action features.
// Each entry must import its feature's app.vue and be referenced in PreviewShellApp.vue.

import { INITIAL_DRAFT } from "../../features/regex-tool/payload";

export interface ActionScenario {
  id: string;
  label: string;
  bootstrap: Record<string, unknown>;
}

export const actionScenarios: ActionScenario[] = [
  {
    id: "regex-tool",
    label: "Regex Tester",
    bootstrap: {
      ...INITIAL_DRAFT,
      pattern: "\\d+",
      flags: "g",
      text: "价格：99元，折后49元，再减10元",
    } as Record<string, unknown>,
  },
];
