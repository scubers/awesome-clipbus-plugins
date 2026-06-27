# Decoder — 解码工具

Clipbus 插件，检测并解码剪贴板中的编码字符串。内置 Base64 与 JWT 解码，另有多格式转义/编码 draft 工具。

## 功能

### Base64（`base64-*`）

| 扩展点 | ID | 说明 |
|---|---|---|
| 检测器 | `base64-detector` | 识别 Base64 字符串（标准 `+/=` 和 URL 安全 `-_` 两种变体），最少 8 个字符 |
| 渲染器 | `base64-renderer` | 卡片展示：编码类型标记、字符数对比（原始 → 解码）、解码文本、"Copy Decoded Result"按钮 |

### JWT（`jwt-*`，仅本地解码，不验签）

| 扩展点 | ID | 说明 |
|---|---|---|
| 检测器 | `jwt-detector` | 识别三段式 `header.payload.signature` JWT 字符串 |
| 渲染器 | `jwt-renderer` | 卡片展示：算法标记、格式化 header/payload JSON、标准 claim 摘要、过期状态 |

### 转义与编码工具（`escape-tool`）

| 扩展点 | ID | 说明 |
|---|---|---|
| Action | `escape-tool` | Draft 表单，提供五种可切换模式：URL、HTML、Base64、Unicode、JSON |

## 本地开发

```bash
npm install
npm run dev       # 启动预览工作台
npm run verify    # typecheck + lint + build + 测试（完整门禁）
```
