const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..", "..");
const FEATURES = path.join(ROOT, "src", "features");
const HOST_MAIN = path.join(ROOT, "src", "preview", "preview-host", "main.ts");
const OLD_SHELL = path.join(ROOT, "src", "preview", "PreviewShellApp.vue");

// Renderers intentionally using a fixed numeric manifest height (no autoFit needed).
// PER-PLUGIN: text has no renderers at all.
const FIXED_HEIGHT = new Set([]);
// PER-PLUGIN: false for plugins with no renderer AND no draft action (text = auto-run only).
const HAS_PREVIEWABLE_UI = false;

test("preview workbench is migrated off the hand-rolled shell", () => {
  assert.ok(!fs.existsSync(OLD_SHELL),
    "PreviewShellApp.vue should be removed after the createPreviewWorkbench migration");
  if (HAS_PREVIEWABLE_UI) {
    const src = fs.readFileSync(HOST_MAIN, "utf8");
    assert.ok(src.includes("createPreviewWorkbench"),
      "preview-host/main.ts must call createPreviewWorkbench from @clipbus/plugin-sdk/preview");
    assert.ok(/from ["']\.\.\/\.\.\/features\//.test(src),
      "preview-host/main.ts imports no real feature component");
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
    if (/autoFit\(/.test(src)) {
      assert.ok(/target:/.test(src),
        `renderer "${dir}" calls autoFit without a target — it observes document.body and runaway-loops setHeight in the preview workbench`);
    }
  }
});
