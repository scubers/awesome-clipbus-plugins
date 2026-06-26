// Attachment preview scenarios for the dev workbench.
// Add entries here as you implement attachment renderer features.
// Each entry must import its feature's app.vue and be referenced in PreviewShellApp.vue.
import { createCsvPayload } from "../../features/csv-table/payload";

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
    id: "csv-table-basic",
    label: "CSV Table — name/age sample",
    rendererComponent: "expanded",
    searchTerms: ["csv", "table"],
    accentHex: "#0F766E",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify(
          createCsvPayload({
            content: { kind: "text", text: "name,age\nAlice,30\nBob,25" },
          })
        ),
      },
    },
  },
];
