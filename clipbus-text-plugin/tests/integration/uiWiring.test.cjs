const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..", "..");
const FEATURES = path.join(ROOT, "src", "features");
const SHELL = path.join(ROOT, "src", "preview", "PreviewShellApp.vue");

// Renderers intentionally using a fixed numeric manifest height (no autoFit needed).
// PER-PLUGIN: text has no renderers at all.
const FIXED_HEIGHT = new Set([]);
// PER-PLUGIN: false for plugins with no renderer AND no draft action (text).
const HAS_PREVIEWABLE_UI = false;

test("preview workbench is wired, not the template stub", () => {
  const src = fs.readFileSync(SHELL, "utf8");
  assert.ok(!src.includes("wire component in PreviewShellApp"),
    "PreviewShellApp still contains the template placeholder");
  if (HAS_PREVIEWABLE_UI) {
    assert.ok(/from ["']\.\.\/features\//.test(src),
      "PreviewShellApp imports no real feature component");
  }
});

test("every auto/bounded renderer calls autoFit (no clipped cards)", () => {
  if (!fs.existsSync(FEATURES)) return;
  for (const dir of fs.readdirSync(FEATURES)) {
    const appVue = path.join(FEATURES, dir, "app.vue");
    if (!fs.existsSync(appVue)) continue;
    const src = fs.readFileSync(appVue, "utf8");
    if (!src.includes("clipbus.item.attachment")) continue; // not a renderer
    if (FIXED_HEIGHT.has(dir)) continue;
    assert.ok(/autoFit\(|setHeight\(/.test(src),
      `renderer "${dir}" never calls autoFit/setHeight — card height will clip`);
  }
});
