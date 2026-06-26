/**
 * scaffold.mjs — Scaffolds a new Clipbus plugin from template-plugin.
 *
 * Usage: node scaffold.mjs <topic> [--title "Human Title"] [--repo <repoRoot>]
 *
 *   topic     kebab-case identifier, e.g. "json-tools" → creates clipbus-json-tools-plugin/
 *   --title   Human-readable plugin title (default: derived from topic)
 *   --repo    Repository root directory (default: process.cwd())
 *
 * The target directory must not already exist. After scaffolding, run:
 *   npm install && npm run verify
 */
import {
  cp,
  mkdir,
  readFile,
  writeFile,
  rm,
  readdir,
  stat,
  unlink,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Argument parsing ─────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  let topic = null;
  let title = null;
  let repoRoot = process.cwd();

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--title" && args[i + 1]) {
      title = args[++i];
    } else if (args[i] === "--repo" && args[i + 1]) {
      repoRoot = path.resolve(args[++i]);
    } else if (!args[i].startsWith("--") && topic === null) {
      topic = args[i];
    }
  }
  return { topic, title, repoRoot };
}

function die(msg) {
  process.stderr.write(`scaffold: error: ${msg}\n`);
  process.exit(1);
}

// ── Naming helpers ───────────────────────────────────────────────────────────

/** "json-tools" → "Json Tools" */
function topicToTitle(topic) {
  return topic
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** "json-tools" → "plugin.json.tools" */
function topicToPluginId(topic) {
  return `plugin.${topic.replace(/-/g, ".")}`;
}

// ── Filesystem helpers ───────────────────────────────────────────────────────

/**
 * Recursively copy src → dest, skipping top-level entries in excludeNames.
 * Creates dest if it does not exist.
 */
async function copyDir(src, dest, excludeNames = new Set()) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (excludeNames.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath); // excludeNames only applied at top level
    } else {
      await cp(srcPath, destPath);
    }
  }
}

/** Remove a directory tree; silently succeed if it does not exist. */
async function rmDir(dirPath) {
  await rm(dirPath, { recursive: true, force: true });
}

/**
 * Walk a directory tree and delete every file for which predicate returns true.
 * Directories themselves are never deleted (even if emptied).
 */
async function deleteMatchingFiles(dirPath, predicate) {
  let entries;
  try {
    entries = await readdir(dirPath, { withFileTypes: true });
  } catch {
    return; // directory may not exist
  }
  for (const entry of entries) {
    const p = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await deleteMatchingFiles(p, predicate);
    } else if (predicate(entry.name)) {
      await unlink(p);
    }
  }
}

