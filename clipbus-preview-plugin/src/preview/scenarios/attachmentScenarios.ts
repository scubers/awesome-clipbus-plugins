// Attachment preview scenarios for the dev workbench.
// Consumed by createPreviewWorkbench (preview-host/main.ts); `view` selects the
// feature component to mount. Add one entry per attachment renderer feature.

import type { PreviewScenario } from "@clipbus/plugin-sdk/preview";

const PLUGIN_ID = "plugin.preview";
const ITEM_TAGS = ["preview"];
const SOURCE_APP = "com.preview.editor";

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

const gradientSwatchBootstrapPayload = JSON.stringify({
  kind: "gradient_swatch",
  version: 1,
  gradient: "linear-gradient(to right, #3b82f6, #8b5cf6)",
  gradientType: "linear",
  repeating: false,
  stops: ["#3b82f6", "#8b5cf6"],
  angleOrShape: "to right",
});

const qrCodeBootstrapPayload = JSON.stringify({
  kind: "qr_code",
  version: 1,
  url: "https://example.com",
  display: {
    typeLabel: "QR Code",
    headline: "example.com",
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

/** Build an attachmentRenderer scenario; `view` routes to the feature component. */
function renderer(opts: {
  id: string;
  label: string;
  view: string;
  accentHex: string;
  attachmentType: string;
  payloadJson: string;
  viewport: PreviewScenario["viewport"];
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
    viewport: opts.viewport,
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
    id: "color-swatch-blue",
    label: "Blue #3366FF",
    view: "color-swatch",
    accentHex: "#3366FF",
    attachmentType: "plugin.preview.color",
    viewport: { heightPolicy: "fixed", height: 260 },
    payloadJson: colorSwatchBootstrapPayload,
  }),
  renderer({
    id: "gradient-swatch-linear",
    label: "Gradient: Blue→Purple",
    view: "gradient-swatch",
    accentHex: "#8b5cf6",
    attachmentType: "plugin.preview.gradient",
    viewport: { heightPolicy: "fixed", height: 260 },
    payloadJson: gradientSwatchBootstrapPayload,
  }),
  renderer({
    id: "markdown-renderer-sample",
    label: "Markdown: Combined Example",
    view: "markdown-renderer",
    accentHex: "#0EA5E9",
    attachmentType: "plugin.preview.markdown",
    viewport: { heightPolicy: "bounded", min: 120, max: 480 },
    payloadJson: markdownPreviewPayload,
  }),
  renderer({
    id: "qr-code-sample",
    label: "QR Code: example.com",
    view: "qr-code",
    accentHex: "#1a1a1a",
    attachmentType: "plugin.preview.qr",
    viewport: { heightPolicy: "fixed", height: 240 },
    payloadJson: qrCodeBootstrapPayload,
  }),
];
