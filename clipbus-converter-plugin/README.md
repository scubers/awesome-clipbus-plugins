# clipbus-converter-plugin

Unix 时间戳转换器 Clipbus 插件。自动识别剪贴板中的 Unix 时间戳，展示多格式时间信息并支持一键复制 ISO 8601。

## Feature 清单

| 能力 | id | 类型 |
|---|---|---|
| 时间戳识别 | `timestamp-detector` | detector |
| 时间戳渲染卡片 | `timestamp-renderer` | attachmentRenderer |
| 复制 ISO 8601 | `timestamp-copy` | action (auto-run) |

attachmentType: `plugin.converter.timestamp`

## 检测规则

- 输入必须为 `text` kind，trim 后符合以下格式之一：
  - 恰好 10 位纯数字 → 解读为**秒**（Unix seconds）
  - 恰好 13 位纯数字 → 解读为**毫秒**（Unix milliseconds）
- 归一化为 epochMs 后构造 `Date`，UTC 年份必须在 **[2001, 2099]** 区间内，否则忽略（避免随机数字串误触发）

## 卡片展示

- 徽章 "Unix 时间戳" + 单位 chip（秒 / 毫秒）
- 大标题：本地时间（`date.toLocaleString()`，依赖宿主时区）
- 事实列表：ISO 8601、UTC、星期、相对时间（实时计算）
- 宿主按钮 "复制 ISO 8601"：点击后将 ISO 字符串写入剪贴板

## 用法

在 Clipbus 中复制任意 10 位或 13 位纯数字（如 `1700000000`），插件自动挂载转换卡片。

auto-run action 关键词：`timestamp`、`unix`、`time`、`时间戳`

## 开发

```sh
npm install
npm run dev        # Vite 预览工作台
npm run build      # 完整构建
npm test           # 运行测试
npm run verify     # 构建 + 测试（提交前门禁）
```
