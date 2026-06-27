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
    id: "timestamp-renderer-seconds",
    label: "Unix Timestamp: 1700000000 (seconds)",
    component: "timestamp-renderer",
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
    component: "duration",
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
  {
    id: "temperature-sample",
    label: "Temperature: 37°C (body temperature)",
    component: "temperature",
    searchTerms: ["temperature", "celsius", "37°C"],
    accentHex: "#EF4444",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "temperature_preview",
          version: 1,
          sourceScale: "C",
          sourceValue: 37,
          celsius: 37,
          fahrenheit: 98.6,
          kelvin: 310.15,
          belowAbsoluteZero: false,
        }),
      },
    },
  },
  {
    id: "radix-renderer-sample",
    label: "Radix: 255 decimal",
    component: "radix-renderer",
    searchTerms: ["radix", "hex", "binary", "octal", "decimal"],
    accentHex: "#4F46E5",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "radix_preview",
          version: 1,
          inputBase: "dec",
          decimal: "255",
          hex: "0xff",
          octal: "0o377",
          binary: "0b11111111",
          bits: 8,
          asciiChar: null,
          isNegative: false,
        }),
      },
    },
  },
];
