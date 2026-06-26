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
| **detector** | `detect(input)` 返回 artifacts | 无 | 想识别某类剪贴板内容并挂附件。**必须配 renderer**。 |
| **attachment renderer** | `resolveAttachment(input)` | `app.vue` 卡片 | 展示识别结果。高度三形态：定值数字 / `"auto"` / `{min,max}`（配 `clipbus.window.autoFit()`）。 |
| **auto-run action** | `runAutoAction(input,ctx)` 返回 `actionResult.text/image/none` | 无 | 一键处理（如复制转换结果）。 |
| **draft action** | `resolveSession(input,ctx)` 给初始 draft + buttons | `app.vue` 表单，提交走 `clipbus.action.complete()` | 需要用户输入/选择后再产出。 |

> 纯 detector（不配 renderer）没意义——识别了却不展示。auto-run / draft 按选题是否需要"动作"来加。

## 输入：仅三种 kind

`text` / `image` / `path_reference`（**snake_case**；旧拼写 `pathReference` 会被拒）。content envelope **扁平**——变体字段与 `kind` 同级（如 text 的 `content.text`、image 的 `content.{width,height,format,bytes}`、path_reference 的 `content.entries[]`），不嵌套。

## 本 skill 的通用约定（与 template 的差异）

样板 `template-plugin` 的 `build-ui.mjs` 写死了 `template-` 前缀和特例；本 skill 的 scaffold 产出的新插件**已通用化**，约定更简单：

- **feature 目录名 === manifest 能力 id**。UI 承载能力（每个 renderer、每个带 `uiEntry` 的 draft action）各自一个 `src/features/<id>/` 目录，含 `main.ts`+`index.html`。
- `scripts/build-ui.mjs`：扫 `src/features/*`，目录名即 id，**读 manifest** 判断它属 renderers 还是 actions，输出到 `dist/ui/<kind>/<id>/`。无前缀、无 overrides。
- `scripts/verify-build.mjs`：**读 manifest** 推导期望产物——`dist/plugin.cjs` 含每个能力 id 字符串；每个 UI 能力的 `dist/ui/<kind>/<id>/{index.html,js,css}` 齐全且 HTML 引用页内相对资源。
- detector / auto-run action **无 UI**：纯运行时代码，可与相关 renderer 同目录或单放，不需要 main.ts/index.html。

## 接线不变量

1. **三处 id 对齐**：manifest `id` === `plugin.ts` 注册 key === `src/features/<dir>` 目录名。
2. **manifest `uiEntry`** = `renderers/<id>/index.html` 或 `actions/<id>/index.html`。
3. detector ⇒ 必有对应 renderer。
4. UI CSS 只用 `var(--clipbus-*, 回退)` 主题 token。
5. 不改 node_modules 内 SDK；签名以 API.md 为准。
6. **相对 `.ts` import 带 `.ts` 扩展名**：`.ts` 运行时文件间的相对 import 用 `.ts`（冒烟测试用 Node 直接 require）；`.vue` 文件内可不带。

## manifest 骨架

```jsonc
{
  "schemaVersion": 2,
  "plugin": { "id": "plugin.<topic>", "title": "...", "version": "0.1.0" },
  "install": { "runtime": "node", "entry": "scripts/install.mjs" },
  "runtime": { "nodeEntry": "dist/plugin.cjs", "uiRoot": "dist/ui" },
  "permissions": [],                 // 按需：setAttachment/setSearchExtension/setTags/setPinned
  "attachmentRenderers": [
    { "id": "<id>", "title": "...", "attachmentType": "plugin.<topic>.<feat>",
      "height": 220, "uiEntry": "renderers/<id>/index.html" }
  ],
  "detectors": [
    { "id": "<id>", "title": "...", "supportedInputKinds": ["text"],
      "attachmentTypes": ["plugin.<topic>.<feat>"] }
  ],
  "actions": [
    { "id": "<id>", "title": "...", "supportedItemTypes": ["text"],
      "lifecycle": "auto-run", "keywords": ["..."] }
    // draft 多一个 "uiEntry": "actions/<id>/index.html"，lifecycle:"draft"
  ]
}
```

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
