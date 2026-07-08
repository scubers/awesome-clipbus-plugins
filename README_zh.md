# Clipbus 插件合集

[English](./README.md) | 中文

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**Clipbus 官方插件合集 —— 面向 macOS 的可编程剪贴板。** 持续增加的现成插件，外加自己动手写插件的完整工具链。

[clipbus.com](https://clipbus.com) · [插件文档](https://clipbus.com/plugin-doc)

## 安装到 Clipbus

使用这些插件的主要方式是直接从本仓库安装——无需 clone，无需本地构建。

1. 打开 Clipbus，进入 **设置 → 插件 → 安装 → Git 仓库**，会打开 **“从 Git 仓库安装”** 面板。
2. 填写表单：

   | 字段 | 填写值 |
   |---|---|
   | 仓库地址 | `https://github.com/scubers/awesome-clipbus-plugins` |
   | 子目录 | 插件的目录名，例如 `clipbus-decoder-plugin`——见下方[插件列表](#插件列表)中的**子目录**列 |
   | Ref | 留空即跟随 `main`，也可填 branch / tag / commit 固定版本 |

3. 点击 **安装**。

Clipbus 免费版每类能力（detector / renderer / action）各有 3 个插件槽位；Pro 提升这个上限，并加入 Cloud Sync。

## 用 AI 创建插件

1. Clone 本仓库。
2. 在其中打开 [Claude Code](https://claude.ai/code)。
3. 描述你想要的插件。

本仓库自带 `clipbus-plugin-generator` skill（位于 `.claude/skills/`）：它会先勘察现有插件，按其真实职责，把选题**并入最匹配的插件**或新建一个——而不是另起一个近重复插件。

## 插件列表

下表每个插件都是独立的顶层目录，完全自包含（各自 `npm install`、各自构建）——仓库根目录没有统一的 `package.json` 或构建编排。**子目录**列可直接复制进上方的安装表单。

| 插件 | 子目录 | 描述 | 演示 |
|------|--------|------|------|
| [clipbus-decoder-plugin](./clipbus-decoder-plugin/README.md) | `clipbus-decoder-plugin` | 编解码工具：Base64 识别解码、JWT 解析（header/payload + 过期状态）、`data:` URI 检视（媒体类型 / 编码 / 解码大小 + 文本预览）、多编解码 draft（URL / HTML / Base64 / Unicode / JSON 双向）| [GIF](./docs/gifs/decoder.gif) |
| [clipbus-formatter-plugin](./clipbus-formatter-plugin/README.md) | `clipbus-formatter-plugin` | 格式美化：识别 JSON / XML / SQL 缩进或关键字大写（含一键切换查看与复制：美化 / 压缩 / YAML），将 CSV/TSV 渲染为表格（含 CSV→JSON 导出），并把 URL 查询串解析为键值表——格式化预览一键复制 | — |
| [clipbus-converter-plugin](./clipbus-converter-plugin/README.md) | `clipbus-converter-plugin` | 转换工具：Unix 时间戳↔日期（本地 / ISO / UTC / 相对，含 9 时区世界时钟）、整数进制对照（dec/hex/oct/bin + ASCII）、ISO 8601 时长拆解（人类可读分量 + 总秒数）、温度三标换算（摄氏 / 华氏 / 开尔文）、数据大小换算（SI 与 IEC：KB/MB/GB 与 KiB/MiB/GiB + 精确字节）、Unix 文件权限解析（符号 rwxr-xr-x → 八进制 755 + 三类拆解）、命名风格转换 draft（camel/snake/kebab… 共 8 种）| — |
| [clipbus-extractor-plugin](./clipbus-extractor-plugin/README.md) | `clipbus-extractor-plugin` | 提取与解析：从文本提取去重 URL / Email / IPv4，拆解单个 URL 的 scheme / host / path / query 并剥离 utm_*/fbclid/gclid 等追踪参数生成一键复制的干净链接、单个 IP / CIDR 的版本 / 范围 / 网络段，经纬度坐标的 DMS 度分秒 + 地图链接，或 MAC 地址的 OUI/NIC 拆分 + 单播/多播·全局/本地位、UUID 的版本 / variant / 内嵌时间，并含正则测试 draft | — |
| [clipbus-inspector-plugin](./clipbus-inspector-plugin/README.md) | `clipbus-inspector-plugin` | 检视工具：文本字符/词/行/字节统计 + MD5/SHA-1/SHA-256 哈希；unified diff 查看（统计条 + 逐行着色）；图片详情（格式 / 尺寸 / 宽高比 / 像素数 / 大小）；以及单个字符/emoji 的 Unicode 检视（码位 / UTF-8 / UTF-16 / HTML 实体 / 类别）；以及密钥/凭证扫描器：识别粘贴的 API 密钥、令牌与私钥（AWS / GitHub / Google / Slack / Stripe / OpenAI / PEM…）打码告警，避免泄漏进聊天或提交 | — |
| [clipbus-preview-plugin](./clipbus-preview-plugin/README.md) | `clipbus-preview-plugin` | 可视化预览：识别颜色值（HEX / RGB / HSL + CSS 名）展示色块与 WCAG 对比，将 CSS 渐变（linear / radial / conic）渲染为可视色卡，将 Markdown 安全渲染为 HTML 预览卡片，并把复制的 URL 生成可扫描二维码 | [GIF](./docs/gifs/preview.gif) |
| [clipbus-text-plugin](./clipbus-text-plugin/README.md) | `clipbus-text-plugin` | 文本行处理工具——排序行 / 去重行 / 整理空白 / 去除 ANSI 转义码，四个一键 auto-run 动作 | — |
| [clipbus-generator-plugin](./clipbus-generator-plugin/README.md) | `clipbus-generator-plugin` | 生成 UUID v4、可排序 ULID 或强随机密码（可配置长度 / 大小写 / 数字 / 符号 / 数量，Web Crypto），以及 Lorem Ipsum 占位文本（段落 / 句子 / 单词）；draft 表单实时预览并复制 | — |
| [clipbus-cron-plugin](./clipbus-cron-plugin/README.md) | `clipbus-cron-plugin` | 识别 5 段 cron 表达式，逐字段中文释义表、一句执行概述,以及接下来 5 次触发时刻（实时本地时间）（带护栏避免误判普通数字行）| — |
| [clipbus-vibe-plugin](./clipbus-vibe-plugin/README.md) | `clipbus-vibe-plugin` | 情绪兜底动画：当没有任何插件能展示某条纯文本时，提供三种可切换的 Three.js 粒子动画——①Particle Core：粒子自字形炸开、噪声漂移后重组为发光球体；②Text Reveal：文字完整可读（字号自适应卡片尺寸）→ 光扫描 → 边缘裂解 → 爆发 → 回收为多面体光核；③Text Loop：8 阶段无缝循环——文字→粒子化→爆发→漂浮能量云→旋涡回收成球→稳定悬浮→解构→重组文字（首尾完全衔接）；原生按钮栏切换，展示哪些动画及顺序可用 `plugin.vibe.animations` 设置项配置（默认全部三个） | [GIF](./docs/gifs/vibe.gif) |
| [clipbus-toolbox-plugin](./clipbus-toolbox-plugin/README.md) | `clipbus-toolbox-plugin` | 聚合工具箱：识别并解码字符串（JWT / 转义 JSON / URL / Unix 时间戳 / 日期 / Base64）为内联预览卡片（一键复制与展开）；六个一键命名风格 auto-run 动作（大写 / 小写 / camelCase / PascalCase / snake_case / kebab-case）；以及图片裁剪压缩 draft 动作 | — |

`template-plugin/` 是官方脚手架 + 全能力参考——用于被**复制**，而非安装。它不是产品插件，因此不出现在上表中。上方 AI 创建流程生成的新插件，起点都是它的一份拷贝。

## 社区插件

在这个合集之外维护自己的 Clipbus 插件？欢迎在这里收录。

_目前还没有社区插件——欢迎成为第一个。_

| 插件 | 描述 | 仓库 | 安装子目录 |
|------|------|------|-----------|
| _(你的插件)_ | _一句话描述_ | `https://github.com/<you>/<repo>` | 除非你的仓库包含多个插件，否则留空 |

添加一行，提交一个 PR 即可——见下方**贡献**。

## 贡献

两条贡献路径：

1. **PR 进本仓库**，成为官方合集的一员。你的插件目录必须通过自己的构建与测试门禁——在该目录内执行 `npm install && npm run verify`（build + test）。架构、四个扩展点（detector / renderer / action / messageHandlers）、跨文件接线不变量与新增插件流程见 **[CLAUDE.md](./CLAUDE.md)**。
2. **自己维护仓库**，提交 PR 在上方[社区插件](#社区插件)表格中加一行。审核只看链接与描述，不审代码。
