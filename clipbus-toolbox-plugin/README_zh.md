# Toolbox 工具箱

[English](./README.md) | 中文

开发者剪贴板工具箱：**16 个 detector、16 个 renderer、24 个 Action**。使用 SDK 3.2、插件协议 V2、manifest schema 6；Vibe 继续独立安装。

## 自动卡片

每项 detector 与 renderer 一一配套，输入均为文本。

| Detector | Renderer | 功能 |
|---|---|---|
| `base64-detector` | `base64-renderer` | 可读 UTF-8 Base64 / URL-safe Base64 解码预览 |
| `jwt-detector` | `jwt-renderer` | JWT Header、Payload、声明、过期信息；本地解码，不验证签名 |
| `xml-detector` | `xml-renderer` | XML 缩进、元素/属性计数、深度 |
| `csv-detector` | `csv-table` | 逗号、制表符、分号表格；Markdown / JSON 导出 |
| `timestamp-detector` | `timestamp-renderer` | 2001–2099 年的 10/13 位 Unix 时间戳；本地、UTC、ISO、多时区 |
| `radix-detector` | `radix-renderer` | DEC/HEX/OCT/BIN、位数、可打印 ASCII |
| `duration-detector` | `duration` | ISO 8601 时长分解与总秒数；年/月按近似值计算 |
| `entities-detector` | `entities-renderer` | 正文中至少两个去重后的邮箱 / IPv4；排除 URL 及 URL 内的地址 |
| `url-detector` | `url-parsed` | URL 结构、query pair、追踪参数清理；支持至少两对参数的裸 query |
| `ip-detector` | `ip-details` | 完整 IPv4/IPv6 或 CIDR；地址范围、规范形式、网段信息 |
| `geo-detector` | `geo-coordinates` | 经纬度、度分秒、可复制的地图链接 |
| `mac-detector` | `mac-address` | 带分隔符的 MAC、格式转换、OUI/NIC、地址标志 |
| `uuid-detector` | `uuid-details` | UUID 规范化、版本/变体、v1/v7 内嵌时间戳 |
| `markdown-detector` | `markdown-renderer` | 安全 Markdown 子集；至少两种不同语法信号才触发 |
| `gradient-detector` | `gradient-swatch` | 完整 CSS 渐变函数与色标预览 |
| `cron-detector` | `cron-renderer` | 五字段 Cron 解释、未来五次本地触发时间；不执行调度 |

卡片外框由宿主绘制，页面使用宿主主题和内容尺寸适配。预览工作台保留 20 个真实组件样例。

## Action

所有 Action 直接处理当前 Flow 的文本并返回文本，没有表单或中间卡片。

| 分组 | ID |
|---|---|
| HTML / Unicode（4） | `html-encode`、`html-decode`、`unicode-escape`、`unicode-unescape` |
| 命名转换（10） | `uppercase`、`lowercase`、`camelCase`、`pascalCase`、`snakeCase`、`kebabCase`、`constantCase`、`titleCase`、`sentenceCase`、`dotCase` |
| 文本整理（7） | `text-sort`、`text-dedup`、`text-trim`、`text-strip-ansi`、`text-reverse-lines`、`text-reverse-characters`、`text-sort-characters` |
| JSON（3） | `text-pretty-json`、`text-minify-json`、`json-to-yaml` |

文本排序采用忽略大小写的自然顺序；字符操作保留 emoji 等完整字素。JSON Action 拒绝非法 JSON，JSON → YAML 返回完整结果，不使用截断预览。JSON 转换通过 JavaScript 解析和序列化，数字格式与精度遵循 JavaScript 语义；宿主 builtin JSON 卡片则保留原始数字词法。

## 自动触发规则

- 普通十进制整数默认不出进制卡；显式 `0x` / `0b` / `0o` 输入正常识别。
- 有效 Unix 时间戳始终优先，即使开启十进制进制检测，也不会同时出现进制卡。
- 完整单个 IP/CIDR 显示详情；正文至少两个去重后的邮箱 / IPv4 显示提取列表；正文只有单个地址时两者都不触发。
- URL 列表、JSON 卡片、颜色卡片交给宿主 builtin；Toolbox 只额外提供 URL 参数检查与追踪清理。

需要开启普通十进制进制卡时，将下列键合并到宿主 external settings JSON，然后 Reload Toolbox：

```json
{ "plugin.toolbox.decimalRadix": true }
```

macOS 文件为 `~/Library/Application Support/Clipbus/ExternalSettings/settings.json`，Debug 版使用 `ClipbusDebug`。插件只读此配置；各 detector、renderer、Action 的独立开关与顺序继续由宿主管理。

## 从原七个插件迁移

从本仓库安装时，子目录填写 **`clipbus-toolbox-plugin`**；开发插件则 Add Path 到本目录。新身份为 `plugin.toolbox`，Vibe 仍使用独立的 `plugin.vibe`。

| 原插件 | 合并去向 |
|---|---|
| Decoder | Base64/JWT 卡片及 HTML/Unicode Action |
| Formatter | XML/CSV 卡片；YAML 改为 `json-to-yaml` Action |
| Converter | 时间戳、进制、时长卡片及命名转换 Action |
| Extractor | URL 参数、邮箱/IP 提取与地址检查器 |
| Preview | Markdown 与渐变卡片 |
| Text Tools | 原九个 Action 全部保留 |
| Cron | Cron 卡片 |

Data URI、温度、数据大小、符号文件权限已移除。插件 JSON/颜色卡片改用宿主 builtin；原颜色插件额外的颜色名、透明度和 WCAG 对比度不再保留。

重复 Action 使用宿主版本：

| 原 Decoder Action | Builtin Action ID |
|---|---|
| `url-encode` / `url-decode` | `url_encode` / `url_decode` |
| `base64-encode` / `base64-decode` | `base64_encode` / `base64_decode` |
| `json-escape` / `json-unescape` | `json_escape` / `json_unescape` |

保留 Action 的 local ID 不变，但已有 Flow 需要重新选择 Toolbox 下的 Action 并保存，替换旧插件身份；上述六个移除项改选 builtin。迁移时核对边界行为，例如 builtin URL 编码还会转义 `!'()*`。仓库不会自动修改宿主配置或已保存 Flow。

安装 Toolbox 后禁用/移除原七个插件，避免重复卡片和 Action。对已有条目执行重新检测以生成新命名空间的附件。旧身份下的能力开关、排序偏好不会自动迁移。

## 开发

```sh
npm install
npm run dev
npm run verify
```

`verify` 包含 manifest 校验、类型检查、lint、Runtime 与 16 个页面构建、接线与产物校验，以及针对 `dist/plugin.cjs` 的 Node 测试。详见 [GUIDE_zh.md](./GUIDE_zh.md) 和实际安装 SDK 的 `docs/README.md` / `API.md`。
