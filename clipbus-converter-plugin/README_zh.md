# Converter — 转换工具

Clipbus 数值、时间、单位、权限和可级联文本命名风格转换插件。

## 功能

- **Unix 时间戳检测器**（`timestamp-detector`）：识别剪贴板中 10 位（秒）和 13 位（毫秒）Unix 时间戳，拒绝 2001 年前或 2099 年后的值。
- **Unix 时间戳渲染器**（`timestamp-renderer`）：展示本地时间、UTC、ISO 8601、星期和人类可读的相对时间（如"3 小时前"），附"Copy ISO 8601"按钮。
- **进制检测器**（`radix-detector`）：识别十进制、十六进制（`0x`）、二进制（`0b`）、八进制（`0o`）整数，拒绝浮点数和非数字文本。
- **进制转换器**（`radix-renderer`）：同时展示 DEC / HEX / OCT / BIN 四种进制，每行附复制按钮；另显示位宽、ASCII 字符（可打印范围 32–126）及负数标记，含"Copy all radix"按钮。
- **命名风格 Actions**：10 个独立 auto-run action，分别执行 UPPERCASE、lowercase、camelCase、PascalCase、snake_case、kebab-case、CONSTANT_CASE、Title Case、Sentence case 与 dot.case。每一步都读取宿主当前级联文本，可继续自动化组合。

## 本地开发

```sh
npm install
npm run dev        # Vite 预览工作台
npm run build      # 完整构建
npm test           # 运行测试
npm run verify     # 构建 + 测试（提交前门禁）
```
