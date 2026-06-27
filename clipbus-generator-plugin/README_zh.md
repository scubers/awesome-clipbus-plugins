# Generator — 生成工具

Clipbus 插件，通过 draft action 表单生成 UUID（v4）和强密码。

## 能力

| ID | 类型 | 生命周期 |
|---|---|---|
| `gen-tool` | action | `draft` |

## 功能详情

在 Clipbus 内打开表单 UI，支持：

- 在 **UUID** 和**密码**两种模式间切换
- 设置生成数量（1–20）
- 密码模式：设置长度（8–64），切换大写字母、数字、符号选项
- 等宽字体实时预览生成结果
- 点击 **Regenerate** 获取新的随机值
- 点击 **Generate & Copy**（宿主按钮）完成 action 并将结果复制到剪贴板

UUID 生成使用浏览器 `crypto.getRandomValues`（版本位 4，变体 `10xx`）。密码从可配置字符集中随机抽取，小写字母始终包含，大写、数字、符号按选项叠加。

## 本地开发

```sh
npm install
npm run dev      # Vite 预览工作台 — ?view=action
npm run verify   # typecheck + lint + build + 测试
```
