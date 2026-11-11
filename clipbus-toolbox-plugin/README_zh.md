# Toolbox 工具箱

[English](./README.md) | 中文

开发者剪贴板工具箱：**16 个 detector、16 个 renderer、24 个 Action**。使用 SDK 3.2、插件协议 V2、manifest schema 6；Vibe 继续独立安装。

插件 ID 为 **`plugin.awesome.toolbox`**，附件类型和外部设置键使用相同前缀。

## 自动卡片

每项 detector 与 renderer 一一配套，输入均为文本。

| Detector | Renderer | 功能 |
|---|---|---|
| `base64-detector` | `base64-renderer` | 可读 UTF-8 Base64 / URL-safe Base64 解码预览 |
| `jwt-detector` | `jwt-renderer` | JWT Header、Payload、声明、过期信息；本地解码，不验证签名 |
| `xml-detector` | `xml-renderer` | 验证 XML 标签配对及属性语法后格式化，显示计数和深度 |
| `csv-detector` | `csv-table` | 逗号/制表符/分号表格；所有行列数一致，支持合法引号、多行单元格，保守排除未加引号的逗号空格表头 |
| `timestamp-detector` | `timestamp-renderer` | 2001–2099 年的 10/13 位 Unix 时间戳；本地、UTC、ISO、多时区 |
| `radix-detector` | `radix-renderer` | DEC/HEX/OCT/BIN、位数、可打印 ASCII |
| `duration-detector` | `duration` | ISO 8601 时长分解与总秒数；年/月按近似值计算 |
| `entities-detector` | `entities-renderer` | 正文中至少两个去重后的邮箱 / IPv4；排除 URL 及 URL 内的地址 |
| `url-detector` | `url-parsed` | 带 query 的单个 URL，或至少两对参数的裸 query；保留重复参数并清理追踪参数 |
| `ip-detector` | `ip-details` | 完整 IPv4/IPv6 或 CIDR；地址范围、规范形式、网段信息 |
| `geo-detector` | `geo-coordinates` | 默认要求度数/方位标记；显示经纬度、度分秒及地图链接 |
| `mac-detector` | `mac-address` | 带分隔符的 MAC、格式转换、OUI/NIC、地址标志 |
| `uuid-detector` | `uuid-details` | UUID 规范化、版本/变体、v1/v7 内嵌时间戳 |
| `markdown-detector` | `markdown-renderer` | 安全 Markdown；完整围栏、多项列表或两种语法信号触发，让位于 JSON/XML/CSV/Cron |
| `gradient-detector` | `gradient-swatch` | 通过 CSS 语法校验且包含可识别色标的渐变函数 |
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

## 自动触发与搜索规则

- 普通十进制整数默认不出进制卡；显式 `0x` / `0b` / `0o` 正常识别，有效时间戳始终优先。
- 普通 URL 交给 builtin，只有带参数时 Toolbox 才补卡；拒绝内部空白/控制字符，避免把后面的说明文字并入 URL。
- CSV 所有记录必须列数一致、引号合法。未加引号的“逗号加空格”表头保守视为普通文本；自动预览请使用常规分隔格式或引号表头。
- 完整 IP/CIDR 显示详情；正文至少两个去重后的邮箱 / IPv4 显示提取列表；正文单个地址不触发两者。
- 纯小数坐标对需显式开启；默认要求度数或 N/S/E/W 方位标记。
- Base64/XML 仅截断视觉预览，复制使用完整结果。超过 SDK 附件预算时不出卡，不产生不完整的复制结果。

**全部 16 个 detector 默认不写搜索扩展。** 卡片展示不依赖搜索索引。XML、CSV、时间戳、进制、时长、实体、URL/Query、IP、坐标、MAC、UUID、Markdown、渐变、Cron 均不追加索引。

仅 Base64/JWT 可显式开启解码内容索引，分别使用 `base64` / `jwt` scope。每条最多 4 KiB UTF-8，不切断 Unicode 码点。搜索扩展与附件都只保存在本机，不随历史云同步。manifest 声明这两个 scope 只是允许写入，并不自动建立索引。关闭选项后重复复制会显式以空组替换对应 detector 的旧索引；完整重检也会清理旧的检测产出。

只将需要开启的选项合并到宿主 external settings JSON，再 Reload Toolbox。四项默认均为 false：

```json
{
  "plugin.awesome.toolbox.decimalRadix": true,
  "plugin.awesome.toolbox.decimalCoordinates": true,
  "plugin.awesome.toolbox.indexBase64": true,
  "plugin.awesome.toolbox.indexJwt": true
}
```

macOS 文件为 `~/Library/Application Support/Clipbus/ExternalSettings/settings.json`，Debug 版使用 `ClipbusDebug`。插件只读这些设置，各能力的独立开关和排序仍由宿主管理。

## 从原七个插件迁移

旧 `plugin.toolbox` 现改为 **`plugin.awesome.toolbox`**，旧 `plugin.vibe` 现改为 **`plugin.awesome.vibe`**。安装/重新添加新身份后再停用旧身份。能力开关、顺序及已保存 Flow 不会随 ID 自动迁移。需要时将 `plugin.toolbox.decimalRadix` 迁至新前缀，并将 `plugin.vibe.animations` 迁至 `plugin.awesome.vibe.animations`。

ID 改名也会改变附件/搜索扩展的 owner。新 ID 重新检测**不会清理旧 ID 的历史搜索记录**。要彻底去掉旧 scope，需要宿主按旧 owner 清理，或在停用前让原 ID 的 detector 提交空输出；不能假定卸载/Reload 会清理历史。新插件无权写入其他身份的记录，也不会修改用户数据库。

从本仓库安装时，子目录填写 **`clipbus-toolbox-plugin`**；开发插件则 Add Path 到本目录。新身份为 `plugin.awesome.toolbox`，Vibe 仍使用独立的 `plugin.awesome.vibe`。

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
