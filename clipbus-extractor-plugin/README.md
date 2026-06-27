# 提取与正则

一个 Clipbus 插件，提供两块独立能力：URL/邮箱/IP 提取，以及正则测试草稿工具。

## URL/邮箱/IP 提取（entities-*）

自动识别剪贴板文本中的链接（http/https）、电子邮件地址和 IPv4 地址，提取结果在附件卡片中展示，并支持一键复制所有条目。

- 检测器：`entities-detector`，输入类型 `text`，产出附件类型 `plugin.extractor.entities`
- 渲染器：`entities-renderer`，展示分类列表（URL / 邮箱 / IP）
- 动作：`entities-copy`（auto-run），提取并将全部条目合并复制到剪贴板

## 正则测试草稿工具（regex-tool）

一个 draft 动作，在 Clipbus 内提供交互式正则表达式调试界面。输入正则模式与标志位，实时展示所有匹配项、捕获组及位置索引。

- 动作：`regex-tool`（draft），UI 驱动，支持 flags `g` / `i` / `m` 等
- 剪贴板文本自动填入测试输入框
- 最多显示 200 条匹配，输入超 20,000 字符自动截断以防卡顿
