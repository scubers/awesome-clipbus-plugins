# 架构速查（生成插件前先读）

> 能力签名的**唯一真相源**是已安装 SDK 的 `node_modules/@clipbus/plugin-sdk/API.md`。本文给心智模型与接线规则；具体签名以 API.md 为准，本仓库示例可能滞后。

## 合集模型

仓库 = 一堆剪贴板插件，**一插件一目录**（`clipbus-{topic}-plugin`）。`template-plugin/` 是样板。每个插件**自包含、独立 `npm install` 与构建**，没有根级构建编排。

## 两侧架构（核心心智模型）

每个插件由两套独立构建、经宿主桥接通信的代码组成：

- **Runtime 侧（Node）**：入口 `src/plugin.ts` → `definePlugin({ setup() })`，**以 manifest 能力 id 为 key** 注册 `attachmentRenderers / detectors / actions / messageHandlers`。从 `@clipbus/plugin-sdk/runtime` 导入。esbuild 打成 `dist/plugin.cjs`（CJS，宿主 require）。
- **UI 侧（WebView）**：每个 UI 承载能力一套 `app.vue` + `main.ts` + `index.html`。从 `@clipbus/plugin-sdk/ui` 导入 `clipbus` 对象、`/dom` 导入 `patchConsole`/`patchTextInputState`。Vite 打 IIFE 到 `dist/ui/{renderers,actions}/<id>/`。
- **通信**：① 宿主事件 **topic**（如 `clipbus.item.attachment` / `clipbus.theme`），UI 用 `shared/composables/useTopicRef.ts` 订成响应式 ref；② **RPC**：UI `clipbus.runtime.invoke({ key, payload })` ↔ Runtime 用 `defineMessage(key).handle(fn)` 注册的 `messageHandlers`。

## 四个扩展点

| 扩展点 | Runtime 侧 | UI 侧 | 何时用 |
|---|---|---|---|
| **detector** | `detect(input)` 返回 artifacts | 无 | 识别内容产出 artifact。两面：**附件**（要展示成卡片就**必配 renderer**）+ **可选 `searchProjection`**（喂宿主搜索索引、如 OCR 文本，不展示、无需 renderer）。 |
| **attachment renderer** | `resolveAttachment(input)` | `app.vue` 卡片 | 展示识别结果。高度三形态：定值数字 / `"auto"` / `{min,max}`（配 `clipbus.window.autoFit()`）。 |
| **auto-run action** | `runAutoAction(input,ctx)` 返回 `actionResult.text/image/none` | 无 | 一键处理（如复制转换结果）。 |
| **draft action** | `resolveSession(input,ctx)` 给初始 draft + buttons | `app.vue` 表单，提交走 `clipbus.action.complete()` | 需要用户输入/选择后再产出。 |

> **扩展点按需，别凑三件套。** 触发成本递增：detector 复制时**自动**挂附件（零操作）；renderer 选中时**自动**展示，可内置**一键**复制按钮；auto-run action 要用户 **cmd+k 打开面板→选中**才运行（比一键复制多好几步）。推论：① detector 的 artifact 两面——**要展示的附件必配 renderer**（否则附件无法显示），但**只做 `searchProjection` 搜索投影的 detector 无需 renderer**（喂搜索索引、如 OCR 文本可被搜到）；② **renderer 已展示某值且有一键复制按钮时，禁止再加返回同一值的 auto-run copy-action**（纯冗余，用户永远用更快的 renderer 按钮）。auto-run action 只在能提供 renderer 给不了的东西时才加：要么无 detector/renderer（action 是唯一入口，如纯文本 sort/dedup/trim），要么产出 renderer 未覆盖的结果。draft 仅当需要用户输入/选择。

## 输入：仅三种 kind

`text` / `image` / `path_reference`（**snake_case**；旧拼写 `pathReference` 会被拒）。content envelope **扁平**——变体字段与 `kind` 同级（如 text 的 `content.text`、image 的 `content.{width,height,format,bytes}`、path_reference 的 `content.entries[]`），不嵌套。

## 本 skill 的通用约定（与 template 的差异）

样板 `template-plugin` 的 `build-ui.mjs` 写死了 `template-` 前缀和特例；本 skill 的 scaffold 产出的新插件**已通用化**，约定更简单：

