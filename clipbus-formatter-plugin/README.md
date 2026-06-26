# clipbus-formatter-plugin

识别剪贴板中的 JSON 内容，自动格式化（美化缩进），并展示格式化预览，支持一键复制结果。

## 功能

| Feature | 能力 id | 说明 |
|---|---|---|
| JSON 识别与渲染 | `json-renderer` | 检测有效 JSON 对象/数组，展示格式化预览卡片 |
| JSON 格式化复制 | `json-copy` | 一键将格式化（2 空格缩进）的 JSON 复制到剪贴板 |

Detector id：`json-detector`（attachmentType：`plugin.formatter.json`）。

## 使用场景

- 从 API 响应、日志或网页复制了压缩 JSON，想立即看清楚结构
- 需要把格式化好的 JSON 粘贴到文档或代码注释中

## 能力说明

- **detector**（`json-detector`）：对 `text` 类型输入尝试 `JSON.parse`，成功且为对象/数组时挂 `plugin.formatter.json` 附件
- **renderer**（`json-renderer`）：卡片展示类型标签（JSON 对象/JSON 数组）、字数变化、格式化后的代码块；按钮"复制格式化结果"
- **action**（`json-copy`，auto-run）：直接将格式化后的 JSON 文本作为结果返回

## 未来可加

- XML 格式化（`xml-renderer`）
- SQL 格式化（`sql-renderer`）
- YAML 格式化（`yaml-renderer`）

## 本地开发

```sh
npm install
npm run dev       # Vite 预览工作台
npm run verify    # typecheck + lint + build + 冒烟测试（全绿才算完成）
```
