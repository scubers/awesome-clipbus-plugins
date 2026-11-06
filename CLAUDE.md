# CLAUDE.md

This file provides the entry points for Claude Code when working in this repository.

## 仓库约定

这是 Clipbus 插件合集，每个顶层插件目录都是独立工程；根目录没有 package.json 或 workspace。
先读 [AGENTS.md](AGENTS.md)，遵循其中的 Shell、SDK 文档、开发与验证约定。

仓库不再保存本地模板。需要工程参考时临时获取[官方插件模板](https://github.com/scubers/clipbus-template-plugin)，
接口、协议、manifest 和限额以目标插件实际安装的 SDK 文档为准，不在本文件复制另一份接口说明。
不要查看或修改 SDK 实现源码。

## 两个独立工作流

- [clipbus-plugin-generator](.claude/skills/clipbus-plugin-generator/SKILL.md)：创建或扩展插件，参考当前模板与实际安装的 SDK 文档实现功能。
- [clipbus-sdk-upgrade](.claude/skills/clipbus-sdk-upgrade/SKILL.md)：升级既有插件的 SDK，依据目标实现、官方模板和新旧 SDK 文档判断迁移内容。

两个 skill 均只需自身的 SKILL.md 和 references，可脱离本仓库单独分发，不依赖另一个 skill 或内置脚手架。
修改 skill 时同步 .agents/skills、.codex/skills、.claude/skills 三份，并运行 node .agents/scripts/check-skills.mjs。
实际构建、预览与业务测试按目标插件自身的 package.json 和开发说明执行。
