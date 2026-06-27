/**
 * verify-build.mjs — Generic build verifier for Clipbus plugins.
 *
 * Reads manifest.json to derive expected artifacts, then asserts:
 *   1. dist/plugin.cjs exists, contains "definePlugin", and includes every
 *      declared capability id as a substring.
 *   2. For each attachmentRenderer and each action with a uiEntry:
 *        dist/ui/<kind>/<id>/index.html  — exists and references ./index.js + ./index.css
 *        dist/ui/<kind>/<id>/index.js   — exists
 *        dist/ui/<kind>/<id>/index.css  — exists
 *        HTML must NOT contain src="/" or href="/" (absolute local asset refs).
 *
 * Usage: node scripts/verify-build.mjs  (run from plugin root)
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const manifestPath = path.resolve(projectRoot, "manifest.json");

/** Read a file as UTF-8; return null when it does not exist. */
async function tryRead(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

// ── Load manifest ────────────────────────────────────────────────────────────

const manifestContent = await readFile(manifestPath, "utf8").catch(() => {
  throw new Error(`Cannot read manifest.json at ${manifestPath}`);
});
const manifest = JSON.parse(manifestContent);

const detectorIds = (manifest.detectors ?? []).map((d) => d.id).filter(Boolean);
const renderers = manifest.attachmentRenderers ?? [];
const rendererIds = renderers.map((r) => r.id).filter(Boolean);
const actions = manifest.actions ?? [];
const actionIds = actions.map((a) => a.id).filter(Boolean);
const actionsWithUI = actions.filter((a) => a.id && a.uiEntry);

const allCapabilityIds = [...detectorIds, ...rendererIds, ...actionIds];

// ── 1. Runtime bundle ────────────────────────────────────────────────────────

const runtimePath = path.resolve(projectRoot, "dist/plugin.cjs");
const runtimeContent = await tryRead(runtimePath);
if (runtimeContent === null) {
  throw new Error(
    "dist/plugin.cjs not found — run `npm run build:runtime` first."
  );
}

if (!runtimeContent.includes("definePlugin")) {
  throw new Error(
    "dist/plugin.cjs does not contain the string 'definePlugin'. " +
      "Ensure src/plugin.ts uses definePlugin() from @clipbus/plugin-sdk/runtime."
  );
}

for (const id of allCapabilityIds) {
  if (!runtimeContent.includes(id)) {
    throw new Error(
      `dist/plugin.cjs is missing capability id "${id}". ` +
        `Check that src/plugin.ts registers it under setup().`
    );
  }
}

// ── 2. UI bundles ────────────────────────────────────────────────────────────

async function verifyUIBundle(kind, id) {
  const base = `dist/ui/${kind}/${id}`;
  const htmlPath = path.resolve(projectRoot, base, "index.html");
  const jsPath = path.resolve(projectRoot, base, "index.js");
  const cssPath = path.resolve(projectRoot, base, "index.css");

  const html = await tryRead(htmlPath);
  if (html === null) throw new Error(`Missing: ${base}/index.html`);

  if ((await tryRead(jsPath)) === null) throw new Error(`Missing: ${base}/index.js`);
  if ((await tryRead(cssPath)) === null) throw new Error(`Missing: ${base}/index.css`);

  if (!html.includes("./index.js") || !html.includes("./index.css")) {
    throw new Error(
      `${base}/index.html must reference page-local built assets ` +
        `(./index.js and ./index.css).`
    );
  }
  if (html.includes('src="/') || html.includes('href="/')) {
    throw new Error(
      `${base}/index.html must not contain absolute local asset references ` +
        `(src="/" or href="/").`
    );
  }
}

for (const renderer of renderers) {
  await verifyUIBundle("renderers", renderer.id);
}
for (const action of actionsWithUI) {
  await verifyUIBundle("actions", action.id);
}

// ── Done ─────────────────────────────────────────────────────────────────────

console.log("Build verification passed.");