- **feature 目录名 === manifest 能力 id**。UI 承载能力（每个 renderer、每个带 `uiEntry` 的 draft action）各自一个 `src/features/<id>/` 目录，含 `main.ts`+`index.html`。
- `scripts/build-ui.mjs`：扫 `src/features/*`，目录名即 id，**读 manifest** 判断它属 renderers 还是 actions，输出到 `dist/ui/<kind>/<id>/`。无前缀、无 overrides。
- `scripts/verify-build.mjs`：**读 manifest** 推导期望产物——`dist/plugin.cjs` 含每个能力 id 字符串；每个 UI 能力的 `dist/ui/<kind>/<id>/{index.html,js,css}` 齐全且 HTML 引用页内相对资源。
- detector / auto-run action **无 UI**：纯运行时代码，可与相关 renderer 同目录或单放，不需要 main.ts/index.html。
- **`payload.ts` 必须 UI 安全**：它被 `app.vue`（浏览器）与 runtime 同时 import，**不能 `import … from "node:*"`**（`node:crypto`/`fs` 等）——Vite 打 UI 包时 Rollup 解析不了会 `MISSING_EXPORT`，`build:ui` 直接失败。需 Node API 算 payload 时，拆出 runtime-only 的 `builder.ts` 承载（`create*Payload`/`build*Artifact` + Node import），`payload.ts` 只留类型 + `decode*Payload`。详见 authoring-guide 第 2 节。

## 接线不变量

1. **三处 id 对齐**：manifest `id` === `plugin.ts` 注册 key === `src/features/<dir>` 目录名。
2. **manifest `uiEntry`** = `renderers/<id>/index.html` 或 `actions/<id>/index.html`。
3. **要展示的附件 ⇒ 必配对应 renderer**；只做 `searchProjection` 搜索投影、不展示卡片的 detector 无需 renderer。
4. UI CSS 只用 `var(--clipbus-*, 回退)` 主题 token。
5. 不改 node_modules 内 SDK；签名以 API.md 为准。
6. **相对 `.ts` import 带 `.ts` 扩展名**：`.ts` 运行时文件间的相对 import 用 `.ts`（冒烟测试用 Node 直接 require）；`.vue` 文件内可不带。
7. **attachmentType 在插件命名空间内**：detector/renderer 的 `attachmentType` 必须 `plugin.id + "."` 前缀（`plugin.<topic>.<feat>`）。**宿主加载期强制**，越界拒载报 `... outside plugin namespace ...`；`npm run verify` **不校验**。合并/扩展插件时把 feature 的 attachmentType 改到**宿主**命名空间（manifest detector+renderer、`payload.ts` 常量、测试与 scenario 全部同步）。

## manifest 骨架

```jsonc
{
  "schemaVersion": 3,
  "plugin": { "id": "plugin.<topic>", "title": "...", "version": "0.1.0" },
  "install": { "runtime": "node", "entry": "scripts/install.mjs" },
  "runtime": { "nodeEntry": "dist/plugin.cjs", "uiRoot": "dist/ui" },
  "permissions": [],                 // 按需：setAttachment/setSearchExtension/setTags/setPinned
  "attachmentRenderers": [
    { "id": "<id>", "title": "...", "attachmentType": "plugin.<topic>.<feat>",  // 必须 plugin.id 前缀（宿主加载期强制）
      "height": 220, "uiEntry": "renderers/<id>/index.html" }
  ],
  "detectors": [
    { "id": "<id>", "title": "...", "supportedInputKinds": ["text"],
      "attachmentTypes": ["plugin.<topic>.<feat>"] }
  ],
  "actions": [
    { "id": "<id>", "title": "...", "supportedInputKinds": ["text"],
      "lifecycle": "auto-run", "keywords": ["..."] }
    // draft 多一个 "uiEntry": "actions/<id>/index.html"，lifecycle:"draft"
  ]
}
```

schema v3 下 Action Runtime 收到 `{ sourceItem, content, attachments }`：
`sourceItem` 是原始剪贴板身份，`content` 是可由前序 auto-run Action 改变 kind 的当前级联值。
Action 的过滤和处理必须依据 `content.kind`，不能依据 `sourceItem.type`。

## 常用命令（插件目录内）

- `npm install` — 装 SDK（带来权威文档 docs/ 与 API.md）。
- `npm run dev` — Vite 预览工作台（`?view=renderer` / `?view=action`）。
- `npm run build` — typecheck → lint → 构建 → verify-build。
- `npm test` — Node test runner 跑 `tests/**/*.test.cjs`。
- `npm run verify` — build + test（**完成门槛**）。
- 单测：`node --experimental-strip-types --require ./tests/setup.cjs --test ./tests/runtime/<x>.test.cjs`。

## 权限模型

`manifest.permissions[]` 声明后，对应 host 写操作才放行：`setAttachment`（挂附件）、`setSearchExtension`（搜索投影）、`setTags`、`setPinned`。只声明用到的。

## Plugin Pro 配额（知道即可，别触发）

免费档 action 上限 3；声明更多会出 gating 提示。新插件除非选题真需要，别堆超过 3 个 action。
