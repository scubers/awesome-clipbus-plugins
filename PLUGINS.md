# 插件索引

本仓库收录的 Clipbus 剪贴板插件列表。每个插件独立目录，独立 `npm install` 与构建。

## 插件列表

| 插件 | 描述 |
|------|------|
| [clipbus-decoder-plugin](./clipbus-decoder-plugin/README.md) | 编解码工具：Base64 识别解码、JWT 解析（header/payload + 过期状态）、多编解码 draft（URL / HTML / Base64 / Unicode / JSON 双向）|
| [clipbus-formatter-plugin](./clipbus-formatter-plugin/README.md) | 格式美化：识别 JSON / XML / SQL，缩进或关键字大写重排预览，一键复制格式化结果 |
| [clipbus-converter-plugin](./clipbus-converter-plugin/README.md) | 识别剪贴板中的 Unix 时间戳（10 位秒 / 13 位毫秒），展示本地时间、ISO 8601、UTC、星期与相对时间，一键复制 ISO 8601 |
| [clipbus-extractor-plugin](./clipbus-extractor-plugin/README.md) | 从大段文本中提取并去重所有 URL / Email / IPv4，分组展示并一键复制全部（命中 ≥ 2 个才触发）|
| [clipbus-inspector-plugin](./clipbus-inspector-plugin/README.md) | 统计文本字符/词/行/字节并计算 MD5/SHA-1/SHA-256，只读信息卡，可直接从卡片复制哈希 |
| [clipbus-color-plugin](./clipbus-color-plugin/README.md) | 识别颜色值（HEX / RGB / HSL / 常见 CSS 颜色名），展示大色块预览、HEX/RGB/HSL 三种格式与对黑/白的 WCAG 对比度，一键复制全部格式 |
| [clipbus-url-plugin](./clipbus-url-plugin/README.md) | 识别单个 URL，拆解 scheme / host / port / path / hash 与查询参数表格，一键复制查询参数 JSON |
| [clipbus-csv-plugin](./clipbus-csv-plugin/README.md) | 识别 CSV/TSV（逗号/制表符/分号分隔，支持引号转义），渲染为表格预览，一键复制为 Markdown 表格 |
| [clipbus-text-plugin](./clipbus-text-plugin/README.md) | 文本行处理工具——排序行 / 去重行 / 整理空白，三个一键 auto-run 动作 |
| [clipbus-generator-plugin](./clipbus-generator-plugin/README.md) | 生成 UUID v4 或强随机密码（可配置长度 / 大小写 / 数字 / 符号 / 数量），draft 表单实时预览并复制（Web Crypto） |
| [clipbus-markdown-plugin](./clipbus-markdown-plugin/README.md) | 识别 Markdown 文本（≥2 种语法信号才触发），本地安全渲染为格式化 HTML 预览卡片（HTML 转义 + 链接协议白名单，不执行脚本）|
| [clipbus-diff-plugin](./clipbus-diff-plugin/README.md) | 识别 unified diff，渲染带 `+N −M · K files` 统计条与逐行增删着色的 Diff 查看器 |
| [clipbus-cron-plugin](./clipbus-cron-plugin/README.md) | 识别 5 段 cron 表达式，逐字段中文释义表 + 一句执行概述（带护栏避免误判普通数字行）|
| [clipbus-radix-plugin](./clipbus-radix-plugin/README.md) | 识别整数（十进制 / 0x 十六 / 0b 二 / 0o 八），BigInt 任意精度对照四种进制 + 位数 + ASCII，逐行复制 |
| [clipbus-case-plugin](./clipbus-case-plugin/README.md) | 命名风格转换 draft 工具：把剪贴板文本实时转为 camel / Pascal / snake / CONSTANT / kebab / Title / Sentence / dot 共 8 种，逐条复制 |
| [clipbus-regex-plugin](./clipbus-regex-plugin/README.md) | 正则测试 draft 工具：输入 pattern + flags + 测试文本，实时显示匹配数、匹配项与捕获组，一键复制匹配 |
