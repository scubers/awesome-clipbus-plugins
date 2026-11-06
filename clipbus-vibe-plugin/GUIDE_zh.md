# Vibe 开发指南

功能与使用方式见 [README_zh.md](./README_zh.md)，英文开发说明见 [GUIDE.md](./GUIDE.md)。

## 安装与预览

在 `clipbus-vibe-plugin/` 目录运行：

```sh
npm install
npm run dev
```

Vite 工作台入口为 `/src/preview/preview-host/index.html`。选择样例，检查深浅主题、实际组件及按钮交互。预览只记录宿主调用，不验证真实宿主的隔离、写入声明和提交总量。

## 构建与验证

```sh
npm run verify
```

依次执行 manifest 校验、类型检查、lint、CommonJS Runtime 与卡片页构建、接线与产物校验、Node `.cjs` 测试。保留解析业务向量，Runtime 行为测试使用构建后的 `dist/plugin.cjs`。

`dist/` 不提交。安装钩子使用宿主提供的 npm，按 lockfile 执行 `npm ci` 后构建。

## 加载到 Clipbus

Settings → Plugins → Developer Plugins → Add Path，选择含 `manifest.json` 的本目录。Reload 重读配置，Run Install 重跑安装钩子。源码变化后必须在实际加载目录重建；检查新增检测结果时，对旧条目执行重新检测。

## 扩展

先读实际安装 SDK 的 `docs/README.md` 与 `API.md`。保持 manifest、Runtime registry、写入声明、renderer 源目录、真实组件预览和测试一致。构建脚本从 manifest 自动发现页面，各输出页使用独立目录；共享 payload 不使用 Node/DOM 专有 API。

工程参考上游[官方模板](https://github.com/scubers/clipbus-template-plugin)，commit `6008c5a269ea0ceb79e0d51ac678d55c3c69f72c`；构建配置根据当前功能适配。
