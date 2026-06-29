import { createPreviewWorkbench } from "@clipbus/plugin-sdk/preview";
import { createApp, type Component } from "vue";
import "../../shared/base.css";
import { attachmentScenarios } from "../scenarios/attachmentScenarios";
import { actionScenarios } from "../scenarios/actionScenarios";

// PER-PLUGIN: import every renderer + draft-action feature component.
import TimestampRenderer from "../../features/timestamp-renderer/app.vue";
import RadixRenderer from "../../features/radix-renderer/app.vue";
import DurationRenderer from "../../features/duration/app.vue";
import TemperatureRenderer from "../../features/temperature/app.vue";
import CaseTool from "../../features/case-tool/app.vue";
import FilesizeRenderer from "../../features/filesize-renderer/app.vue";
import ChmodRenderer from "../../features/chmod-renderer/app.vue";

// PER-PLUGIN: map scenario.view (feature id) → its component.
const COMPONENTS: Record<string, Component> = {
  "timestamp-renderer": TimestampRenderer,
  "radix-renderer": RadixRenderer,
  "duration": DurationRenderer,
  "temperature": TemperatureRenderer,
  "case-tool": CaseTool,
  "filesize-renderer": FilesizeRenderer,
  "chmod-renderer": ChmodRenderer,
};

createPreviewWorkbench(document.getElementById("app")!, {
  scenarios: [...attachmentScenarios, ...actionScenarios],
  mount(slotEl, { scenario }) {
    const Comp = COMPONENTS[scenario.view ?? ""] ?? TimestampRenderer;
    const app = createApp(Comp);
    app.mount(slotEl);
    return () => app.unmount();
  },
});
