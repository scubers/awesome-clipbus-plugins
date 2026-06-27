// Action preview scenarios for the dev workbench.
// Add entries here as you implement draft action features.
// Each entry must import its feature's app.vue and be referenced in PreviewShellApp.vue.

import { INITIAL_DRAFT } from "../../features/case-tool/payload";

export interface ActionScenario {
  id: string;
  label: string;
  bootstrap: Record<string, unknown>;
}

export const actionScenarios: ActionScenario[] = [
  {
    id: "case-tool",
    label: "Case Converter",
    bootstrap: { ...INITIAL_DRAFT, input: "helloWorld foo_bar" } as Record<string, unknown>,
  },
];
