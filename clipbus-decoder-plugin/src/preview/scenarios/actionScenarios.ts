// Action preview scenarios for the dev workbench.
// Add entries here as you implement draft action features.
// Each entry must import its feature's app.vue and be referenced in PreviewShellApp.vue.

import { INITIAL_DRAFT } from "../../features/escape-tool/payload";

export interface ActionScenario {
  id: string;
  label: string;
  component: string;
  bootstrap: Record<string, unknown>;
}

export const actionScenarios: ActionScenario[] = [
  {
    id: "escape-tool-url",
    label: "Escape Tool: URL encode",
    component: "escape-tool",
    bootstrap: {
      ...INITIAL_DRAFT,
      mode: "url",
      input: "hello world & more",
    } as Record<string, unknown>,
  },
];
