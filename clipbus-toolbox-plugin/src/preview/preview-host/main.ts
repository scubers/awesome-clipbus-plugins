import { createPreviewWorkbench } from "@clipbus/plugin-sdk/preview";
import { createApp, type Component } from "vue";
import "../../shared/base.css";
import { attachmentScenarios } from "../scenarios/attachmentScenarios";
import DecodeRendererApp from "../../features/decode-renderer/app.vue";

const COMPONENTS: Record<string, Component> = {
  "decode-renderer": DecodeRendererApp,
};

createPreviewWorkbench(document.getElementById("app")!, {
  scenarios: attachmentScenarios,
  mount(slotEl, { scenario }) {
    const Comp = COMPONENTS[scenario.view ?? ""] ?? DecodeRendererApp;
    const app = createApp(Comp);
    app.mount(slotEl);
    return () => app.unmount();
  },
});
