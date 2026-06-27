# Converter — 转换工具

三合一 Clipbus 转换插件：Unix 时间戳解析、整数进制互换、文本命名风格转换。

## 功能

- **Unix 时间戳检测器**（`timestamp-detector`）：识别剪贴板中 10 位（秒）和 13 位（毫秒）Unix 时间戳，拒绝 2001 年前或 2099 年后的值。
- **Unix 时间戳渲染器**（`timestamp-renderer`）：展示本地时间、UTC、ISO 8601、星期和人类可读的相对时间（如"3 小时前"），附"Copy ISO 8601"按钮。
- **进制检测器**（`radix-detector`）：识别十进制、十六进制（`0x`）、二进制（`0b`）、八进制（`0o`）整数，拒绝浮点数和非数字文本。
- **进制转换器**（`radix-renderer`）：同时展示 DEC / HEX / OCT / BIN 四种进制，每行附复制按钮；另显示位宽、ASCII 字符（可打印范围 32–126）及负数标记，含"Copy all radix"按钮。
- **命名风格转换**（`case-tool`）：Draft action，将剪贴板文本转换为 8 种命名风格——camelCase、snake_case、kebab-case、PascalCase、CONSTANT_CASE、Title Case、Sentence case、dot.case——可复制任意变体或提交 camelCase 结果。

## 本地开发

```sh
npm install
npm run dev        # Vite 预览工作台
npm run build      # 完整构建
npm test           # 运行测试
npm run verify     # 构建 + 测试（提交前门禁）
```
