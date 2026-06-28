#!/usr/bin/env node
/**
 * bump-clipbus-sdk.mjs — 批量更新本合集里每个 Clipbus 插件的 @clipbus/* 依赖版本，
 * 再逐个 `npm install`，让 lockfile / node_modules 落到新版本。
 *
 * 用法:
 *   node scripts/bump-clipbus-sdk.mjs [version] [options]
 *
 *   version            目标版本。
 *                        · 纯版本号(如 0.8.6) → 保留各插件原有 range 前缀(^ / ~ / 精确)
 *                        · 带前缀(如 ^0.8.6 / ~0.8.6) → 原样使用，覆盖各插件前缀
 *                        · 省略 → 查 npm registry 的最新版(需联网)
 *
 * options:
 *   --dry-run          只预览版本变更，不写盘、不 install
 *   --no-install       只改 package.json，跳过 npm install
 *   --parallel         并行 install(默认串行，输出更清晰、更易排查)
 *   --package <name>   只更新指定包(默认更新所有 @clipbus/* 依赖)
 *   --root <dir>       仓库根目录(默认 = 本脚本上级目录)
 *   -h, --help         显示帮助
 *
 * 行为:
 *   - 自动发现仓库根下所有「同时含 manifest.json + package.json」的目录(含 template-plugin)。
 *   - 只替换目标依赖那一行的版本号，其余格式不动 → diff 最小。
 *   - install 尊重各目录的 lockfile 策略:被 git 跟踪 lockfile 的目录正常 install(更新 lockfile)；
 *     未跟踪 lockfile 的目录(如 template-plugin)自动加 --no-package-lock，不再引入。
 *   - 单个目录失败不中断其余；末尾汇总，有失败则退出码 1。
 */
import { execFileSync, execFile } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const NPM = process.platform === "win32" ? "npm.cmd" : "npm";
const SCOPE = "@clipbus/";
const DEP_SECTIONS = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseArgs(argv) {
  const o = { version: null, dryRun: false, install: true, parallel: false, package: null, root: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") o.dryRun = true;
    else if (a === "--no-install") o.install = false;
    else if (a === "--parallel") o.parallel = true;
    else if (a === "--package") o.package = argv[++i];
    else if (a === "--root") o.root = argv[++i];
    else if (a === "-h" || a === "--help") o.help = true;
    else if (a.startsWith("--")) throw new Error(`未知选项: ${a}`);
    else if (o.version === null) o.version = a;
    else throw new Error(`多余的位置参数: ${a}`);
  }
  return o;
}

/** 仓库根下所有同时含 manifest.json + package.json 的直接子目录(只扫一层，worktree/ 等天然排除)。 */
function discoverPlugins(root) {
  return readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter(
      (name) =>
        existsSync(path.join(root, name, "manifest.json")) &&
        existsSync(path.join(root, name, "package.json"))
    )
    .sort();
}

/** 该目录是否把 package-lock.json 纳入 git 跟踪(决定 install 要不要 --no-package-lock)。 */
function tracksLockfile(root, dir) {
  try {
    const out = execFileSync("git", ["ls-files", "--", path.join(dir, "package-lock.json")], {
      cwd: root,
      encoding: "utf8",
    });
    return out.trim().length > 0;
  } catch {
    // 非 git 环境兜底:按文件是否存在判断。
    return existsSync(path.join(root, dir, "package-lock.json"));
  }
}

/** 由「当前 spec」+「目标版本」算出新 spec：保留原 ^/~ 前缀，除非目标已自带前缀或是非数字 range。 */
function resolveSpec(currentSpec, target) {
  if (/^[\^~]/.test(target)) return target; // 目标自带前缀 → 尊重之
  if (!/^\d/.test(target)) return target; // dist-tag / 复杂 range(如 latest、>=x) → 原样
  const prefix = (currentSpec.match(/^[\^~]/) || [""])[0]; // 保留各插件原前缀
  return prefix + target;
}

const latestCache = new Map();
function latestVersion(pkg) {
  if (!latestCache.has(pkg)) {
    const v = execFileSync(NPM, ["view", pkg, "version"], { encoding: "utf8" }).trim();
    if (!v) throw new Error(`无法从 registry 解析 ${pkg} 的最新版本`);
    latestCache.set(pkg, v);
  }
  return latestCache.get(pkg);
}

