# 插件索引

本仓库收录的 Clipbus 剪贴板插件列表。每个插件独立目录，独立 `npm install` 与构建。

## 插件列表

| 插件 | 描述 |
|------|------|
| [clipbus-decoder-plugin](./clipbus-decoder-plugin/README.md) | 识别 Base64 等编码字符串，展示解码结果，支持一键复制 |
| [clipbus-formatter-plugin](./clipbus-formatter-plugin/README.md) | 识别 JSON 对象/数组，展示格式化（美化缩进）预览，支持一键复制格式化结果 |
| [clipbus-converter-plugin](./clipbus-converter-plugin/README.md) | 识别剪贴板中的 Unix 时间戳（10 位秒 / 13 位毫秒），展示本地时间、ISO 8601、UTC、星期与相对时间，一键复制 ISO 8601 |
| [clipbus-extractor-plugin](./clipbus-extractor-plugin/README.md) | 从大段文本中提取并去重所有 URL / Email / IPv4，分组展示并一键复制全部（命中 ≥ 2 个才触发）|
| [clipbus-inspector-plugin](./clipbus-inspector-plugin/README.md) | 统计文本字符/词/行/字节并计算 MD5/SHA-1/SHA-256，只读信息卡，可直接从卡片复制哈希 |
| [clipbus-color-plugin](./clipbus-color-plugin/README.md) | 识别颜色值（HEX / RGB / HSL / 常见 CSS 颜色名），展示大色块预览、HEX/RGB/HSL 三种格式与对黑/白的 WCAG 对比度，一键复制全部格式 |
| [clipbus-url-plugin](./clipbus-url-plugin/README.md) | 识别单个 URL，拆解 scheme / host / port / path / hash 与查询参数表格，一键复制查询参数 JSON |
| [clipbus-csv-plugin](./clipbus-csv-plugin/README.md) | 识别 CSV/TSV（逗号/制表符/分号分隔，支持引号转义），渲染为表格预览，一键复制为 Markdown 表格 |
| [clipbus-text-plugin](./clipbus-text-plugin/README.md) | 文本行处理工具——排序行 / 去重行 / 整理空白，三个一键 auto-run 动作 |
| [clipbus-generator-plugin](./clipbus-generator-plugin/README.md) | 生成 UUID v4 或强随机密码（可配置长度 / 大小写 / 数字 / 符号 / 数量），draft 表单实时预览并复制（Web Crypto） |
| [clipbus-jwt-plugin](./clipbus-jwt-plugin/README.md) | 识别 JWT，解码 header / payload，展示 alg/typ、标准 claims 与过期状态，一键复制 payload（仅本地解码、不校验签名）|
