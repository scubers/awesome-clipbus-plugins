# clipbus-markdown-plugin — Markdown Preview

识别剪贴板中的 **Markdown 文本**，在本地安全渲染为 HTML 卡片，展示排版预览。

## 功能

- **Markdown 识别**（detector `markdown-detector`）：统计文本中的 Markdown 信号种类（ATX 标题、加粗/斜体、列表、链接、围栏代码、行内代码、引用），**至少命中 2 种**才触发，避免误判普通散文。
- **Markdown 预览卡片**（renderer `markdown-renderer`）：
  - 顶部 meta 栏显示字符数、行数、标题数；
  - 渲染子集：h1–h6、`**粗**`/`*斜*`/`_斜_`、行内 `` `code` ``、围栏代码块、无序/有序列表、引用、`[链接](url)`；
  - 自适应高度（min 120 / max 480）。

## 安全说明

- **仅渲染本插件自身生成的标签**，源文本先经 HTML 转义（`& < > "` → 实体），再套用 Markdown 模式，不透传任何原始 HTML。
- 链接 href **只允许 `http://`、`https://`、`mailto:` 协议**，`javascript:` 等不安全协议降级为纯文本，不执行任何脚本。
- 所有渲染在本地完成，不发起任何网络请求。

## 开发

```sh
npm install
npm run verify   # typecheck + lint + build + verify-build + 测试
```

架构与约定见仓库根 `CLAUDE.md` 与 `template-plugin/`。
