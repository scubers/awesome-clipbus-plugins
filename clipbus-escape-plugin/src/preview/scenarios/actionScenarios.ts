// Action preview scenarios for the dev workbench.
// Each entry must import its feature's app.vue and be referenced in PreviewShellApp.vue.

import { INITIAL_DRAFT } from "../../features/escape-tool/payload";

export interface ActionScenario {
  id: string;
  label: string;
  bootstrap: Record<string, unknown>;
}

export const actionScenarios: ActionScenario[] = [
  {
    id: "escape-tool",
    label: "Escape & Encode",
    bootstrap: { ...INITIAL_DRAFT } as Record<string, unknown>,
  },
];
