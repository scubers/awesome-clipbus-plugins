// Action preview scenarios for the dev workbench.
// Add entries here as you implement draft action features.
// Each entry must import its feature's app.vue and be referenced in PreviewShellApp.vue.

export interface ActionScenario {
  id: string;
  label: string;
  bootstrap: Record<string, unknown>;
}

export const actionScenarios: ActionScenario[] = [];
