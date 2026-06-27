// Attachment preview scenarios for the dev workbench.
// Add entries here as you implement attachment renderer features.
// Each entry must import its feature's app.vue and be referenced in PreviewShellApp.vue.

export interface AttachmentScenario {
  id: string;
  label: string;
  component: string;
  searchTerms: string[];
  accentHex: string;
  bootstrap: Record<string, unknown>;
}

export const attachmentScenarios: AttachmentScenario[] = [
  {
    id: "cron-weekdays-morning",
    label: "Weekdays at 9:30",
    component: "cron-renderer",
    searchTerms: ["cron", "schedule", "30 9 * * 1-5"],
    accentHex: "#B45309",
    bootstrap: {
      attachment: {
        historyID: "preview-cron-1",
        owner: "plugin.cron",
        attachmentType: "plugin.cron.schedule",
        attachmentKey: "primary",
        payloadJson: JSON.stringify({
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
        }),
      },
    },
  },
];
