import { createPreviewWorkbench } from "@clipbus/plugin-sdk/preview";
import { createApp, type Component } from "vue";
import "../../shared/base.css";
import { attachmentScenarios } from "../scenarios/attachmentScenarios";
import { actionScenarios } from "../scenarios/actionScenarios";

// PER-PLUGIN: import every renderer + draft-action feature component.
import TextStatsRenderer from "../../features/text-stats-renderer/app.vue";
import DiffRenderer from "../../features/diff-renderer/app.vue";
import ImageInfoRenderer from "../../features/image-info-renderer/app.vue";
import CharInfoRenderer from "../../features/char-info-renderer/app.vue";
import SecretRenderer from "../../features/secret-renderer/app.vue";

// PER-PLUGIN: map scenario.view (feature id) → its component.
const COMPONENTS: Record<string, Component> = {
  "text-stats-renderer": TextStatsRenderer,
  "diff-renderer": DiffRenderer,
  "image-info-renderer": ImageInfoRenderer,
  "char-info-renderer": CharInfoRenderer,
  "secret-renderer": SecretRenderer,
};

createPreviewWorkbench(document.getElementById("app")!, {
  scenarios: [...attachmentScenarios, ...actionScenarios],
  mount(slotEl, { scenario }) {
    const Comp = COMPONENTS[scenario.view ?? ""] ?? TextStatsRenderer;
    const app = createApp(Comp);
    app.mount(slotEl);
    return () => app.unmount();
  },
});
