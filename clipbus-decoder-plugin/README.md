# 编解码工具

识别并解码剪贴板里的编码字符串；同时提供多格式转义 draft 工具。

## 功能

### Base64 识别解码（base64-*）

| 能力 | id | 描述 |
|---|---|---|
| detector | `base64-detector` | 识别 Base64 字符串（标准 `+/=` 与 URL-safe `-_` 均支持），最短 8 字符 |
| renderer | `base64-renderer` | 卡片展示：编码类型徽章、字符数对比（原 → 解码）、解码文本，"复制解码结果"按钮 |
| action | `base64-copy` | 一键将解码结果写入剪贴板（auto-run） |

### JWT 解析（jwt-*，仅本地解码不验签）

| 能力 | id | 描述 |
|---|---|---|
| detector | `jwt-detector` | 识别三段式 `header.payload.signature` JWT 字符串 |
| renderer | `jwt-renderer` | 卡片展示：算法类型、header/payload 格式化 JSON、标准 claim 摘要、过期状态 |
| action | `jwt-copy` | 一键将 JWT payload 写入剪贴板（auto-run） |

### 多编解码 draft 工具（escape-tool）

| 能力 | id | 描述 |
|---|---|---|
| action | `escape-tool` | Draft 表单：支持 URL、HTML、Base64、Unicode、JSON 五种模式互转（draft lifecycle） |

## 开发

```bash
npm install
npm run dev       # 启动预览工作台
npm run verify    # typecheck + lint + build + test（完成门槛）
```