async function writeJson(filePath, obj) {
  await writeFile(filePath, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

async function writeText(filePath, content) {
  await writeFile(filePath, content, "utf8");
}

// ── Scaffold content generators ──────────────────────────────────────────────

function minimalPluginTs() {
  return `import { definePlugin } from "@clipbus/plugin-sdk/runtime";

export default definePlugin({
  setup() {
    return {
      attachmentRenderers: {},
      detectors: {},
      actions: {},
      messageHandlers: {},
    };
  },
});
`;
}

function minimalAttachmentScenariosTs() {
  return `// Attachment preview scenarios for the dev workbench.
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

export const attachmentScenarios: AttachmentScenario[] = [];
`;
}

function minimalActionScenariosTs() {
  return `// Action preview scenarios for the dev workbench.
// Add entries here as you implement draft action features.
// Each entry must import its feature's app.vue and be referenced in PreviewShellApp.vue.

export interface ActionScenario {
  id: string;
  label: string;
  bootstrap: Record<string, unknown>;
}

export const actionScenarios: ActionScenario[] = [];
`;
}

function minimalPreviewShellApp(pluginId) {
  // Returns a minimal PreviewShellApp.vue that:
  // - imports no deleted feature components
  // - handles empty scenario arrays safely
  // - still provides the workbench chrome with theme / view controls
  return `<template>
  <main class="workbench" :data-theme="selectedTheme">
    <section class="workbench__controls">
      <label class="workbench__control">
        <span>View</span>
        <select v-model="selectedView">
          <option value="renderer">Renderer</option>
          <option value="action">Action</option>
        </select>
      </label>

      <label v-if="activeScenarioOptions.length > 0" class="workbench__control">
        <span>Scenario</span>
        <select v-model="selectedScenarioID">
          <option
            v-for="scenario in activeScenarioOptions"
            :key="scenario.id"
            :value="scenario.id"
          >
            {{ scenario.label }}
          </option>
        </select>
      </label>

      <label class="workbench__control">
        <span>Theme</span>
        <select v-model="selectedTheme">
          <option value="dark">Dark Host</option>
          <option value="light">Light Host</option>
        </select>
      </label>
    </section>

    <section class="workbench__canvas">
      <div class="host-frame">
        <div class="host-frame__title">
          <span>{{ selectedView === "renderer" ? "Attachment Renderer" : "Draft Action" }}</span>
        </div>
        <div class="host-frame__surface">
          <!-- Replace this placeholder with real feature component imports once implemented. -->
          <div class="host-frame__placeholder">
            <template v-if="activeScenarioOptions.length === 0">
              No scenarios yet — implement features and register scenarios in
              <code>src/preview/scenarios/</code>.
            </template>
            <template v-else>
              Scenario "{{ activeScenario?.label }}" — wire component in PreviewShellApp.vue.
            </template>
          </div>
        </div>
      </div>

      <aside class="workbench__notes">
        <p class="workbench__notes-title">Preview Notes</p>
        <p class="workbench__notes-body">
          This workbench simulates host chrome and theme changes.
        </p>
        <p class="workbench__notes-body">
          Once you add features: import each feature's <code>app.vue</code> here,
          add scenarios to <code>src/preview/scenarios/</code>, and map them in
          <code>activeComponent</code>.
        </p>
        <p class="workbench__notes-status">{{ statusMessage }}</p>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { attachmentScenarios } from "./scenarios/attachmentScenarios";
import { actionScenarios } from "./scenarios/actionScenarios";

type ViewKey = "renderer" | "action";
type ThemeKey = "light" | "dark";

const query = new URLSearchParams(window.location.search);
const initialView: ViewKey = query.get("view") === "action" ? "action" : "renderer";
const selectedView = ref<ViewKey>(initialView);
const selectedTheme = ref<ThemeKey>(query.get("theme") === "light" ? "light" : "dark");
const statusMessage = ref<string>("Ready. Implement features to start previewing.");

const activeScenarioOptions = computed(() =>
  selectedView.value === "renderer" ? attachmentScenarios : actionScenarios
);

const selectedScenarioID = ref<string>(activeScenarioOptions.value[0]?.id ?? "");

const activeScenario = computed(() =>
  activeScenarioOptions.value.find((s) => s.id === selectedScenarioID.value) ??
  activeScenarioOptions.value[0] ??
  null
);
</script>

<style scoped>
.workbench {
  min-height: 100%;
  padding: 24px;
  color: #e2e8f0;
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.22), transparent 24%),
    linear-gradient(180deg, #111827, #0f172a);
}

.workbench[data-theme="light"] {
  color: #0f172a;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.18), transparent 24%),
    linear-gradient(180deg, #e2e8f0, #cbd5e1);
}

.workbench__controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.workbench__control {
  display: grid;
  gap: 6px;
}

.workbench__control span {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.72);
}

.workbench[data-theme="light"] .workbench__control span {
  color: rgba(15, 23, 42, 0.62);
}

.workbench__control select {
  min-width: 170px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.26);
  background: rgba(15, 23, 42, 0.48);
  color: inherit;
}

.workbench[data-theme="light"] .workbench__control select {
  background: rgba(255, 255, 255, 0.82);
}

.workbench__canvas {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 20px;
  align-items: start;
}

.host-frame {
  padding: 18px;
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.34);
  border: 1px solid rgba(45, 212, 191, 0.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  overflow: auto;
}

.workbench[data-theme="light"] .host-frame {
  background: rgba(248, 250, 252, 0.52);
  border-color: rgba(148, 163, 184, 0.28);
}

.host-frame__title {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(226, 232, 240, 0.8);
}

.workbench[data-theme="light"] .host-frame__title {
  color: rgba(15, 23, 42, 0.7);
}

.host-frame__surface {
  display: grid;
  gap: 12px;
}

.host-frame__placeholder {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border-radius: 12px;
  border: 1px dashed rgba(148, 163, 184, 0.3);
  color: rgba(226, 232, 240, 0.55);
  font-size: 13px;
  text-align: center;
  line-height: 1.6;
}

.workbench[data-theme="light"] .host-frame__placeholder {
  color: rgba(15, 23, 42, 0.45);
}

.workbench__notes {
  padding: 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.42);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.workbench[data-theme="light"] .workbench__notes {
  background: rgba(255, 255, 255, 0.76);
}

.workbench__notes-title {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workbench__notes-body,
.workbench__notes-status {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(226, 232, 240, 0.78);
}

.workbench[data-theme="light"] .workbench__notes-body,
.workbench[data-theme="light"] .workbench__notes-status {
  color: rgba(15, 23, 42, 0.72);
}

.workbench__notes-status {
  font-weight: 600;
}

@media (max-width: 980px) {
  .workbench__canvas {
    grid-template-columns: minmax(0, 1fr);
  }

  .workbench__notes {
    order: -1;
  }
}
</style>
`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { topic, title: titleArg, repoRoot } = parseArgs(process.argv);

  if (!topic) {
    die(
      "topic is required.\n" +
        "Usage: node scaffold.mjs <topic> [--title 'Human Title'] [--repo <repoRoot>]\n" +
        'Example: node scaffold.mjs json-tools --title "JSON Tools"'
    );
  }

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(topic)) {
    die(
      `topic must be kebab-case (lowercase letters/digits, hyphen-separated).\n` +
        `  Valid:   "json-tools", "image-resize", "qr"\n` +
        `  Invalid: "${topic}"`
    );
  }

  const title = titleArg ?? topicToTitle(topic);
  const pluginId = topicToPluginId(topic);
  const pluginDirName = `clipbus-${topic}-plugin`;
  const targetDir = path.resolve(repoRoot, pluginDirName);
  const templateDir = path.resolve(repoRoot, "template-plugin");

  // Verify template-plugin exists
  try {
    const s = await stat(templateDir);
    if (!s.isDirectory()) die(`template-plugin is not a directory: ${templateDir}`);
  } catch {
    die(`template-plugin not found at ${templateDir}`);
  }

  // Refuse to overwrite an existing directory
  try {
    await stat(targetDir);
    die(`Target directory already exists: ${targetDir}\nRemove it first or choose a different topic.`);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    // expected — directory does not exist, proceed
  }

  process.stderr.write(`scaffold: creating ${pluginDirName} in ${repoRoot}\n`);

  // ── Step 1: Copy template-plugin (excluding node_modules and dist) ──────────
  await copyDir(templateDir, targetDir, new Set(["node_modules", "dist"]));
  process.stderr.write(`scaffold: [1/8] copied template-plugin → ${pluginDirName}\n`);

  // ── Step 2: Delete template-specific feature directories and test files ──────
  const featureDirsToDelete = [
    "capability-gallery",
    "preview-renderer",
    "expanded-renderer",
    "auto-action",
  ];
  for (const dir of featureDirsToDelete) {
    await rmDir(path.join(targetDir, "src", "features", dir));
  }
  // Remove .test.cjs files (keep tests/setup.cjs)
  await deleteMatchingFiles(
    path.join(targetDir, "tests"),
    (name) => name.endsWith(".test.cjs")
  );
  process.stderr.write(`scaffold: [2/8] removed template feature dirs and test files\n`);

  // ── Step 3: Overwrite scripts with generic scaffold versions ─────────────────
  const scaffoldScriptsDir = path.resolve(__dirname, "..", "assets", "scaffold", "scripts");
  await cp(
    path.join(scaffoldScriptsDir, "build-ui.mjs"),
    path.join(targetDir, "scripts", "build-ui.mjs")
  );
  await cp(
    path.join(scaffoldScriptsDir, "verify-build.mjs"),
    path.join(targetDir, "scripts", "verify-build.mjs")
  );
  process.stderr.write(`scaffold: [3/8] replaced scripts/build-ui.mjs and verify-build.mjs\n`);

  // ── Step 4: Rewrite package.json ─────────────────────────────────────────────
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  pkg.name = `@clipbus/${topic}-plugin`;
  pkg.description = `${title} plugin for Clipbus.`;
  // Preserve all other fields (scripts, dependencies, devDependencies, etc.)
  await writeJson(pkgPath, pkg);
  process.stderr.write(`scaffold: [4/8] rewrote package.json (name: @clipbus/${topic}-plugin)\n`);

  // ── Step 5: Rewrite manifest.json as empty capability skeleton ───────────────
  const templateManifest = JSON.parse(
    await readFile(path.join(templateDir, "manifest.json"), "utf8")
  );
  const newManifest = {
    schemaVersion: templateManifest.schemaVersion ?? 2,
    plugin: {
      id: pluginId,
      title,
      version: "0.1.0",
    },
    install: templateManifest.install,
    runtime: templateManifest.runtime,
    permissions: [],
    detectors: [],
    attachmentRenderers: [],
    actions: [],
  };
  await writeJson(path.join(targetDir, "manifest.json"), newManifest);
  process.stderr.write(`scaffold: [5/8] rewrote manifest.json (id: ${pluginId})\n`);

  // ── Step 6: Rewrite src/plugin.ts as minimal skeleton ───────────────────────
  await writeText(path.join(targetDir, "src", "plugin.ts"), minimalPluginTs());
  process.stderr.write(`scaffold: [6/8] rewrote src/plugin.ts\n`);

  // ── Step 7: Replace preview scenarios and PreviewShellApp.vue ───────────────
  await writeText(
    path.join(targetDir, "src", "preview", "scenarios", "attachmentScenarios.ts"),
    minimalAttachmentScenariosTs()
  );
  await writeText(
    path.join(targetDir, "src", "preview", "scenarios", "actionScenarios.ts"),
    minimalActionScenariosTs()
  );
  await writeText(
    path.join(targetDir, "src", "preview", "PreviewShellApp.vue"),
    minimalPreviewShellApp(pluginId)
  );
  process.stderr.write(`scaffold: [7/8] replaced preview scenarios and PreviewShellApp.vue\n`);

  // ── Step 8: Confirm preserved files ─────────────────────────────────────────
  // (src/shared/, tsconfig.json, vite.config.mjs, eslint.config.mjs, env.d.ts,
  //  .gitignore, scripts/build-runtime.mjs, scripts/install.mjs were all
  //  copied in Step 1 and are untouched.)
  process.stderr.write(`scaffold: [8/8] preserved shared/, tsconfig, vite/eslint configs\n`);

  console.log(`
Scaffold complete: ${targetDir}

Plugin id : ${pluginId}
Title     : ${title}

Next steps:
  cd ${pluginDirName}
  npm install
  # Author capabilities in src/features/<id>/  (dir name === manifest id)
  # Register them in src/plugin.ts and manifest.json
  npm run verify
`);
}

main().catch((e) => {
  process.stderr.write(`scaffold: fatal: ${e.message}\n${e.stack ?? ""}\n`);
  process.exit(1);
});