/** 在 package.json 原文里把某依赖的版本号就地替换，只动目标那一行。 */
function bumpInText(text, pkg, oldSpec, newSpec) {
  const re = new RegExp(`("${escapeRe(pkg)}"\\s*:\\s*)"${escapeRe(oldSpec)}"`);
  if (!re.test(text)) return { text, ok: false };
  return { text: text.replace(re, `$1"${newSpec}"`), ok: true };
}

/** 计算单个插件目录的版本变更(不写盘)。 */
function planPlugin(root, dir, explicitVersion, onlyPackage) {
  const pkgPath = path.join(root, dir, "package.json");
  const raw = readFileSync(pkgPath, "utf8");
  const json = JSON.parse(raw);
  const changes = [];
  for (const section of DEP_SECTIONS) {
    const deps = json[section];
    if (!deps) continue;
    for (const [name, oldSpec] of Object.entries(deps)) {
      if (!name.startsWith(SCOPE)) continue;
      if (onlyPackage && name !== onlyPackage) continue;
      const target = explicitVersion ?? latestVersion(name);
      const newSpec = resolveSpec(oldSpec, target);
      changes.push({ section, name, oldSpec, newSpec, changed: newSpec !== oldSpec });
    }
  }
  return { dir, pkgPath, raw, changes };
}

function writePlugin(plan) {
  let text = plan.raw;
  const failed = [];
  for (const c of plan.changes) {
    if (!c.changed) continue;
    const r = bumpInText(text, c.name, c.oldSpec, c.newSpec);
    if (!r.ok) failed.push(c.name);
    else text = r.text;
  }
  if (failed.length) throw new Error(`无法在 package.json 文本里定位: ${failed.join(", ")}`);
  if (text !== plan.raw) writeFileSync(plan.pkgPath, text);
}

function installArgs(root, dir) {
  const args = ["install"];
  if (!tracksLockfile(root, dir)) args.push("--no-package-lock");
  return args;
}

function runInstallSerial(root, dirs) {
  const results = [];
  for (const dir of dirs) {
    const args = installArgs(root, dir);
    const tag = args.includes("--no-package-lock") ? " (--no-package-lock)" : "";
    process.stdout.write(`\n── npm ${args.join(" ")} @ ${dir}${tag} ──\n`);
    try {
      execFileSync(NPM, args, { cwd: path.join(root, dir), stdio: "inherit" });
      results.push({ dir, ok: true, tag });
    } catch (err) {
      results.push({ dir, ok: false, tag, error: String(err.message || err).split("\n")[0] });
    }
  }
  return results;
}

async function runInstallParallel(root, dirs) {
  process.stdout.write(`\n并行 install ${dirs.length} 个目录(输出在各自完成后统一打印)…\n`);
  const jobs = dirs.map(async (dir) => {
    const args = installArgs(root, dir);
    const tag = args.includes("--no-package-lock") ? " (--no-package-lock)" : "";
    try {
      await execFileAsync(NPM, args, { cwd: path.join(root, dir), maxBuffer: 64 * 1024 * 1024 });
      return { dir, ok: true, tag };
    } catch (err) {
      return { dir, ok: false, tag, error: String(err.message || err).split("\n")[0] };
    }
  });
  return Promise.all(jobs);
}

const HELP = `bump-clipbus-sdk.mjs — 批量更新各 Clipbus 插件的 @clipbus/* 依赖版本并 npm install

用法:
  node scripts/bump-clipbus-sdk.mjs [version] [options]

  version          目标版本(纯版本 0.8.6 保留各插件前缀；带前缀 ^0.8.6 原样；省略=registry 最新版)

options:
  --dry-run        只预览版本变更，不写盘、不 install
  --no-install     只改 package.json，跳过 npm install
  --parallel       并行 install(默认串行)
  --package <name> 只更新指定包(默认所有 @clipbus/*)
  --root <dir>     仓库根(默认=脚本上级目录)
  -h, --help       显示帮助
`;

