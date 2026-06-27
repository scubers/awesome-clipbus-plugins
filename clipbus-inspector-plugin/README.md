# 检视工具

一个 Clipbus 插件，集成文本统计与 Unified Diff 查看两大功能。

## 文本统计 + MD5/SHA 哈希（text-stats-*）

识别剪贴板中的任意文本，自动计算并展示：

- 字符数、去空格字符数、单词数、行数、字节数
- MD5、SHA-1、SHA-256 哈希值
- 文本预览摘要

触发条件：文本 `trim().length >= 20`。

| 扩展点 | ID |
|---|---|
| Detector | `text-stats-detector` |
| Attachment Renderer | `text-stats-renderer` |
| Attachment Type | `plugin.inspector.text-stats` |

## Unified Diff 查看（diff-*）

识别标准 unified diff 格式（支持 `diff --git` 头及纯 hunk 格式），展示：

- 统计条：修改文件数、新增行数（+）、删除行数（−）
- 逐行着色：新增行绿色高亮、删除行红色高亮、上下文行保持原色

触发条件：包含 `---`/`+++` 头及至少两行变更行（`+`/`-`）。

| 扩展点 | ID |
|---|---|
| Detector | `diff-detector` |
| Attachment Renderer | `diff-renderer` |
| Attachment Type | `plugin.diff.unified` |

## 开发

```sh
cd clipbus-inspector-plugin
npm install
npm run dev        # Vite 预览工作台
npm run verify     # typecheck + lint + build + test
```

加载：Settings → Plugins → Developer Plugins → Add Path → 选择本目录。
