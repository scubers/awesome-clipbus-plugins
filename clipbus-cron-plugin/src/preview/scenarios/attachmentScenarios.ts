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
    id: "cron-weekdays-morning",
    label: "工作日早 9:30",
    rendererComponent: "expanded",
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
            { name: "分钟", raw: "30",  description: "第 30 分钟" },
            { name: "小时", raw: "9",   description: "第 9 小时" },
            { name: "日",   raw: "*",   description: "每天" },
            { name: "月",   raw: "*",   description: "每月" },
            { name: "星期", raw: "1-5", description: "周一至周五" },
          ],
          summary: "周一至周五，第 9 小时 第 30 分钟执行",
        }),
      },
    },
  },
];
