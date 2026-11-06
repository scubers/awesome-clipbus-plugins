# Clipbus 插件合集

[English](./README.md) | 中文

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**Clipbus 官方插件合集 —— 面向 macOS 的可编程剪贴板。** 持续增加的现成插件，外加自己动手写插件的完整工具链。

[clipbus.com](https://clipbus.com) · [插件文档](https://clipbus.com/plugin-doc)

## 安装 AI Skills

`clipbus-plugin-generator` 用于创建或扩展插件，`clipbus-sdk-upgrade` 用于升级已有插件的 SDK。
在你自己的工程目录执行以下命令，即可同时安装两个 skill：

```sh
npx skills add https://github.com/scubers/awesome-clipbus-plugins \
  --skill clipbus-plugin-generator \
  --skill clipbus-sdk-upgrade
```

只保留一个 `--skill` 参数即可单独安装对应工作流；添加 `-g` 可安装到用户级目录，供多个工程使用。
无需手动 clone 本合集。使用方式见[用 AI 创建和维护插件](#用-ai-创建和维护插件)。

## 安装到 Clipbus

使用这些插件的主要方式是直接从本仓库安装——无需 clone，无需本地构建。

1. 打开 Clipbus，进入 **设置 → 插件 → 安装 → Git 仓库**，会打开 **“从 Git 仓库安装”** 面板。
2. 填写表单：

   | 字段 | 填写值 |
   |---|---|
   | 仓库地址 | `https://github.com/scubers/awesome-clipbus-plugins` |
   | 子目录 | 插件的目录名，例如 `clipbus-toolbox-plugin`——见下方[插件列表](#插件列表)中的**子目录**列 |
   | Ref | 留空即跟随 `main`，也可填 branch / tag / commit 固定版本 |

3. 点击 **安装**。

Clipbus 免费版每类能力（detector / renderer / action）各有 3 个插件槽位；Pro 提升这个上限，并加入 Cloud Sync。

## 用 AI 创建和维护插件

按[上面的命令](#安装-ai-skills)安装所需 skill，用 AI Coding Agent 打开目标文件夹，直接描述任务即可。
手动安装时，把每个 skill 的 `SKILL.md` 和 `references/` 一起放在对应目录中。
两个 skill 均可单独分发、独立使用。
需要 Node.js、npm、Git，以及访问上游模板与 npm registry 的网络。
Agent 阅读当前官方模板与实际安装的 SDK 文档，按工程情况实现功能并运行工程自身的验证。
无需 clone 本合集，也无需准备本地模板。

要向本合集贡献改动，再 clone 本仓库并用 AI Coding Agent 打开。

`.agents/skills/`、`.codex/skills/` 和 `.claude/skills/` 各保留一份内容一致的最新技能。
Windows / macOS 新 clone 后即可直接使用，无需额外初始化。修改时同步三份，CI 自动检查内容一致。

仓库在 `.agents/skills/` 中提供了两套专用工作流：

- **Create — [`clipbus-plugin-generator`](./.agents/skills/clipbus-plugin-generator/)：**通过说明驱动 Agent，支持空目录、独立插件和插件合集。参考官方模板、读取实际安装的 SDK 文档、实现功能并运行工程自身的检查；有现有插件时按真实职责判断归属。
- **Upgrade — [`clipbus-sdk-upgrade`](./.agents/skills/clipbus-sdk-upgrade/)：**帮助独立插件和用户指定的插件合集升级 SDK。对照实际实现、官方模板和 SDK 文档判断升级影响，按需迁移，并运行各工程自身的检查。

两个 skill 只包含说明与参考资料，不附带脚手架、构建资产或固定插件结构校验器，彼此没有安装依赖。

## 插件列表

下表每个插件都是独立的顶层目录，完全自包含（各自 `npm install`、各自构建）——仓库根目录没有统一的 `package.json` 或构建编排。**子目录**列可直接复制进上方的安装表单。

| 插件 | 子目录 | 描述 | 演示 |
|------|--------|------|------|
| [Toolbox 工具箱](./clipbus-toolbox-plugin/README_zh.md) | `clipbus-toolbox-plugin` | 16 个 detector、16 张卡片、24 个 Action：Base64/JWT、XML/CSV、时间戳/进制/时长、地址检查、Markdown/渐变/Cron、文本转换；与宿主 builtin JSON、颜色、编解码能力互补。 | — |
| [Vibe](./clipbus-vibe-plugin/README_zh.md) | `clipbus-vibe-plugin` | 独立文本兜底插件，提供三种可配置的 Three.js 粒子动画。 | — |

原七个工具插件已合并为 Toolbox。替换现有安装或已保存 Flow 前，先看[迁移与移除功能说明](./clipbus-toolbox-plugin/README_zh.md#从原七个插件迁移)。

[官方插件模板](https://github.com/scubers/clipbus-template-plugin) 在上游独立维护。Agent 按需临时获取，本仓库不再保存模板副本。

## 社区插件

在这个合集之外维护自己的 Clipbus 插件？欢迎在这里收录。

_目前还没有社区插件——欢迎成为第一个。_

| 插件 | 描述 | 仓库 | 安装子目录 |
|------|------|------|-----------|
| _(你的插件)_ | _一句话描述_ | `https://github.com/<you>/<repo>` | 除非你的仓库包含多个插件，否则留空 |

添加一行，提交一个 PR 即可——见下方**贡献**。

## 贡献

两条贡献路径：

1. **PR 进本仓库**，成为官方合集的一员。你的插件目录必须通过自己的构建与测试门禁——在该目录内执行 `npm install && npm run verify`（build + test）。架构、四个扩展点（detector / renderer / action / messageHandlers）、跨文件接线不变量与新增插件流程见 **[AGENTS.md](./AGENTS.md)**。
2. **自己维护仓库**，提交 PR 在上方[社区插件](#社区插件)表格中加一行。审核只看链接与描述，不审代码。
