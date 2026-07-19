import { createPreviewWorkbench } from "@clipbus/plugin-sdk/preview";
import { createApp, type Component } from "vue";
import "../../shared/base.css";
import { attachmentScenarios } from "../scenarios/attachmentScenarios";
import { actionScenarios } from "../scenarios/actionScenarios";
import ImageEditApp from "../../features/image-edit/app.vue";

const COMPONENTS: Record<string, Component> = {
  "image-edit": ImageEditApp,
};

const scenarios = [...attachmentScenarios, ...actionScenarios];
const root = document.getElementById("app")!;

createPreviewWorkbench(root, {
  scenarios,
  mount(slotEl, { scenario }) {
    const Comp = COMPONENTS[scenario.view ?? ""] ?? ImageEditApp;
    const app = createApp(Comp);
    app.mount(slotEl);
    return () => app.unmount();
  },
});
