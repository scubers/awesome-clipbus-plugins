// Action preview scenarios for the dev workbench.
// Each entry must import its feature's app.vue and be referenced in PreviewShellApp.vue.

import { INITIAL_DRAFT as GEN_INITIAL_DRAFT } from "../../features/gen-tool/payload";
import { INITIAL_DRAFT as LOREM_INITIAL_DRAFT } from "../../features/lorem-tool/payload";

export interface ActionScenario {
  id: string;
  label: string;
  component: string;
  bootstrap: Record<string, unknown>;
}

export const actionScenarios: ActionScenario[] = [
  {
    id: "gen-tool",
    label: "Generator (UUID / Password)",
    component: "gen-tool",
    bootstrap: { ...GEN_INITIAL_DRAFT } as Record<string, unknown>,
  },
  {
    id: "lorem-tool",
    label: "Lorem Ipsum Generator",
    component: "lorem-tool",
    bootstrap: { ...LOREM_INITIAL_DRAFT } as Record<string, unknown>,
  },
];
