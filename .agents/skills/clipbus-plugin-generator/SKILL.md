---
name: clipbus-plugin-generator
description: >-
  在本剪贴板插件合集仓库里生成一个真实可用的新 Clipbus 插件（参考 template-plugin
  与已有插件、避开重复、同类合并/新类另起、目录名 clipbus-{topic}-plugin、面向用户文案用英文、跑到
  npm run verify 全绿）。只要用户想新建/生成/扩展/再来一个剪贴板插件——哪怕只是
  模糊地说"做个解码插件""再来一个插件""generate a clipbus plugin""扩展一下功能"，
  或点名某个 clipbus-*-plugin——就用这个 skill。涉及在本合集新增能力时优先用它。
---

# Clipbus 插件生成器

在这个**剪贴板插件合集**仓库里，参考样板 `template-plugin/` 与已有插件，生成一个**功能实用、开箱即用**的新插件，并修到 `npm run verify` 全绿。选题优先级：**功能实用 > 视觉呈现 > 整活/情绪价值**——目标是实用，不是演示。

完整设计见同目录 `DESIGN.md`。本文件是执行手册。

## 自我迭代（遇到插件问题就回写本 skill）

这个 skill 是**活文档**：只要在本合集里**踩到或解决了一个此前没记录的 clipbus 插件问题**——bug、隐蔽坑、构建/测试/调试陷阱、UI 或接线约定——就在**同一次会话里顺手把根因 + 可执行规则沉淀回本 skill**：接线/约定类进「铁律」或对应 `references/`，视觉类进 `references/authoring-guide.md` §11，工作流类进对应阶段。让 skill 随每次实战复利增厚，下次不再重复踩同一个坑。skill 本身在 git 里，改完按需提交。

## 何时用 / 何时不用

- **用**：用户想在本仓库新建/生成/扩展剪贴板插件，或给了选题让你实现，或说"自动来一个"。
- **不用**：用户只是想读懂/调试某个已有插件的代码（那是普通编码任务）；或当前不在这个合集仓库里。

## 前置：确认环境

1. 确认在合集仓库根：存在 `template-plugin/` 目录。不在则停下并说明。
2. 本 skill 的脚本路径（相对本 skill 目录）：`scripts/survey.mjs`、`scripts/scaffold.mjs`。深入资料在 `references/`。

## 工作流（七阶段）

把下面每个阶段建成一个 todo，按序推进。

### 0 · 解析意图

判断两件事：
- **模式**：用户是否要求"全自主"（出现"自动选题/直接生成/全自主/随便来一个"等）。否则走**默认模式**（提选题等确认）。
- **选题**：用户是否已给定选题/功能。给定就直接用，跳过阶段 2 的提案部分、只做归属判断。

### 1 · 勘察现状

运行 `node <skill>/scripts/survey.mjs <repoRoot>`，解析它输出的 JSON，掌握：已有 `clipbus-*-plugin`、各自**类别**与功能点、**已占用的 plugin.id / attachmentType / 目录名**。这是避重与命名防撞的依据。必要时再读相关插件的 `README.md` 看它已覆盖什么。

### 2 · 选题与归属

分两步：**先自由选题，再 survey 驱动归属。**

**A. 选题（自由发散）**
- 自由构思一个"剪贴板里常见、做了有用"的 feature。`references/topic-ideas.md` 只是**灵感源**（卡壳时翻），**不是清单、更不是归类约束**——鼓励提出表里没有的新点子，发掘新能力正是本 skill 的目的。
- 优先级：实用 > 视觉 > 整活。用户给定选题则直接用。

