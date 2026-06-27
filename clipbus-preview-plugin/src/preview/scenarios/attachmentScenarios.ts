// Attachment preview scenarios for the dev workbench.
// Each entry here feeds the scenario selector in PreviewShellApp.vue.

export interface AttachmentScenario {
  id: string;
  label: string;
  rendererComponent: "compact" | "expanded";
  searchTerms: string[];
  accentHex: string;
  bootstrap: Record<string, unknown>;
}

// Pre-computed ColorPayload for #3366FF (blue, r=51 g=102 b=255)
const colorSwatchBootstrapPayload = JSON.stringify({
  kind: "color_swatch",
  version: 1,
  input: "#3366ff",
  rgb: { r: 51, g: 102, b: 255, a: 1 },
  hex: "#3366FF",
  rgbString: "rgb(51, 102, 255)",
  hslString: "hsl(225, 100%, 60%)",
  luminance: 0.1948,
  bestTextColor: "#ffffff",
  contrastWhite: 4.3,
  contrastBlack: 4.9,
  display: {
    typeLabel: "Color",
    headline: "#3366FF",
    facts: [
      { label: "HEX", value: "#3366FF" },
      { label: "RGB", value: "rgb(51, 102, 255)" },
      { label: "HSL", value: "hsl(225, 100%, 60%)" },
    ],
  },
});

const markdownPreviewPayload = JSON.stringify({
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
});

export const attachmentScenarios: AttachmentScenario[] = [
  {
    id: "color-swatch-blue",
    label: "Blue #3366FF",
    rendererComponent: "compact",
    searchTerms: ["#3366FF", "blue"],
    accentHex: "#3366FF",
    bootstrap: {
      attachment: { payloadJson: colorSwatchBootstrapPayload },
    },
  },
  {
    id: "markdown-renderer-sample",
    label: "Markdown: Combined Example",
    rendererComponent: "expanded",
    searchTerms: ["markdown", "preview"],
    accentHex: "#0EA5E9",
    bootstrap: {
      attachment: { payloadJson: markdownPreviewPayload },
    },
  },
];
