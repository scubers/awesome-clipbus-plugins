# Clipbus 插件合集

[English](./README.md) | 中文

剪贴板（**Clipbus**）插件合集——**一个插件一个顶层目录**。每个插件完全自包含：各自 `npm install`、各自构建。仓库根目录**没有** `package.json`、没有 workspace、没有统一构建编排；所有命令都在**某个插件目录内**运行。

- **`template-plugin/`** 是官方脚手架 + 全能力参考，用于被**复制**而非引用——新插件从复制它开始。
- 新插件由 **`clipbus-plugin-generator`** skill（位于 `.claude/skills/`）生成：它先勘察现有插件，把选题归入某个 canonical 类别，并**扩展命中的插件**，而不是另起一个近重复插件。

## 插件列表

| 插件 | 描述 |
|------|------|
| [clipbus-decoder-plugin](./clipbus-decoder-plugin/README.md) | 编解码工具：Base64 识别解码、JWT 解析（header/payload + 过期状态）、多编解码 draft（URL / HTML / Base64 / Unicode / JSON 双向）|
| [clipbus-formatter-plugin](./clipbus-formatter-plugin/README.md) | 格式美化：识别 JSON / XML / SQL，缩进或关键字大写重排预览，一键复制格式化结果 |
| [clipbus-converter-plugin](./clipbus-converter-plugin/README.md) | 转换工具：Unix 时间戳↔日期（本地 / ISO / UTC / 相对）、整数进制对照（dec/hex/oct/bin + ASCII）、命名风格转换 draft（camel/snake/kebab… 共 8 种）|
| [clipbus-extractor-plugin](./clipbus-extractor-plugin/README.md) | 提取与正则：从文本提取去重 URL / Email / IPv4 分组展示并复制；正则测试 draft（匹配数 / 匹配项 / 捕获组）|
| [clipbus-inspector-plugin](./clipbus-inspector-plugin/README.md) | 检视工具：文本字符/词/行/字节统计 + MD5/SHA-1/SHA-256 哈希；unified diff 查看（统计条 + 逐行着色）|
| [clipbus-color-plugin](./clipbus-color-plugin/README.md) | 识别颜色值（HEX / RGB / HSL / 常见 CSS 颜色名），展示大色块预览、HEX/RGB/HSL 三种格式与对黑/白的 WCAG 对比度，一键复制全部格式 |
| [clipbus-url-plugin](./clipbus-url-plugin/README.md) | 识别单个 URL，拆解 scheme / host / port / path / hash 与查询参数表格，一键复制查询参数 JSON |
| [clipbus-csv-plugin](./clipbus-csv-plugin/README.md) | 识别 CSV/TSV（逗号/制表符/分号分隔，支持引号转义），渲染为表格预览，一键复制为 Markdown 表格 |
| [clipbus-text-plugin](./clipbus-text-plugin/README.md) | 文本行处理工具——排序行 / 去重行 / 整理空白，三个一键 auto-run 动作 |
| [clipbus-generator-plugin](./clipbus-generator-plugin/README.md) | 生成 UUID v4 或强随机密码（可配置长度 / 大小写 / 数字 / 符号 / 数量），draft 表单实时预览并复制（Web Crypto）|
| [clipbus-markdown-plugin](./clipbus-markdown-plugin/README.md) | 识别 Markdown 文本（≥2 种语法信号才触发），本地安全渲染为格式化 HTML 预览卡片（HTML 转义 + 链接协议白名单，不执行脚本）|
| [clipbus-cron-plugin](./clipbus-cron-plugin/README.md) | 识别 5 段 cron 表达式，逐字段中文释义表 + 一句执行概述（带护栏避免误判普通数字行）|

## 开发

每个插件由两侧构成——Node **Runtime**（`src/plugin.ts` → esbuild → `dist/plugin.cjs`）与 Vue **UI**（WebView，Vite → `dist/ui/`）。架构、四个扩展点（detector / renderer / action / messageHandlers）、接线不变量与新增插件流程详见 **[CLAUDE.md](./CLAUDE.md)**。

常用命令——在**某个插件目录内**运行：

```sh
npm install     # 拉取 @clipbus/plugin-sdk（及其权威文档）
npm run dev      # Vite 预览工作台（?view=renderer / ?view=action）
npm run build    # typecheck → lint → 构建 runtime + UI → 校验产物
npm test         # Node test runner，跑 tests/
npm run verify   # build + test，提交前完整门禁
```
