# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 仓库性质：Clipbus 插件合集

这是一个**剪贴板（Clipbus）插件合集工程**，约定 **一个插件一个文件夹**（顶层目录）。

- `template-plugin/` 是官方**脚手架样板 + 全能力参考**，不是被引用的库——它是被**复制**的起点。
- **新增插件 = 把 `template-plugin/` 整体复制到一个同级新文件夹**，再按下文“新增插件流程”改名定制。
- 仓库根目录**没有** `package.json`、没有 workspace、没有统一构建编排。每个插件**自包含、各自独立** `npm install` 与构建。所有命令都在**某个插件目录内**运行，而非仓库根。

## 最重要：权威开发文档在 SDK 包内，且当前未安装

插件开发的全部**权威文档**（架构、`manifest.json` 字段、SDK 入口、detector/renderer/action、入参形状、UI↔Runtime RPC、权限、坑点）随 `@clipbus/plugin-sdk` 一起发布，`npm install` 后落在本地：

- **文档地图（先读这个）**：`node_modules/@clipbus/plugin-sdk/docs/README.md`
- **capability 真相源**：`node_modules/@clipbus/plugin-sdk/API.md`（codegen 直出，签名以它为准）
- **扩展能力的规范/流程**：SDK 包内 `SPECIFICATION.md`

工作约定（见 `template-plugin/AGENTS.md`）：

- ⚠️ **当前仓库尚未 `npm install`**，`node_modules/@clipbus/plugin-sdk/` 不存在。动手写代码前，先进入目标插件目录执行 `npm install`，否则读不到权威文档、类型也无法解析。
- 本仓库内的代码、`GUIDE.md` 与注释是**示例/脚手架说明，可能滞后于已安装的 SDK**。**与 SDK 文档冲突时以 SDK 文档为准；capability 签名以 `API.md` 为准。**
- **不要**查看或修改 `node_modules/@clipbus/plugin-sdk/` 内的 SDK 源码（由 codegen 维护）。
- `template-plugin/GUIDE.md` 只覆盖脚手架工作流（起步、本地开发、在 Clipbus 调试、构建、测试）。

## 常用命令（在某个插件目录内运行）

```sh
npm install        # 必须最先执行——拉取 @clipbus/plugin-sdk 及其权威文档
npm run dev        # Vite 预览工作台 (?view=renderer / ?view=action)；另有 dev:renderer / dev:action
npm run build      # typecheck → lint → clean → build:runtime → build:ui → verify:build，产物到 dist/
npm test           # Node 原生 test runner，跑 tests/ 下的 .cjs 集成/运行时测试
npm run verify     # build + test，提交前的完整门禁
npm run typecheck  # vue-tsc --noEmit
npm run lint       # eslint .（lint:fix 自动修复）
```

跑**单个测试文件**（无封装脚本，直接用 Node 的 test runner）：

```sh
node --experimental-strip-types --require ./tests/setup.cjs --test ./tests/runtime/templateCapabilities.test.cjs
# 追加 --test-name-pattern="template detector" 可只跑匹配名称的用例
```

**在 Clipbus 中调试**：Settings → Plugins → Developer Plugins → **Add Path**，选中含 `manifest.json` 的插件目录；若 manifest 声明了 `install` 钩子，Clipbus 会自动以该目录为工作目录运行它（等价于 `npm install`）。Reload 重读 manifest，Run Install 重跑安装钩子。

## 架构：Runtime（Node）+ UI（WebView）两侧

每个插件由两套独立构建、通过宿主桥接通信的代码组成：

- **Runtime 侧（Node）**：唯一入口 `src/plugin.ts` → `definePlugin({ setup() })`，按 **manifest id 为 key** 注册 `attachmentRenderers` / `detectors` / `actions` / `messageHandlers`。从 `@clipbus/plugin-sdk/runtime` 导入。`scripts/build-runtime.mjs` 用 **esbuild** 打成 `dist/plugin.cjs`（CJS，宿主 `require()` 它）。
- **UI 侧（WebView）**：每个 feature 一套 `app.vue` + `main.ts` + `index.html`。从 `@clipbus/plugin-sdk/ui` 导入 `clipbus` 对象、从 `/dom` 导入 `patchConsole`/`patchTextInputState`。`scripts/build-ui.mjs` 用 **Vite** 按页打成 IIFE，输出到 `dist/ui/{renderers,actions}/<id>/`。
- **两侧通信**：① 宿主事件 **topic**（如 `clipbus.item.attachment` / `clipbus.theme`），UI 用 `src/shared/composables/useTopicRef.ts` 订阅为响应式 ref；② **RPC**：UI `clipbus.runtime.invoke({ key, payload })` ↔ Runtime 用 `defineMessage<Req,Resp>(key).handle(fn)` 注册的 `messageHandlers`。

### 四种扩展点

