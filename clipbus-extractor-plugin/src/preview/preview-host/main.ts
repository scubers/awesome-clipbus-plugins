import { createPreviewWorkbench } from "@clipbus/plugin-sdk/preview";
import { createApp, type Component } from "vue";
import "../../shared/base.css";
import { attachmentScenarios } from "../scenarios/attachmentScenarios";
import { actionScenarios } from "../scenarios/actionScenarios";

// PER-PLUGIN: import every renderer + draft-action feature component.
import EntitiesRenderer from "../../features/entities-renderer/app.vue";
import UrlParsed from "../../features/url-parsed/app.vue";
import IpDetails from "../../features/ip-details/app.vue";
import GeoCoordinates from "../../features/geo-coordinates/app.vue";
import MacAddress from "../../features/mac-address/app.vue";
import UuidDetails from "../../features/uuid-details/app.vue";
import RegexTool from "../../features/regex-tool/app.vue";

// PER-PLUGIN: map scenario.view (feature id) → its component.
const COMPONENTS: Record<string, Component> = {
  "entities-renderer": EntitiesRenderer,
  "url-parsed": UrlParsed,
  "ip-details": IpDetails,
  "geo-coordinates": GeoCoordinates,
  "mac-address": MacAddress,
  "uuid-details": UuidDetails,
  "regex-tool": RegexTool,
};

createPreviewWorkbench(document.getElementById("app")!, {
  scenarios: [...attachmentScenarios, ...actionScenarios],
  mount(slotEl, { scenario }) {
    const Comp = COMPONENTS[scenario.view ?? ""] ?? EntitiesRenderer;
    const app = createApp(Comp);
    app.mount(slotEl);
    return () => app.unmount();
  },
});