**B. 归属（survey 驱动，合并优先）**
拿选定的 feature，**基于阶段 1 survey 出的「现有插件真实职责」**判断（看每个插件的 `readmeSummary` + detectors/renderers/actions——**看实际职责，不是看名字、更不是拿 topic 表的分组对号入座**）：
- 逐个问"这个 feature 并入哪个现有插件最自然？"——**找到职责契合的宿主就并入它（作为新 feature 扩展）**，别与它已覆盖的重复。
- **确实没有任何现有插件职责契合 → 才新建** `clipbus-{topic}-plugin`。
- **判不准时默认"并入最接近的"，不默认"新建"。**

两条归属经验法则：
- **被动 vs 主动**：被动检测+展示（detector+renderer）的 feature，并入以 detector/renderer 为主的插件；用户主动调用（action）的 feature，并入以 action 为主的插件。例：解码（被动识别编码串，detector 驱动）与格式转换（用户主动换格式，action 驱动）**即使都沾"转换"，也分属不同插件**。
- **一个职责一个插件**：同一职责域只应有一个插件。发现天然归属已存在就扩展进去。

然后按模式：
- **默认模式**：提 2-4 个候选，每个给「一句卖点 / 定位（实用·视觉·整活）/ 归属（survey 里并入 X 或新建 Y）/ 计划扩展点」。用 AskUserQuestion 让用户选定，再继续。
- **全自主模式**：自己挑一个**现有插件尚未覆盖的 feature**（挑 feature，**不是**"挑一个没建过的插件名"），直接继续、不停顿。**新建前必须过硬门控**，先输出一行：
  `选定 feature：<topic>；考察候选宿主：<逐个列 survey 里相关插件 + 各自为何不契合>；归属：并入 <X> ／ 新建 <Y>；理由：<一句>`
  **若写不出"每个相关插件都不契合的具体理由"，就不许新建，必须并入最接近的那个。**

避重/合并铁律（survey 驱动）：① 不重复已有插件已覆盖的功能；② plugin.id / attachmentType / 目录名都不能和 survey 结果撞；③ **同一职责域只能有一个插件**——并入是默认、新建是例外。全自主模式靠上面的硬门控挡住"为同类另起插件"的退化（这是本 skill 最常见的退化：20 次调用生成 20 个本应合并的插件，务必守住）。

### 3 · 落地基线

- **新建**：`node <skill>/scripts/scaffold.mjs <topic> --title "<人类标题>" --repo <repoRoot>`。它从 template 派生一个**干净通用基线**（去掉演示代码，`build-ui.mjs`/`verify-build.mjs` 已改为读 manifest 自动适配）。产物是"能 build 的空骨架"。
- **扩展已有**：进入目标插件目录，准备在 `src/features/` 下新增 feature；不要跑 scaffold。

### 4 · 实现能力（实用优先）

读 `references/authoring-guide.md` 跟着写。要点：
- 按选题**只实现需要的扩展点,别凑三件套**；**要展示的附件必配 renderer**（detector 产出要展示的附件才需 renderer；只做 `searchProjection` 搜索投影、不展示卡片的 detector 无需 renderer，详见铁律）；**auto-run action 仅当能提供 renderer 给不了的东西时才加**——renderer 已展示某值且有一键复制按钮时，**禁止**再加返回同一值的 copy-action（纯冗余，详见铁律）；draft 表单仅当需要用户输入。
- 关键约定 **feature 目录名 === manifest 能力 id**（UI 承载能力即 renderer / draft action 各自一个同名目录，含 `main.ts`+`index.html`）。
- 每个 feature：`payload.ts`（单一真相源）→ detector/renderer/action 运行时 → `app.vue`（renderer/draft 才有）→ **preview `PreviewScenario` 并在 `preview-host/main.ts` 的 `COMPONENTS` 映射到组件（必做，不是可选）**；renderer 还要配 `clipbus.window.autoFit()` 搭 manifest `"auto"`/`{min,max}` 高度、长内容补内部滚动（见 authoring-guide §8/§10）。
- 同步三处：`manifest.json` 能力条目、`src/plugin.ts` 的 `setup()` 注册、目录名。
- **attachmentType 用本插件命名空间** `plugin.<本插件>.<feat>`；扩展进已有插件时改用**宿主**插件命名空间，别沿用 feature 的旧 topic 名（宿主加载期会拒越界，`npm run verify` 查不出——详见铁律）。
- 视觉只用 `var(--clipbus-*, 回退)` 主题 token，适配明暗，版式干净（详见 authoring-guide 的视觉规范）。
- 写**精简冒烟测试**（范式见 authoring-guide）。

