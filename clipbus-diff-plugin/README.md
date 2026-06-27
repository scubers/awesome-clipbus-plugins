# Diff Viewer Plugin

Clipbus 插件，用于自动识别剪贴板中的 unified diff / git diff 文本并以可视化方式展示。

## 功能

- **自动识别**：检测含 `@@ ... @@` hunk 头、`--- `/`+++ ` 文件头或 `diff --git` 的 unified diff 文本（需至少 2 行实际增删内容，避免误判）
- **统计条**：顶部显示 `+N − M · K files`，增加行绿色、删除行红色
- **逐行着色**：增加行（绿底）、删除行（红底）、hunk 头（青绿）、元信息（灰色）、上下文行（透明）
- **等宽字体**：`SF Mono / Menlo / Cascadia Code` 渲染，左侧 `+`/`-` 标记列
- **自适应高度**：`autoFit` 范围 140–480 px，内容超出时滚动
- **主题兼容**：全部颜色使用 `var(--clipbus-*, 回退色)`，深/浅主题均适配
