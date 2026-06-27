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
    id: "diff-sample",
    label: "Unified Diff Sample",
    rendererComponent: "expanded",
    searchTerms: ["diff", "patch", "unified"],
    accentHex: "#0F766E",
    bootstrap: {
      payloadJson: JSON.stringify({
        kind: "diff_preview",
        version: 1,
        lines: [
          { type: "meta", text: "diff --git a/src/app.ts b/src/app.ts" },
          { type: "meta", text: "--- a/src/app.ts" },
          { type: "meta", text: "+++ b/src/app.ts" },
          { type: "hunk", text: "@@ -1,3 +1,4 @@" },
          { type: "ctx", text: " const x = 1;" },
          { type: "del", text: "-const y = 2;" },
          { type: "add", text: "+const y = 3;" },
          { type: "add", text: "+const z = 4;" },
          { type: "ctx", text: " export { x, y };" },
        ],
        additions: 2,
        deletions: 1,
        files: 1,
      }),
    },
  },
];