### 5 · 验证闭环

在目标插件目录：
1. `npm install`（拉 `@clipbus/plugin-sdk`）。
2. **先读 `node_modules/@clipbus/plugin-sdk/API.md`** 校准能力签名——它是 capability 真相源，本仓库示例可能滞后；冲突以 API.md 为准。也可读 `node_modules/@clipbus/plugin-sdk/docs/README.md` 文档地图。
3. `npm run verify`，**修到全绿**（typecheck/lint/build/verify-build/冒烟测试）。扩展场景是整插件重验。

遇到失败别绕过：用 systematic-debugging 的思路定位根因再改。

**在 Clipbus 里目测视觉改动时（坑）**：每个插件的 `dist/` 是 **gitignore 的构建产物**，宿主实际加载的就是它。① 改完要 `npm run build`（或 verify）**刷新 `dist/`**，否则 Clipbus 重载看到的还是旧 UI；② 在 **git worktree** 里改时，要么让用户把 Clipbus Developer Plugin **指向 worktree 目录**，要么直接在用户实际加载的路径重建；③ **把源码合并回 main 不会重建 main 的 `dist/`**——合并后须对受影响插件**重跑 `npm run build`**，否则用户在 main 路径重载仍是旧产物（真实踩过：用户一直在测 main 的陈旧 dist，误判成"改了没生效"，白绕一圈）。

### 6 · 更新目录索引（中英双写，强制）

- 更新目标插件 `README.md`：写清它**覆盖了哪些功能**（feature 清单），**用英文写**（见「铁律 · 文案语言」）。
- **措辞自检（强制）**：按「铁律 · 文案风格统一」复查本次的 `plugin.title` / README H1 / detector·renderer 标题；**本次 survey 或扩展触及的现有插件**若发现裸 slug、`Detection`、过去分词等不一致，**顺手一并修正**（这是用户期望的"顺带 review 现有插件措辞"）。
- 更新根索引——**`README.md`（英文，仓库主页）与 `README_zh.md`（中文）两个文件必须同步加/改同一条**（简述 + 链接到该插件 README）。两文件的插件条目须一一对应；任一不存在则创建。**只更新一个、漏掉另一个 = 没完成。**

### 7 · 汇报

给出：插件目录、新增/变更的能力、验证结果（命令 + 结论）、**中英双索引（`README.md` + `README_zh.md`）的更新情况**。

## 铁律（接线不变量，违反必出错）

