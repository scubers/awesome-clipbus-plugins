import { createPreviewWorkbench } from "@clipbus/plugin-sdk/preview";
import { createApp, h, type Component } from "vue";
import "../../shared/base.css";
import { attachmentScenarios } from "../scenarios/attachmentScenarios";
import { actionScenarios } from "../scenarios/actionScenarios";
import VibeFallback from "../../features/vibe-fallback/app.vue";

const COMPONENTS: Record<string, Component> = {
  "vibe-fallback": VibeFallback,
};

const scenarios = [...attachmentScenarios, ...actionScenarios];
const root = document.getElementById("app")!;

if (scenarios.length === 0) {
  createApp({
    render: () =>
      h(
        "main",
        { style: "padding:24px;font:13px/1.6 system-ui,sans-serif;color:var(--clipbus-text-secondary,#475569)" },
        "No previewable features yet. Add one, register a scenario in src/preview/scenarios/, import its app.vue in preview-host/main.ts, and map it in COMPONENTS by its view (feature dir name).",
      ),
  }).mount(root);
} else {
  createPreviewWorkbench(root, {
    scenarios,
    mount(slotEl, { scenario }) {
      const Comp =
        COMPONENTS[scenario.view ?? ""] ??
        ({
          render: () =>
            h(
              "div",
              { style: "padding:16px;font:13px system-ui;color:var(--clipbus-text-secondary,#475569)" },
              "No component mapped for view: " + (scenario.view ?? "") + ". Import its app.vue and add it to COMPONENTS.",
            ),
        } as Component);
      const app = createApp(Comp);
      app.mount(slotEl);
      return () => app.unmount();
    },
  });
}
