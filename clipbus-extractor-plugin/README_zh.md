# Extractor — 提取工具

Clipbus 插件，自动提取剪贴板文本中的 URL、邮箱、IP 地址，解析单个 URL 的完整结构，并内置交互式正则测试器。

## 功能

### URL / 邮箱 / IP 提取（`entities-*`）

从剪贴板文本中自动检测 HTTP/HTTPS URL、电子邮件地址和 IPv4 地址，以分类卡片展示。

- **检测器**（`entities-detector`）：输入类型 `text`，附件类型 `plugin.extractor.entities`
- **渲染器**（`entities-renderer`）：按 URLs / Emails / IP Addresses 分组展示，每项可单独复制，附 Copy All 按钮

### URL 结构解析（`url-*`）

检测剪贴板中的单个 HTTP/HTTPS URL，将其结构化分解展示。

- **检测器**（`url-detector`）：输入类型 `text`，附件类型 `plugin.extractor.url`
- **渲染器**（`url-parsed`）：分行显示 scheme、host、路径、查询参数（键值表格）和 fragment；高度自适应内容

### 正则测试器（`regex-tool`）

内置在 Clipbus 的交互式正则调试 draft action。

- **Action**（`regex-tool`，draft）：输入类型 `text`
- 可用剪贴板文本预填测试输入
- 输入模式和标志（`g` / `i` / `m` 等）后实时显示所有匹配、捕获组和匹配位置
- 最多 200 条匹配；超过 20,000 字符自动截断以防冻结

## 本地开发

```sh
npm install
npm run dev       # Vite 预览工作台
npm run verify    # typecheck + lint + build + 测试
```
