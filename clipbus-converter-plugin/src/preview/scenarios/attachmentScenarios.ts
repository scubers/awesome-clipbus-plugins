// Attachment preview scenarios for the dev workbench.
// Add entries here as you implement attachment renderer features.
// Each entry must import its feature's app.vue and be referenced in PreviewShellApp.vue.

export interface AttachmentScenario {
  id: string;
  label: string;
  rendererComponent: "compact" | "expanded";
  searchTerms: string[];
  accentHex: string;
  bootstrap: Record<string, unknown>;
}

export const attachmentScenarios: AttachmentScenario[] = [
  {
    id: "timestamp-renderer-seconds",
    label: "Unix Timestamp: 1700000000 (seconds)",
    rendererComponent: "compact",
    searchTerms: ["timestamp", "unix"],
    accentHex: "#0F766E",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "timestamp_preview",
          version: 1,
          original: "1700000000",
          unit: "seconds",
          epochMs: 1700000000000,
          iso: "2023-11-14T22:13:20.000Z",
          utc: "Tue, 14 Nov 2023 22:13:20 GMT",
          local: "2023/11/15 06:13:20",
          weekday: "Tuesday",
        }),
      },
    },
  },
  {
    id: "duration-sample",
    label: "ISO 8601 Duration: P1Y2M10DT2H30M",
    rendererComponent: "compact",
    searchTerms: ["duration", "iso8601", "P1Y2M10DT2H30M"],
    accentHex: "#7C3AED",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "duration_preview",
          version: 1,
          original: "P1Y2M10DT2H30M",
          components: { years: 1, months: 2, days: 10, hours: 2, minutes: 30 },
          humanBreakdown: "1 year, 2 months, 10 days, 2 hours, 30 minutes",
          totalSeconds: 37690200,
          approximate: true,
        }),
      },
    },
  },
];