| 扩展点 | Runtime 侧 | UI 侧 | 要点 |
|---|---|---|---|
| **detector** | `detect()` 返回 artifacts | 无 | 输入仅三种 kind；产出 `{ attachmentType, attachmentKey, payloadJson, searchProjection }` |
| **attachment renderer** | `resolveAttachment()` | `app.vue` 卡片 | 高度三形态：定值数字 / `"auto"` / `{min,max}`（配 `clipbus.window.autoFit()`） |
| **action** | `auto-run`：`runAutoAction()` 返回 `actionResult.text/image/none`；`draft`：`resolveSession()` 给初始 draft/buttons | `draft` 才有 `app.vue` 表单，提交走 `clipbus.action.complete()` | lifecycle 在 manifest 声明 |
| **messageHandlers** | `defineMessage().handle()` 包一层 host.* | UI 通过 `clipbus.runtime.invoke` 调 | UI↔Node 自定义 RPC 桥 |

## 跨文件接线不变量（最易踩坑，务必对齐）

新增/重命名任何能力时，以下几处**必须同步**，否则构建或宿主加载失败：

1. **三处 id 必须完全一致**：`manifest.json` 里能力的 `id` === `src/plugin.ts setup()` 注册的 handler key === UI 构建输出目录名。
2. **`manifest.uiEntry`** 必须指向 `renderers/<id>/index.html` 或 `actions/<id>/index.html`，与 `dist/ui` 布局对应。
3. **`scripts/build-ui.mjs` 的 `discoverPages()`** 按命名约定把 `src/features/<name>/` 映射到 manifest id（`template-{name}`，其中 `preview-renderer`→`template-renderer`）。**嵌套 UI 目录**（如 `capability-gallery/*-ui/`）不走约定，必须在 `NESTED_OVERRIDES` 里登记映射，**漏登记构建会直接抛错**。
4. **`scripts/verify-build.mjs` 硬编码了**期望出现的 runtime bundle 字符串清单与 UI 产物目录清单。新增/改名能力后，要把它的 allowlist 一并更新，否则 `build` 末尾校验失败。
5. `tests/integration/galleryWiring.test.cjs` 等契约测试会校验 manifest ↔ catalog ↔ 构建映射的一致性。

## Feature 内部约定

- 每个 feature 目录下的 **`payload.ts` 是该附件 payload 的单一真相源**：`create*Payload`（构造）/ `decode*Payload`（带校验解析）/ `build*Artifact`（detector 产出）。payload 以 JSON 存入 `payloadJson`，并带 `version` 字段用于迁移。
- `src/shared/` 是跨 feature 的薄工具层：`display.ts`（`buildContentDisplay`/`buildItemDisplay`/`mapContentKind`/`buildSearchText`）、`debug.ts`（`cloneJSON`/快照/格式化）、`base.css`（主题 token）、`composables/useTopicRef.ts`。一般无需改动。
- `src/features/capability-gallery/` 是“全 SDK 能力演示”参考（覆盖几乎全部 capability/host event/权限/高度形态），写新插件时当字典查，不要把它的“厨房水槽”整套抄进精简插件。

## 约定与坑

- **输入只有三种 kind**：`text` / `image` / `path_reference`（**snake_case**；旧拼写 `pathReference` 会被测试显式拒绝）。content envelope 是**扁平**的——变体字段与 `kind` 同级，不嵌套。
- **UI 的 CSS 必须用主题 token** `var(--clipbus-..., 回退色)`，不能写裸 hex（测试会扫描 `<style scoped>` 强制）。
- **esbuild footer hack**：`build-runtime.mjs` 把 `module.exports.default` 解包成 `module.exports`，因为宿主 `require()` 的是裸导出。入口**不要**用 TS `export =`（会破坏测试用 `--experimental-strip-types` 直接 `require('.ts')` 的加载）。
- **测试是 `.cjs`**，通过 `require()` 直接加载 `.ts` 源（`--experimental-strip-types`），`tests/setup.cjs` 为预加载 polyfill。
- **权限**在 `manifest.permissions[]` 声明（`setAttachment` / `setSearchExtension` / `setTags` / `setPinned`），对应的 host 写操作才被放行。
- **Plugin Pro 配额**：免费档 action 上限为 3；声明更多会触发宿主的 gating 提示。template **故意**多声明 action 以演示该行为——不是 bug。

## 新增插件流程

1. 复制 `template-plugin/` 为同级新文件夹（如 `my-plugin/`），`cd` 进去 `npm install`。
2. 改 `manifest.json`：`plugin.id`、`title`、各能力 `id` 与 `attachmentType`、能力清单、`permissions`。
3. 改 `src/plugin.ts`：`setup()` 注册的 handler key 必须与 manifest 的 `id` 一一对应。
4. 按需改各 `src/features/<feature>/` 的 `payload.ts` / `detector.ts` / `renderer.ts` / `action.ts` / `app.vue`；删掉用不到的 feature 时，记得同步删 manifest 条目、`plugin.ts` 注册、以及 `build-ui.mjs`/`verify-build.mjs` 中的相关引用。
5. `npm run verify` 通过后，按上文“在 Clipbus 中调试”加载验证。
