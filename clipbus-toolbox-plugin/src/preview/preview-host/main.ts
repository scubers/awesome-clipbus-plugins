import { createPreviewWorkbench } from "@clipbus/plugin-sdk/preview";
import { createApp, type Component } from "vue";
import "../../shared/base.css";
import { attachmentScenarios } from "../scenarios/attachmentScenarios";
import Card0 from "../../features/base64-renderer/app.vue";
import Card1 from "../../features/jwt-renderer/app.vue";
import Card2 from "../../features/xml-renderer/app.vue";
import Card3 from "../../features/csv-table/app.vue";
import Card4 from "../../features/timestamp-renderer/app.vue";
import Card5 from "../../features/radix-renderer/app.vue";
import Card6 from "../../features/duration/app.vue";
import Card7 from "../../features/entities-renderer/app.vue";
import Card8 from "../../features/url-parsed/app.vue";
import Card9 from "../../features/ip-details/app.vue";
import Card10 from "../../features/geo-coordinates/app.vue";
import Card11 from "../../features/mac-address/app.vue";
import Card12 from "../../features/uuid-details/app.vue";
import Card13 from "../../features/markdown-renderer/app.vue";
import Card14 from "../../features/gradient-swatch/app.vue";
import Card15 from "../../features/cron-renderer/app.vue";

const components: Record<string, Component> = {
  "base64-renderer": Card0,
  "jwt-renderer": Card1,
  "xml-renderer": Card2,
  "csv-table": Card3,
  "timestamp-renderer": Card4,
  "radix-renderer": Card5,
  "duration": Card6,
  "entities-renderer": Card7,
  "url-parsed": Card8,
  "ip-details": Card9,
  "geo-coordinates": Card10,
  "mac-address": Card11,
  "uuid-details": Card12,
  "markdown-renderer": Card13,
  "gradient-swatch": Card14,
  "cron-renderer": Card15,
};

createPreviewWorkbench(document.getElementById("app")!, {
  scenarios: attachmentScenarios,
  mount(slotEl, { scenario }) {
    const app = createApp(components[scenario.view!]);
    app.mount(slotEl);
    return () => app.unmount();
  },
});
