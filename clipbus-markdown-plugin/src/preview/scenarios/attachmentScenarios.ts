// Attachment preview scenarios for the dev workbench.
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
    id: "markdown-renderer-sample",
    label: "Markdown: 综合示例",
    rendererComponent: "expanded",
    searchTerms: ["markdown", "preview"],
    accentHex: "#0EA5E9",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "markdown_preview",
          version: 1,
          html: [
            "<h1>Markdown 预览</h1>",
            "<p>这是一段 <strong>加粗</strong> 和 <em>斜体</em> 的示例文字，还有 <code>inline code</code>。</p>",
            "<ul><li>无序列表项 A</li><li>无序列表项 B</li></ul>",
            "<blockquote><p>引用内容示例</p></blockquote>",
            '<pre><code class="language-ts">const x: number = 42;</code></pre>',
            '<p><a href="https://example.com">外部链接示例</a></p>',
          ].join("\n"),
          sourceChars: 180,
          lineCount: 12,
          headingCount: 1,
        }),
      },
    },
  },
];
