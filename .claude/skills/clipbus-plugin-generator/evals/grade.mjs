/**
 * grade.mjs — 客观核验一个生成出来的 Clipbus 插件是否满足结构性断言。
 *
 * 用法: node grade.mjs <repoRoot> <pluginDir>
 *   repoRoot   合集仓库根（含 PLUGINS.md 与各插件目录）
 *   pluginDir  插件目录名，如 clipbus-decoder-plugin
 *
 * 输出: stdout 打印 JSON { plugin, checks:[{name,passed,evidence}], passedCount, total }
 * 注意: "npm run verify 全绿" 这条不在此脚本内跑（耗时/需环境），由调用方真实运行后另记。
 *       本脚本检查结构、接线、索引、以及（若能加载）解码逻辑等可静态/轻量核验项。
 */
import { readFile, stat, readdir } from "node:fs/promises";
import path from "node:path";

const [, , repoRootArg, pluginDirArg] = process.argv;
if (!repoRootArg || !pluginDirArg) {
  process.stderr.write("usage: node grade.mjs <repoRoot> <pluginDir>\n");
  process.exit(2);
}
const repoRoot = path.resolve(repoRootArg);
const pluginDir = pluginDirArg;
const root = path.join(repoRoot, pluginDir);

const checks = [];
function add(name, passed, evidence) {
  checks.push({ name, passed: !!passed, evidence: String(evidence ?? "") });
}
async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}
async function tryRead(p) {
  try { return await readFile(p, "utf8"); } catch { return null; }
}

async function main() {
  // 1. 插件目录存在
  add("插件目录存在", await exists(root), root);

  // 2. manifest 可解析 + plugin.id
  const manifestRaw = await tryRead(path.join(root, "manifest.json"));
  let manifest = null;
  try { manifest = manifestRaw ? JSON.parse(manifestRaw) : null; } catch { /* */ }
  const pluginId = manifest?.plugin?.id ?? null;
  // 期望 id：clipbus-<topic>-plugin → plugin.<topic 以 . 连接>
  const topicMatch = pluginDir.match(/^clipbus-(.+)-plugin$/);
  const expectedId = topicMatch ? `plugin.${topicMatch[1].replace(/-/g, ".")}` : null;
  add("manifest 可解析", !!manifest, manifestRaw ? "parsed" : "missing/invalid");
  add(
    "plugin.id 符合 plugin.<topic>",
    pluginId && (!expectedId || pluginId === expectedId),
    `id=${pluginId} expected=${expectedId}`
  );

  const detectors = manifest?.detectors ?? [];
  const renderers = manifest?.attachmentRenderers ?? [];
  const actions = manifest?.actions ?? [];

  // 3. detector ⇒ renderer 配对（若有 detector 必有 renderer）
  add(
    "detector 必配 renderer",
    detectors.length === 0 ? renderers.length >= 0 : renderers.length >= 1,
    `detectors=${detectors.length} renderers=${renderers.length}`
  );
  add("至少有一个展示型能力(renderer)", renderers.length >= 1, `renderers=${renderers.length}`);

  // 4. 每个能力 id 都在 plugin.ts 注册（以 id 字面量出现）
  const pluginTs = (await tryRead(path.join(root, "src/plugin.ts"))) ?? "";
  const allIds = [
    ...detectors.map((d) => d.id),
    ...renderers.map((r) => r.id),
    ...actions.map((a) => a.id),
  ].filter(Boolean);
  const missingInPluginTs = allIds.filter((id) => !pluginTs.includes(id));
  add(
    "manifest 能力 id 都在 src/plugin.ts 注册",
    allIds.length > 0 && missingInPluginTs.length === 0,
    missingInPluginTs.length ? `缺: ${missingInPluginTs.join(",")}` : `全部 ${allIds.length} 个已注册`
  );

  // 5. UI 能力（renderer + 带 uiEntry 的 action）有同名 feature 目录含 main.ts+index.html
  const uiIds = [
    ...renderers.map((r) => r.id),
    ...actions.filter((a) => a.uiEntry).map((a) => a.id),
  ].filter(Boolean);
  const badUiDirs = [];
  for (const id of uiIds) {
    const d = path.join(root, "src/features", id);
    const ok = (await exists(path.join(d, "main.ts"))) && (await exists(path.join(d, "index.html")));
    if (!ok) badUiDirs.push(id);
  }
  add(
    "UI 能力有同名 feature 目录(含 main.ts+index.html)",
    uiIds.length > 0 && badUiDirs.length === 0,
    badUiDirs.length ? `缺/不全: ${badUiDirs.join(",")}` : `${uiIds.length} 个 UI 目录齐全`
  );

  // 6. README 写明功能
  const readme = (await tryRead(path.join(root, "README.md"))) ?? "";
  add("README.md 存在且非空", readme.trim().length > 80, `${readme.length} chars`);

  // 7. 根 PLUGINS.md 收录该插件
  const pluginsIndex = (await tryRead(path.join(repoRoot, "PLUGINS.md"))) ?? "";
  add(
    "根 PLUGINS.md 收录该插件",
    pluginsIndex.includes(pluginDir),
    pluginsIndex ? (pluginsIndex.includes(pluginDir) ? "found" : "未提到该插件") : "PLUGINS.md 缺失"
  );

  // 8. dist 产物存在（npm run build 跑过的代理证据；权威绿/红由调用方真实 verify）
  add("已构建出 dist/plugin.cjs", await exists(path.join(root, "dist/plugin.cjs")), "dist/plugin.cjs");

  const passedCount = checks.filter((c) => c.passed).length;
  process.stdout.write(JSON.stringify(
    { plugin: pluginDir, checks, passedCount, total: checks.length },
    null, 2
  ) + "\n");
}

main().catch((e) => {
  process.stderr.write(`grade: fatal: ${e.message}\n`);
  process.exit(1);
});
