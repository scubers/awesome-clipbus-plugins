# 能力撰写指南（阶段 4 跟着做）

实现真实、实用的 detector/renderer/action。下面给**可改写的骨架**——按选题替换逻辑，别照抄演示。**确切签名以 `node_modules/@clipbus/plugin-sdk/API.md` 为准**（装好 SDK 后先读它），本指南给的是经过样板验证的形状。

## 目录

1. [Feature 结构与命名](#1-feature-结构与命名)
2. [payload.ts：单一真相源](#2-payloadts单一真相源)
3. [detector](#3-detector)
4. [renderer（运行时）](#4-renderer运行时)
5. [renderer UI（app.vue）](#5-renderer-uiappvue)
6. [auto-run action](#6-auto-run-action)
7. [draft action](#7-draft-action)
8. [高度形态与 autoFit](#8-高度形态与-autofit)
9. [plugin.ts 注册](#9-plugints-注册)
10. [预览 scenario](#10-预览-scenario)
11. [视觉规范](#11-视觉规范)
12. [冒烟测试](#12-冒烟测试)
13. [验证闭环](#13-验证闭环)

---

## 1. Feature 结构与命名

**UI 承载能力（renderer / draft action）：目录名 === manifest 能力 id**，放 `src/features/<id>/`：

```
src/features/<renderer-id>/
├── payload.ts        # 数据形状 + create/decode/buildArtifact（detector 与 renderer 共用）
├── detector.ts       # 运行时（无 UI）
├── renderer.ts       # 运行时（无 UI）
├── app.vue           # UI
├── main.ts           # Vite 入口
└── index.html        # 生产外壳
```

detector / auto-run action 无 UI，运行时代码可与最相关的 renderer 同目录，或单放一个无 `main.ts/index.html` 的目录——`build-ui.mjs` 只对含 UI 的目录打包。**推荐与对应 renderer 同目录、共享 `payload.ts`**（detector.ts / action.ts 和 renderer 放一处），最省心。

> **相对 import 必须带 `.ts` 扩展名（否则冒烟测试挂）**：`.ts` 运行时文件之间（payload/detector/renderer/action）的相对 import **一律写 `.ts`**——冒烟测试用 Node 直接 `require()` 这些 `.ts`，Node 解析器不会自动补扩展名（`tsconfig` 已开 `allowImportingTsExtensions`，Vite/esbuild 也都接受）。例：`import { buildXArtifact } from "./payload.ts"`。`.vue` 文件内的 import 可不带（由 Vite 处理），引用组件用 `./app.vue`。

`main.ts` 与 `index.html` 固定写法：

```ts
// main.ts
import { patchConsole, patchTextInputState } from "@clipbus/plugin-sdk/dom";
patchConsole();
patchTextInputState();
import { createApp } from "vue";
import App from "./app.vue";
import "../../shared/base.css";
createApp(App).mount("#app");
```

```html
<!-- index.html：生产外壳，引用页内 ./index.css 与 ./index.js（verify-build 会检查） -->
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><Topic> Renderer</title>
    <link rel="stylesheet" href="./index.css" />
  </head>
  <body>
    <div id="app"></div>
    <script src="./index.js"></script>
  </body>
</html>
```

## 2. payload.ts：单一真相源

附件 payload 以 JSON 存进 `payloadJson`。三函数 + `version`：

```ts
import type { PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";

export interface XPayload {
  kind: "x_preview";        // 自定义判别串
  version: 1;               // 迁移用
  // …你的字段（解码结果、统计、转换输出等）
  display: { typeLabel: string; headline: string; subheadline: string; facts: { label: string; value: string }[] };
}

// 从 detector 输入构造 payload；不适用则返回 null（决定是否挂附件）
export function createXPayload(input: unknown): XPayload | null { /* … */ }

// 解析 + 校验；坏数据返回 null（renderer 容错用）
export function decodeXPayload(payloadJson: string | null | undefined): XPayload | null {
  try {
    const p = JSON.parse(payloadJson || "{}");
    if (p.kind !== "x_preview") return null;
    return p as XPayload;
  } catch { return null; }
}

// detector 产出的 artifact
export function buildXArtifact(input: unknown): PluginDetectorArtifact | null {
  const payload = createXPayload(input);
  if (!payload) return null;
  return {
    attachmentType: "plugin.<topic>.<feat>",
    attachmentKey: "primary",
    payloadJson: JSON.stringify(payload),
    // 可选：让内容进搜索
    searchProjection: { scope: "x", searchText: payload.display.headline, label: payload.display.typeLabel },
  };
}
```

复用 `src/shared/display.ts` 的 `mapContentKind / buildContentDisplay / buildItemDisplay / buildSearchText` 处理三种 kind 的展示，别重造。

## 3. detector

```ts
import type { PluginDetectorHandler, PluginDetectorInput, PluginDetectorArtifact } from "@clipbus/plugin-sdk/runtime";
import { buildXArtifact } from "./payload.ts";

export function createXDetector(): PluginDetectorHandler {
  return {
    async detect(input: PluginDetectorInput): Promise<PluginDetectorArtifact[]> {
      const a = buildXArtifact(input);          // content 在 input 上，扁平：input.content.{kind,text|width|entries…}
      return a ? [a] : [];
    },
  };
}
```

只在内容**真的匹配**时返回 artifact（如 decoder 检测到合法 base64 才挂）——不匹配返回 `[]`，别污染所有剪贴板项。

## 4. renderer（运行时）

`resolveAttachment` 给宿主一点元信息（名字、色调、是否展示）；真正的渲染在 app.vue。

```ts
import type { PluginAttachmentRendererHandler, PluginResolveAttachmentInput, PluginAttachmentResolveResult } from "@clipbus/plugin-sdk/runtime";
import { decodeXPayload } from "./payload.ts";

export function createXRenderer(): PluginAttachmentRendererHandler {
  return {
    async resolveAttachment(input: PluginResolveAttachmentInput): Promise<PluginAttachmentResolveResult> {
      const payload = decodeXPayload(input?.attachment?.payloadJson);
      if (!payload) return { displayName: "<Topic>", tintHex: "#0F766E", shouldDisplay: false }; // 坏数据不展示
      return { displayName: "<Topic>", tintHex: "#0F766E" };  // shouldDisplay 省略=true
    },
  };
}
```

## 5. renderer UI（app.vue）

订阅宿主推来的附件 topic，decode，渲染；按钮经 `setButtons` + `onHostInvoke`。

```vue
<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { clipbus } from "@clipbus/plugin-sdk/ui";
import type { PluginAttachmentPayload } from "@clipbus/plugin-sdk/ui";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { decodeXPayload } from "./payload";

const attachmentPayload = useTopicRef(clipbus.item.attachment);
const payload = computed(() =>
  decodeXPayload((attachmentPayload.value as PluginAttachmentPayload | undefined)?.attachment?.payloadJson));

let unsub: (() => void) | null = null;
onMounted(async () => {
  try {
    await clipbus.attachmentRenderer.setButtons({ buttons: [{ id: "copy", title: "复制结果" }] });
  } catch { /* 非附件上下文时 setButtons 会拒绝，忽略 */ }
  unsub = clipbus.attachmentRenderer.onHostInvoke.on(async (d) => {
    if (d?.buttonID === "copy" && payload.value) {
      await clipbus.clipboard.copyText({ text: /* 你的结果文本 */ "" });
    }
  });
});
onUnmounted(() => { unsub?.(); });
</script>

<template>
  <main class="shell">
    <section v-if="payload"> … 渲染 payload … </section>
    <div v-else class="empty"> 等待内容 </div>
  </main>
</template>

<style scoped>
/* 只用主题 token，见第 11 节 */
</style>
```

需要 JS 计算色（canvas 等）才用 `useTopicRef(clipbus.theme)` 拿 token 快照；纯 CSS 用 `var(--clipbus-*)` 即可。

## 6. auto-run action

无 UI，处理后返回结果上下文。`resolveSession` 是 R13 后接口要求的桩。

```ts
import { actionResult } from "@clipbus/plugin-sdk/runtime";
import type { PluginAutoRunActionHandler, PluginAutoRunActionInput, PluginActionOperationResult, PluginActionResolveResult } from "@clipbus/plugin-sdk/runtime";

// auto-run 不弹表单，resolveSession 只是接口要求的桩；TS 允许实现比接口声明更少的参数，故可写 ()。
const resolveStub = async (): Promise<PluginActionResolveResult> => ({ buttons: [], initialDraft: {} });

export function createXAction(): PluginAutoRunActionHandler {
  return {
    resolveSession: resolveStub,
    async runAutoAction(input: PluginAutoRunActionInput): Promise<PluginActionOperationResult> {
      const out = /* 处理 input.content → 结果字符串 */ "";
      return actionResult.text(out, { userMessage: "已生成结果" });
      // 无结果时：return actionResult.none({ userMessage: "无可处理内容" });
    },
  };
}
```

## 7. draft action

需要用户输入/选择时用。Runtime 给初始会话，UI 管表单、提交。

Runtime：

```ts
export function createXDraftAction(): PluginAutoRunActionHandler {
  return {
    async resolveSession(_input, _ctx) {
      return {
        displayName: "<Topic>",
        buttons: [{ id: "submit", title: "提交", isEnabled: true }],
        defaultButtonID: "submit",
        initialDraft: { /* 初始表单 */ } as unknown as Record<string, unknown>,
      };
    },
    async runAutoAction() { return actionResult.none({ userMessage: "draft 由 UI 驱动" }); }, // 守卫桩
  };
}
```

UI（draft-action-ui/app.vue 要点）：

```ts
import { clipbus } from "@clipbus/plugin-sdk/ui";
import { useTopicRef } from "../../shared/composables/useTopicRef";
import { reactive, watch } from "vue";

const draftTopic = useTopicRef(clipbus.action.draft);  // 宿主推来的 draft
const draft = reactive({ /* 本地可编辑副本 */ });
watch(draftTopic, (d) => Object.assign(draft, d ?? {}), { immediate: true });

// 动态按钮：await clipbus.action.setButtons({ buttons: [...] })
// 提交：await clipbus.action.complete({ resultKind: "text", text }) // 或 image / none
// 宿主条按钮：clipbus.action.onHostInvoke.on(async (d) => { if (d.buttonID === "submit") … })
```

UI↔Node 自定义 RPC（如让 Node 干重活/生图）：Runtime 用 `defineMessage<Req,Resp>("<topic>.key").handle(fn)` 注册进 `messageHandlers`；UI `await clipbus.runtime.invoke({ key: "<topic>.key", payload })`。生成图片：Node 写临时 PNG → `host.asset.registerImage({ path })` 得 `clipbus-asset://` URL → UI `<img :src>`。

## 8. 高度形态与 autoFit

manifest renderer 的 `height`：
- 定值 `220`：固定高卡片。
- `"auto"`：内容驱动。
- `{ min: 120, max: 480 }`：自适应区间，UI 里调 `autoFit`：

```ts
import { autoFit } from "@clipbus/plugin-sdk/dom";
// autoFit 返回一个清理函数。onMounted/内容变化后调用，并在 onUnmounted 清理：
const stopAutoFit = autoFit({ min: 120, max: 480 });  // 数值要与 manifest 一致
// onUnmounted(() => stopAutoFit());
```

## 9. plugin.ts 注册

每个能力 id 注册到对应桶，**key === manifest id === 目录名**：

```ts
import { definePlugin } from "@clipbus/plugin-sdk/runtime";
import { createXDetector } from "./features/<rid>/detector";
import { createXRenderer } from "./features/<rid>/renderer";
import { createXAction } from "./features/<aid>/action";

export default definePlugin({
  setup() {
    return {
      detectors: { "<detector-id>": createXDetector() },
      attachmentRenderers: { "<rid>": createXRenderer() },
      actions: { "<aid>": createXAction() },
      messageHandlers: { /* …defineMessage 元组展开… */ },
    };
  },
});
```

## 10. 预览 scenario

`src/preview/scenarios/` 里给每个 feature 加一条样例 bootstrap，保证 `vue-tsc` 不报残留引用。注意：scaffold 留下的 `PreviewShellApp.vue` 是**不渲染真实组件的占位**——要在 `npm run dev` 真看到某 feature 的 UI，需在 `PreviewShellApp.vue` 里 import 它的 `app.vue` 并按场景挂载（可选打磨；真实视觉验收以宿主 Clipbus 内为准）。renderer 场景的 bootstrap 至少带 `attachment: { payloadJson: JSON.stringify(/* createXPayload(...) 的结果 */) }`；draft 场景带初始 draft 形状。

## 11. 视觉规范（优先级 #2）

- **只用主题 token**：`var(--clipbus-text-primary, #0f172a)`、`--clipbus-surface`、`--clipbus-surface-elevated`、`--clipbus-border`、`--clipbus-accent`、`--clipbus-text-secondary/tertiary` 等，**裸 hex 仅作 `var()` 回退**。自动适配明暗。
- 版式：留白舒展、层级清晰（eyebrow/title/facts）、长文本省略号、空态有友好提示。
- 实用为先但别将就：卡片要"能看"，与系统观感一致。

## 12. 冒烟测试

`tests/` 下 `.cjs`，Node test runner，`require()` 直接载 `.ts`（`--experimental-strip-types`），沿用 `tests/setup.cjs`。每插件至少覆盖：

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"); const path = require("node:path");
const root = path.resolve(__dirname, "..", "..");
const manifest = JSON.parse(fs.readFileSync(path.resolve(root, "manifest.json"), "utf8"));

test("manifest 能力都有 handler 注册", () => {
  // 读 manifest 各 id，require 各 feature 工厂，断言注册对象包含它们
});
test("detector 对样例输入产出预期 attachmentType 的 artifact", async () => {
  const { buildXArtifact } = require(path.resolve(root, "src/features/<rid>/payload.ts"));
  const a = buildXArtifact({ content: { kind: "text", text: "<样例>" } });
  assert.ok(a); assert.equal(a.attachmentType, "plugin.<topic>.<feat>");
});
test("renderer 对坏 payload 返回 shouldDisplay:false", () => {
  const { createXRenderer } = require(path.resolve(root, "src/features/<rid>/renderer.ts"));
  // resolveAttachment({ attachment: { payloadJson: "not-json" } }) → shouldDisplay:false
});
```

draft/auto-run：断言 `runAutoAction`/`resolveSession` 返回预期 `resultKind`/draft 形状即可。**精简但有意义**，别堆砌。

> 注意：① 冒烟测试**直接 require 各 feature 的工厂文件**（payload/detector/renderer/action），**别 require `src/plugin.ts`**——它用裸相对 specifier，Node strip-types 解析不了。② 测试向量选**真正有效**的样例（如 base64 要确认标准版与含 `-_` 的 URL-safe 版的差异），避免笔误造成假阴性。

## 13. 验证闭环

插件目录内：`npm install` → 读 `node_modules/@clipbus/plugin-sdk/API.md` 校准签名 → `npm run verify`，**修到全绿**。报错就按 systematic-debugging 找根因：常见是三处 id 没对齐、manifest height 与 autoFit 不一致、UI 裸 hex 被测试拦、payload decode 没容错、相对 `.ts` import 漏写 `.ts` 扩展名（Node require 时 `ERR_MODULE_NOT_FOUND`）。
