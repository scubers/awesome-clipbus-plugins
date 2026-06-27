/**
 * build-ui.mjs — Generic Vite UI builder for Clipbus plugins.
 *
 * Convention: feature directory name === manifest capability id.
 * Scans src/features/<id>/ directories that contain both main.ts and index.html,
 * looks up each id in manifest.json to determine kind (renderers | actions),
 * and builds each as a Vite IIFE bundle into dist/ui/<kind>/<id>/.
 *
 * Usage: node scripts/build-ui.mjs  (run from plugin root)
 */
import { build } from "vite";
import { cp, rm, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const featuresDir = path.resolve(projectRoot, "src/features");
const uiOutputRoot = path.resolve(projectRoot, "dist/ui");
const manifestPath = path.resolve(projectRoot, "manifest.json");

/** Convert an id like "my-feature-id" to a PascalCase JS identifier "MyFeatureId". */
function toPascalCase(id) {
  return id
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

/**
 * Read manifest.json and build a Map<id, "renderers" | "actions">.
 * Only attachmentRenderers entries and actions entries that have a uiEntry are
 * eligible UI bundles; actions without uiEntry are runtime-only.
 */
async function buildIdKindMap() {
  let content;
  try {
    content = await readFile(manifestPath, "utf8");
  } catch {
    throw new Error(`Cannot read manifest.json at ${manifestPath}`);
  }
  const manifest = JSON.parse(content);
  const map = new Map();

  for (const renderer of manifest.attachmentRenderers ?? []) {
    if (renderer.id) map.set(renderer.id, "renderers");
  }
  for (const action of manifest.actions ?? []) {
    // Only actions that declare a uiEntry produce a UI bundle.
    if (action.id && action.uiEntry) map.set(action.id, "actions");
  }
  return map;
}

/** Return true when a directory has both main.ts and index.html. */
async function hasEntryFiles(dir) {
  try {
    await stat(path.join(dir, "main.ts"));
    await stat(path.join(dir, "index.html"));
    return true;
  } catch {
    return false;
  }
}

/**
 * Discover all buildable UI pages under src/features/.
 * Each top-level sub-directory whose name matches a manifest id gets one page.
 * Sub-directories without main.ts + index.html are skipped.
 * Sub-directories whose name is not in the manifest id map throw an error.
 */
async function discoverPages(idKindMap) {
  const pages = [];
  let topLevel;
  try {
    topLevel = await readdir(featuresDir, { withFileTypes: true });
  } catch {
    // src/features/ does not exist yet — nothing to build.
    return pages;
  }

  for (const dirent of topLevel) {
    if (!dirent.isDirectory()) continue;
    const id = dirent.name;
    const featurePath = path.join(featuresDir, id);

    if (!(await hasEntryFiles(featurePath))) continue;

    const kind = idKindMap.get(id);
    if (kind === undefined) {
      throw new Error(
        `UI directory "src/features/${id}" has no matching renderer/action in manifest.json. ` +
          `Add it to attachmentRenderers or to actions (with a uiEntry field), ` +
          `or remove the directory.`
      );
    }

    pages.push({
      id,
      kind,
      globalName: `ClipbusPlugin${toPascalCase(id)}`,
      entry: path.join(featurePath, "main.ts"),
      template: path.join(featurePath, "index.html"),
    });
  }
  return pages;
}

// ── Main ────────────────────────────────────────────────────────────────────

const idKindMap = await buildIdKindMap();
const pages = await discoverPages(idKindMap);

await rm(uiOutputRoot, { recursive: true, force: true });

for (const page of pages) {
  const outDir = path.resolve(uiOutputRoot, page.kind, page.id);
  await build({
    root: projectRoot,
    configFile: false,
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    plugins: [vue()],
    build: {
      lib: {
        entry: page.entry,
        name: page.globalName,
        formats: ["iife"],
        fileName: () => "index.js",
        cssFileName: "index",
      },
      outDir,
      emptyOutDir: true,
      cssCodeSplit: false,
      assetsDir: ".",
      rollupOptions: {
        output: {
          assetFileNames: (asset) =>
            asset.name?.endsWith(".css") ? "index.css" : "[name][extname]",
        },
      },
    },
  });
  await cp(page.template, path.resolve(outDir, "index.html"));
}
