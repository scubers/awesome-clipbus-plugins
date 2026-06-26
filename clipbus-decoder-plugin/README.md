# clipbus-decoder-plugin

识别剪贴板里的编码字符串，展示解码结果，支持一键复制。

## 功能

### Base64 解码

| 能力 | id | 描述 |
|---|---|---|
| detector | `base64-detector` | 识别 Base64 字符串（标准 `+/=` 与 URL-safe `-_` 均支持），最短 8 字符 |
| renderer | `base64-renderer` | 卡片展示：编码类型徽章、字符数对比（原 → 解码）、解码文本，"复制解码结果"按钮 |
| action | `base64-copy` | 一键将解码结果写入剪贴板（auto-run） |

识别启发式：含 `+`/`/`/`=` 或 `-`/`_` 等 Base64 特征字符，或纯字母数字且长度 ≥ 24 整除 4；解码后内容须非空。

## 项目结构

```
clipbus-decoder-plugin/
├── manifest.json
├── src/
│   ├── features/base64-renderer/
│   │   ├── payload.ts      # 数据形状、create/decode/buildArtifact
│   │   ├── detector.ts     # 检测逻辑
│   │   ├── renderer.ts     # 运行时元信息
│   │   ├── action.ts       # 一键复制 action
│   │   ├── app.vue         # 解码卡片 UI
│   │   ├── main.ts         # Vite 入口
│   │   └── index.html      # 生产外壳
│   ├── shared/             # 共享工具
│   └── plugin.ts           # definePlugin 入口
└── tests/runtime/base64.test.cjs
```

## 未来可加

- URL 百分号解码（`%xx`）
- JWT 解析（header + payload 展开）
- Hex ↔ 文本互转
- Unicode `\u` 转义还原

## 开发

```bash
npm install
npm run dev       # 启动预览工作台
npm run verify    # typecheck + lint + build + test（完成门槛）
```
