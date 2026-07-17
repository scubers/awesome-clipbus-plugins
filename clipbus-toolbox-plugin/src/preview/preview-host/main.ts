import { createPreviewWorkbench } from "@clipbus/plugin-sdk/preview";
import { createApp, type Component } from "vue";
import "../../shared/base.css";
import { attachmentScenarios } from "../scenarios/attachmentScenarios";
import { actionScenarios } from "../scenarios/actionScenarios";
import DecodeRendererApp from "../../features/decode-renderer/app.vue";
import ImageEditApp from "../../features/image-edit/app.vue";

const COMPONENTS: Record<string, Component> = {
  "decode-renderer": DecodeRendererApp,
  "image-edit": ImageEditApp,
};

createPreviewWorkbench(document.getElementById("app")!, {
  scenarios: [...attachmentScenarios, ...actionScenarios],
  mount(slotEl, { scenario }) {
    const Comp = COMPONENTS[scenario.view ?? ""] ?? DecodeRendererApp;
    const app = createApp(Comp);
    app.mount(slotEl);
    return () => app.unmount();
  },
});
