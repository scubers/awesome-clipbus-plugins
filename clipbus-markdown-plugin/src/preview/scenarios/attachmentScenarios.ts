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
    label: "Markdown: Combined Example",
    rendererComponent: "expanded",
    searchTerms: ["markdown", "preview"],
    accentHex: "#0EA5E9",
    bootstrap: {
      attachment: {
        payloadJson: JSON.stringify({
          kind: "markdown_preview",
          version: 1,
          html: [
            "<h1>Markdown Preview</h1>",
            "<p>A sample paragraph with <strong>bold</strong> and <em>italic</em> text, plus <code>inline code</code>.</p>",
            "<ul><li>Unordered list item A</li><li>Unordered list item B</li></ul>",
            "<blockquote><p>A blockquote example</p></blockquote>",
            '<pre><code class="language-ts">const x: number = 42;</code></pre>',
            '<p><a href="https://example.com">External link example</a></p>',
          ].join("\n"),
          sourceChars: 180,
          lineCount: 12,
          headingCount: 1,
        }),
      },
    },
  },
];
