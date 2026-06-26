# 选题点子库 + 类别词表

双重用途：① 阶段 2 提案选题的灵感源；② **类别词表**——给新选题归类，决定"加进已有 `clipbus-{类别}-plugin` 还是新建"。

**优先级：功能实用 > 视觉呈现 > 整活/情绪价值。** 默认从"实用"类里挑；视觉/整活作点缀。

> 归类原则：同一**功能类别**进同一插件（如各种解码都进 `clipbus-decoder-plugin`，作为各自 feature）。类别名取插件目录里的 `{topic}`。下面每个一级条目就是一个候选**类别 = 一个插件**，子条目是该插件里的 feature。

## 实用类（优先）

### decoder（解码/编码）`clipbus-decoder-plugin`
剪贴板里常见编码串，识别→展示解码结果→一键复制。
- base64 编解码、URL 百分号编解码、JWT 解析（header/payload）、Hex↔文本、Unicode `\u` 转义、HTML 实体、Quoted-Printable、Punycode。
- 扩展点：detector（识别编码特征）+ renderer（展示解码）+ auto-run action（复制解码结果）。

### formatter（格式化/美化）`clipbus-formatter-plugin`
识别结构化文本→美化缩进→展示+复制。
- JSON、XML、SQL、YAML、TOML、CSV 对齐、GraphQL。
- 扩展点：detector + renderer（高亮/缩进预览）+ auto-run action（复制格式化结果）。

### converter（转换）`clipbus-converter-plugin`
一种表示↔另一种表示。
- 时间戳↔日期（含时区）、进制转换（2/8/10/16）、单位换算、命名风格（camel/snake/kebab/Pascal）、Markdown↔HTML、颜色模型（hex/rgb/hsl，**带色块视觉**）。
- 扩展点：detector + renderer + auto-run action（或 draft：让用户选目标格式）。

### extractor（提取）`clipbus-extractor-plugin`
从大段文本里抽出目标。
- 提取所有 URL / Email / IP / 手机号、正则匹配项、代码块、Markdown 链接。
- 扩展点：detector + renderer（列出命中项，可计数）+ auto-run action（复制全部命中）。

### inspector（检视/校验）`clipbus-inspector-plugin`
对内容做度量/校验，给信息而非改写。
- 字符串统计（字符/词/行/字节）、哈希（md5/sha1/sha256）、JSON 校验+路径提示、文本 diff、图片尺寸/格式（image kind）。
- 扩展点：detector + renderer（信息卡）；多为只读，未必要 action。

### generator（生成）`clipbus-generator-plugin`
按需产出新内容（常配 draft 让用户调参）。
- UUID、随机密码、Lorem、二维码（**生成图片**，用 `host.asset.registerImage` 出 `clipbus-asset://`）、哈希、占位数据。
- 扩展点：draft action（参数表单 + `clipbus.action.complete`）或 auto-run；生成图片走 asset 注册。

### text（文本处理）`clipbus-text-plugin`
对剪贴板文本做常见清洗。
- 去重行、排序、去空白、slugify、大小写、统计、反转、计数替换。
- 扩展点：detector + renderer（预览处理后）+ auto-run action。

## 视觉类（次优先，点缀）

### visual（可视化预览）`clipbus-visual-plugin`
强调"看"的渲染。
- 颜色色块预览（hex/rgb→大色块 + 对比色）、Markdown 实时预览、图片 EXIF/尺寸卡、二维码渲染、JSON 树形折叠视图。
- 扩展点：detector + renderer（`height:"auto"` 或 `{min,max}` + `autoFit`，重排版与主题）。

## 整活类（最低优先，情绪价值）

### fun（整活）`clipbus-fun-plugin`
- emoji 化、Zalgo、花体/全角美化、ASCII art、彩虹文字预览、复读机。
- 扩展点：detector + renderer + auto-run action。视觉可以夸张但仍守主题 token。

---

## 怎么用这张表

1. survey 拿到已有插件后，先看新想法**落在哪个类别**。
2. 该类别的 `clipbus-{类别}-plugin` **已存在** → 作为新 feature 加进去（别和已覆盖的 feature 重复）。
3. **不存在** → 新建该插件，先实现 1-2 个最有用的 feature，README 里留出"未来可加"的清单。
4. 提案时给用户的每条都标明：类别 / 归属（新建 or 加进 X）/ 定位（实用·视觉·整活）/ 计划扩展点。
