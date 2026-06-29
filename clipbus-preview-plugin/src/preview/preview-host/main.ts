import { createPreviewWorkbench } from "@clipbus/plugin-sdk/preview";
import { createApp, type Component } from "vue";
import "../../shared/base.css";
import { attachmentScenarios } from "../scenarios/attachmentScenarios";
import { actionScenarios } from "../scenarios/actionScenarios";

// PER-PLUGIN: import every renderer + draft-action feature component.
import ColorSwatch from "../../features/color-swatch/app.vue";
import GradientSwatch from "../../features/gradient-swatch/app.vue";
import MarkdownRenderer from "../../features/markdown-renderer/app.vue";
import QrCode from "../../features/qr-code/app.vue";

// PER-PLUGIN: map scenario.view (feature id) → its component.
const COMPONENTS: Record<string, Component> = {
  "color-swatch": ColorSwatch,
  "gradient-swatch": GradientSwatch,
  "markdown-renderer": MarkdownRenderer,
  "qr-code": QrCode,
};

createPreviewWorkbench(document.getElementById("app")!, {
  scenarios: [...attachmentScenarios, ...actionScenarios],
  mount(slotEl, { scenario }) {
    const Comp = COMPONENTS[scenario.view ?? ""] ?? ColorSwatch;
    const app = createApp(Comp);
    app.mount(slotEl);
    return () => app.unmount();
  },
});
