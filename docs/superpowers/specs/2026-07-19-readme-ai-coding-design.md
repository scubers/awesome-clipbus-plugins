# README AI Coding 文案调整设计

## 目标

在不改变 README 现有信息层级的前提下，让 AI Coding 说明不再绑定 Claude Code，并轻量呈现仓库已有的两个维护型 skill。

## 修改范围

- 同步修改根目录 `README.md` 与 `README_zh.md`。
- 保留现有“安装插件 → 用 AI 创建插件 → 插件列表”的章节顺序。
- 不修改插件清单、贡献流程、skill 实现或其他工程文件。

## 文案设计

现有三步入口继续保留，但将具体的 Claude Code 改为中性的 AI Coding Agent 表述，让使用者可以选择 Codex、Claude Code 或其他能够读取仓库指令与 skills 的工具。

在入口步骤之后，用两个简短条目说明仓库能力：

1. `clipbus-plugin-generator`：根据自然语言创建或扩展插件；先勘察已有插件并判断合理归属，再实现、构建和验证，避免产生近重复插件。
2. `clipbus-template-sync`：拉取官方模板与 Plugin SDK 更新，分析哪些共享改动会影响现有插件，并迁移和验证受影响插件。

英文 README 使用自然、简洁的英文表达；中文 README 保持同等信息量，不逐字硬译。skill 的真实位置写为 `.agents/skills/`，同时不需要展开内部阶段与实现细节。

## 验收标准

- README 不再把 AI Coding 工作流限定为 Claude Code。
- 两份 README 都提到 generator 与 template sync 两个 skill，并准确区分“创建/扩展”和“升级/维护”。
- 两份 README 的章节结构与其他内容保持不变。
- Markdown 相对链接和标题锚点不受影响。
