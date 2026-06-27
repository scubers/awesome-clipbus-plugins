# Inspector — 检查工具

Clipbus 插件，文本统计 + MD5/SHA 哈希查看与统一 diff 格式渲染二合一。

## 文本统计 + 哈希（`text-stats-*`）

自动检测剪贴板中的任意文本并计算展示：

- 字符数、非空白字符数、词数、行数、字节数
- MD5、SHA-1、SHA-256 哈希值
- 文本预览片段

触发条件：`trim().length >= 20`。

| 扩展点 | ID |
|---|---|
| 检测器 | `text-stats-detector` |
| 渲染器 | `text-stats-renderer` |
| 附件类型 | `plugin.inspector.text-stats` |

## 统一 Diff 查看器（`diff-*`）

检测标准 unified diff 格式（支持 `diff --git` 头部和裸 hunk 格式），展示：

- 统计栏：变更文件数、新增行数（+）、删除行数（−）
- 语法着色：新增行绿色、删除行红色、上下文行不变

触发条件：文本包含 `---`/`+++` 头部且有至少两行变更（`+`/`-`）。

| 扩展点 | ID |
|---|---|
| 检测器 | `diff-detector` |
| 渲染器 | `diff-renderer` |
| 附件类型 | `plugin.inspector.diff` |

## 本地开发

```sh
npm install
npm run dev        # Vite 预览工作台
npm run verify     # typecheck + lint + build + 测试
```

加载：Settings → Plugins → Developer Plugins → Add Path → 选择此目录。
