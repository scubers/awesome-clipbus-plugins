# 转换工具

Clipbus 转换工具插件，集成三类转换能力：

## Unix 时间戳转换

自动识别剪贴板中的 10 位（秒）或 13 位（毫秒）Unix 时间戳，展示本地时间、UTC 时间及 ISO 8601 格式，支持一键复制。

## 整数进制对照（radix-*）

自动识别十进制、十六进制（`0x`）、二进制（`0b`）、八进制（`0o`）整数，转换并展示四种进制表示及对应 ASCII 字符，支持一键复制各进制格式。

## 命名风格转换（case-tool）

Draft action，将剪贴板文本转换为 camelCase、snake_case、kebab-case、PascalCase、CONSTANT_CASE、Title Case、Sentence case、dot.case 等八种命名风格，在交互表单中选择后提交。

## 开发

```sh
npm install
npm run dev        # Vite 预览工作台
npm run build      # 完整构建
npm test           # 运行测试
npm run verify     # 构建 + 测试（提交前门禁）
```
