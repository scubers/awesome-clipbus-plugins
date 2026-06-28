// Attachment preview scenarios for the dev workbench.
// Consumed by createPreviewWorkbench (preview-host/main.ts); `view` selects the
// feature component to mount. Add one entry per attachment renderer feature.

import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";

const PLUGIN_ID = "plugin.cron";
const ITEM_TAGS = ["cron"];
const SOURCE_APP = "com.preview.editor";

const cronWeekdaysMorningPayload = JSON.stringify({
  kind: "cron_preview",
  version: 1,
  expression: "30 9 * * 1-5",
  fields: [
    { name: "Minute",  raw: "30",  description: "minute 30" },
    { name: "Hour",    raw: "9",   description: "hour 9" },
    { name: "Day",     raw: "*",   description: "every day" },
    { name: "Month",   raw: "*",   description: "every month" },
    { name: "Weekday", raw: "1-5", description: "Mon through Fri" },
  ],
  summary: "Mon through Fri, hour 9 minute 30",
});

/** Build an attachmentRenderer scenario; `view` routes to the feature component. */
function renderer(opts: {
  id: string;
  label: string;
  view: string;
  accentHex: string;
  attachmentType: string;
  payloadJson: string;
  min: number;
  max: number;
}): PreviewScenario {
  const item = {
    id: `item-${opts.id}`,
    type: "text",
    tags: ITEM_TAGS,
    sourceAppID: SOURCE_APP,
  };
  return {
    id: opts.id,
    label: opts.label,
    mode: "attachmentRenderer",
    pluginID: PLUGIN_ID,
    accentHex: opts.accentHex,
    view: opts.view,
    viewport: { heightPolicy: "bounded", min: opts.min, max: opts.max },
    item,
    attachment: {
      item,
      attachment: {
        historyID: `preview-${opts.id}`,
        owner: PLUGIN_ID,
        attachmentType: opts.attachmentType,
        attachmentKey: "primary",
        payloadJson: opts.payloadJson,
      },
    },
  };
}

export const attachmentScenarios: PreviewScenario[] = [
  renderer({
    id: "cron-weekdays-morning",
    label: "Weekdays at 9:30",
    view: "cron-renderer",
    accentHex: "#B45309",
    attachmentType: "plugin.cron.schedule",
    min: 120,
    max: 560,
    payloadJson: cronWeekdaysMorningPayload,
  }),
];
