import { createPreviewWorkbench } from "@clipbus/plugin-sdk/preview";
import { createApp, type Component } from "vue";
import "../../shared/base.css";
import { attachmentScenarios } from "../scenarios/attachmentScenarios";
import { actionScenarios } from "../scenarios/actionScenarios";

// PER-PLUGIN: import every renderer + draft-action feature component.
import CronRenderer from "../../features/cron-renderer/app.vue";

// PER-PLUGIN: map scenario.view (feature id) → its component.
const COMPONENTS: Record<string, Component> = {
  "cron-renderer": CronRenderer,
};

createPreviewWorkbench(document.getElementById("app")!, {
  scenarios: [...attachmentScenarios, ...actionScenarios],
  mount(slotEl, { scenario }) {
    const Comp = COMPONENTS[scenario.view ?? ""] ?? CronRenderer;
    const app = createApp(Comp);
    app.mount(slotEl);
    return () => app.unmount();
  },
});
