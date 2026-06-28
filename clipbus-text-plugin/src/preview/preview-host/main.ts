import { createApp, h } from "vue";
import "../../shared/base.css";

// The text plugin ships only auto-run actions (sort / dedup / trim / strip-ansi).
// Auto-run actions execute headlessly and return a result — they have no WebView,
// so there is nothing to mount in a preview workbench. `npm run dev` just shows this
// note. (createPreviewWorkbench is intentionally not used: it needs >=1 previewable
// scenario, and this plugin has none.)
createApp({
  render() {
    return h(
      "main",
      {
        style:
          "max-width:520px;margin:48px auto;padding:24px;border-radius:12px;" +
          "font:13px/1.6 system-ui,sans-serif;" +
          "color:var(--clipbus-text-secondary,#475569);" +
          "background:var(--clipbus-surface,#ffffff);" +
          "border:1px solid var(--clipbus-border,#e2e8f0);",
      },
      [
        h(
          "strong",
          {
            style:
              "display:block;margin-bottom:8px;font-size:14px;" +
              "color:var(--clipbus-text-primary,#0f172a);",
          },
          "Text plugin — no previewable UI"
        ),
        h(
          "p",
          { style: "margin:0;" },
          "This plugin exposes only auto-run actions (sort, dedup, trim, strip-ansi). " +
            "They run headlessly and return a result, so there is no renderer or " +
            "draft-action WebView to preview here."
        ),
      ]
    );
  },
}).mount("#app");