- **三处 id 对齐**：manifest 能力 `id` === `src/plugin.ts` 注册 key === `src/features/<dir>` 目录名（也即 UI 产物目录）。
- **要展示的附件 ⇒ 必配 renderer**（不是笼统的 "detector ⇒ renderer"）：detector 的 artifact 有两面——**附件**（`attachmentType`+`payloadJson`，要在卡片里**展示**就必须配同 `attachmentType` 的 renderer，否则附件无法显示）和**可选的搜索投影** `searchProjection`（`{scope,searchText,label?}`，把内容喂进宿主搜索索引让该记录能被搜到，如 OCR 文本参与搜索——**不展示、不需要 renderer**）。判断标准是「这个 detector 要不要展示附件卡片」：要 → 配 renderer；只为搜索 → 只填 `searchProjection`、不配 renderer。（搜索扩展的写入受 `setSearchExtension` 权限门控，imperative 写法是 runtime verb `host.item.setSearchExtension`。）
- **扩展点按需，禁止冗余 copy-action**：三扩展点触发成本不同——detector 复制时**自动**挂附件；renderer 选中时**自动**展示、可内置**一键**复制按钮；auto-run action 要用户 **cmd+k 打开面板再选中**才运行（比一键复制多好几步）。故**当 detector+renderer 已展示某值并提供一键复制时，严禁再加一个 `runAutoAction` 返回同一个值的 auto-run action**——用户永远走更快的 renderer 按钮，该 action 是纯冗余。auto-run action **只在能提供 renderer 给不了的东西时**才合理：要么插件无 detector/renderer（如纯文本变换 `clipbus-text-plugin` 的 sort/dedup/trim，action 是唯一入口），要么产出 renderer 未覆盖的另一种结果。展示型 feature（格式化/解码/转换/解析）通常**只需 detector + renderer**，复制做成 renderer 按钮即可。
- **attachmentType 必须在插件命名空间内**：每个 detector/renderer 的 `attachmentType` 必须以 `plugin.id + "."` 为前缀（即 `plugin.<本插件>.<feat>`）。**宿主在加载期强制校验**，越界直接拒载并报 `Detector attachment type is outside plugin namespace: <detector> -> <type>`——而 `npm run verify` **不校验此项**（本地构建/测试全绿，仍可能在 Clipbus 里加载失败，是隐蔽坑）。**合并/扩展插件时最易踩**：把某 feature 并入 `clipbus-<宿主>-plugin` 时，必须把它的 attachmentType 从旧的 `plugin.<原topic>.*` 改成宿主命名空间 `plugin.<宿主>.*`，且 manifest 的 detector `attachmentTypes[]` 与 renderer `attachmentType`、`payload.ts` 的 `ATTACHMENT_TYPE` 常量、测试与 scenario 里的全部引用（含测试 mock 的 `owner`）**同步改**。
- **输入仅三种 kind**：`text` / `image` / `path_reference`（snake_case）；content envelope 扁平。
- **文本解码器必须在产出 artifact 前校验可读性**：“字符集合法 + `Buffer.from(..., "base64")` 不报错”不等于解码成功，Node 会把无效 UTF-8 宽松转成 `�` 乱码。对要展示/索引为文本的 Base64 等解码结果，至少同时要求：① 解码 bytes → UTF-8 string → bytes 无损往返；② 可显示字符比例达标（建议 ≥95%，允许 `\t`/`\n`/`\r`）。任一不通过就返回 `null`/空 artifacts；回归测试必须同时覆盖无效 UTF-8、控制字符数据和合法的非 ASCII 文本。
- **能力签名以 API.md 为准**；不改 `node_modules/@clipbus/plugin-sdk/` 内 SDK 源码。
- UI 禁裸 hex，一律 `var(--clipbus-*, 回退)`。
- **UI 贴合宿主（透明 + 贴边）**：renderer 与 draft action 的根 `<main>` **不写 `background`**（透明、露出宿主底色）、**`padding:0`**；且**顶层布局 section 的水平 padding 也要清零、内容贴边**——宿主已给卡片/面板留了 native 内距，再加就是双层内距（draft action 最易在 section 层漏掉这层，根 `padding:0` 还不够）。只有**有独立边框/底色的内部子盒**才用各自 padding。详见 `references/authoring-guide.md` §11。
- **文案语言（面向用户文字一律英文）**：后续生产的插件 / 新 feature，所有**面向用户**的文案——`manifest.json` 的 `title` / `description`、UI（`app.vue` 等）里可见的字符串与按钮标题、插件自身 `README.md`——**必须用英文**。根索引按 `README.md`（英文）+ `README_zh.md`（中文）双写。代码注释、本仓库内部说明、commit message 不受此限。
- **文案风格统一（命名一致性）**：`plugin.title` 用简洁的**类别名或功能名**（如 `Formatter` / `Extractor` / `Cron Explainer`），不要用裸目录名；**README 的 H1 必须是人类标题**，禁止 `# clipbus-xxx-plugin` 裸 slug；detector 的 `title` 统一 `<X> Detector`（不要 `Detection`）；renderer 的 `title` 用**内容名词**（`Color Swatch` / `CSV Table` / `URL Details`），避免过去分词（如 `URL Parsed`）。同插件其余条目也对齐这套风格，跨插件保持一致。
- **`.ts` 扩展名**：运行时 `.ts` 文件间相对 import 带 `.ts`（冒烟测试用 Node 直接 require，不会自动补扩展名）；`.vue` 文件内可不带。
- **`payload.ts` 必须 UI 安全**：它被 `app.vue` 与 runtime 两侧 import，**严禁出现 `import … from "node:*"`**（`node:crypto`/`fs` 等）——否则 `build:ui` 时 Rollup 报 `MISSING_EXPORT`。需 Node API 算 payload（哈希等）就拆出 runtime-only 的 `builder.ts` 承载，`payload.ts` 只留类型 + `decode*Payload`。详见 authoring-guide 第 2 节。
- **preview 工作台必须 wire（不是可选）**：SDK 0.8.5+ 用 `createPreviewWorkbench`（`@clipbus/plugin-sdk/preview`）接管整套工作台——**不要手写 `PreviewShellApp.vue`（已废除）**。每个 renderer / draft action 都要在 `preview-host/main.ts` 顶部 `import` 其 `app.vue` 并登记进 `COMPONENTS`（key = feature 目录名 = `scenario.view`），并在 `scenarios/*.ts` 加一条 `PreviewScenario`（renderer 的 `attachment` 嵌套 `{ item, attachment:{ …payloadJson } }`；draft 用扁平 `draft`）。`npm run dev` 看得到真实组件渲染才算完（真实踩过：整批插件 preview 全是死占位）。纯 auto-run 插件无可预览 UI：不调 `createPreviewWorkbench`，`main.ts` 渲染一句静态说明。详见 authoring-guide §10 + `node_modules/@clipbus/plugin-sdk/docs/preview.md`。
- **非固定高度 renderer 必须调 autoFit 且传 `target`**：manifest height 为 `"auto"` 或 `{min,max}` 时，UI 须 `onMounted` 调 `clipbus.window.autoFit({ min, max, target: rootEl.value ?? undefined })`（`target` = 根元素 ref，模板根加 `ref="rootEl"`；min/max 与 manifest 一致）、`onUnmounted` 清理。漏调 autoFit → 停最小高、内容截断；**调了但漏传 `target` → autoFit 量 `document.body`，在 dev 预览工作台里 body 是整个工作台页（min-height:100%），永不收敛、每帧狂调 setHeight 死循环**（两种坑 `npm run verify` 都查不出，真实踩过，靠浏览器取证定位）。内容可能超 `max` 的列表/表格再套 `max-height + overflow-y:auto` 内部滚动；别在根 `<main>`/body 加 `overflow` 或 `height:100%`。详见 authoring-guide §8。

## 两种模式速记

| | 默认模式 | 全自主模式 |
|---|---|---|
| 选题 | 提案 → 用户选 | 自动挑未占用选题 |
| 停顿 | 选题处等确认 | 全程不停 |
| 适用 | 想参与决策 | "再来一个"批量产出 |

两种模式的**实现/验证/索引**阶段完全一致，只在阶段 2 是否停顿不同。

## 参考文件

- `references/architecture.md` — 两侧架构、四扩展点、接线不变量、通用约定速查（动手前先读）。
- `references/authoring-guide.md` — 怎么写真实 detector/renderer/action、payload 范式、视觉规范、冒烟测试范式（阶段 4 跟着做）。
- `references/topic-ideas.md` — 选题**灵感库**（启发式，**非归类约束**；归属一律看 survey，见阶段 2）。
