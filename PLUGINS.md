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