async function main() {
  let o;
  try {
    o = parseArgs(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(`参数错误: ${e.message}\n\n${HELP}`);
    process.exit(2);
  }
  if (o.help) {
    process.stdout.write(HELP);
    return;
  }

  const root = path.resolve(o.root ?? path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
  const plugins = discoverPlugins(root);
  if (plugins.length === 0) {
    process.stderr.write(`未在 ${root} 下发现任何含 manifest.json + package.json 的插件目录\n`);
    process.exit(1);
  }

  // 解析目标版本来源说明
  let versionLabel;
  if (o.version) versionLabel = `指定版本 ${o.version}`;
  else {
    try {
      const probe = o.package ?? `${SCOPE}plugin-sdk`;
      versionLabel = `registry 最新版(${probe}@${latestVersion(probe)})`;
    } catch (e) {
      process.stderr.write(`查询 registry 最新版失败: ${e.message}\n请改为显式传入版本号，例如:\n  node scripts/bump-clipbus-sdk.mjs 0.8.6\n`);
      process.exit(1);
    }
  }

  process.stdout.write(`仓库根: ${root}\n`);
  process.stdout.write(`插件目录: ${plugins.length} 个\n`);
  process.stdout.write(`目标: ${versionLabel}${o.package ? `  (仅 ${o.package})` : "  (所有 @clipbus/*)"}\n\n`);

  // 阶段 1 — 规划版本变更
  const plans = [];
  for (const dir of plugins) {
    try {
      plans.push(planPlugin(root, dir, o.version, o.package));
    } catch (e) {
      process.stderr.write(`✗ ${dir}: 解析 package.json 失败 — ${e.message}\n`);
      plans.push({ dir, error: e.message, changes: [] });
    }
  }

  process.stdout.write("版本变更:\n");
  let anyChange = false;
  for (const p of plans) {
    if (p.error) {
      process.stdout.write(`  ${p.dir.padEnd(28)} ✗ ${p.error}\n`);
      continue;
    }
    if (p.changes.length === 0) {
      process.stdout.write(`  ${p.dir.padEnd(28)} (无 @clipbus/* 依赖)\n`);
      continue;
    }
    for (const c of p.changes) {
      if (c.changed) anyChange = true;
      const line = c.changed ? `${c.oldSpec} → ${c.newSpec}` : `${c.newSpec} (unchanged)`;
      process.stdout.write(`  ${p.dir.padEnd(28)} ${c.name}  ${line}\n`);
    }
  }
  process.stdout.write("\n");

  if (o.dryRun) {
    process.stdout.write("dry-run: 未写盘、未 install。去掉 --dry-run 即可应用。\n");
    return;
  }

  // 阶段 2 — 写回 package.json
  if (anyChange) {
    for (const p of plans) {
      if (p.error) continue;
      try {
        writePlugin(p);
      } catch (e) {
        process.stderr.write(`✗ ${p.dir}: 写回失败 — ${e.message}\n`);
        p.error = e.message;
      }
    }
    process.stdout.write("已写回 package.json。\n");
  } else {
    process.stdout.write("所有目录版本已是目标值，无需改写 package.json。\n");
  }

  // 阶段 3 — npm install（用户意图:每个目录都跑一遍）
  if (!o.install) {
    process.stdout.write("\n--no-install: 跳过 npm install。\n");
    return;
  }
  const installDirs = plans.filter((p) => !p.error).map((p) => p.dir);
  const results = o.parallel
    ? await runInstallParallel(root, installDirs)
    : runInstallSerial(root, installDirs);

  // 汇报
  process.stdout.write("\n=== npm install 结果 ===\n");
  const failed = [];
  for (const r of results) {
    if (r.ok) process.stdout.write(`  ✓ ${r.dir}${r.tag}\n`);
    else {
      failed.push(r.dir);
      process.stdout.write(`  ✗ ${r.dir}${r.tag} — ${r.error}\n`);
    }
  }
  process.stdout.write(`\n成功 ${results.length - failed.length}/${results.length}` + (failed.length ? `，失败: ${failed.join(", ")}\n` : "，全部通过。\n"));
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  process.stderr.write(`未捕获错误: ${e?.stack || e}\n`);
  process.exit(1);
});
