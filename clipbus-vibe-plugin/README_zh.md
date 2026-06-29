# Vibe（情绪兜底动画）

**Clipbus 情绪兜底动画 renderer** — 当某条复制的文本没有任何更专业的插件能够展示时，Vibe 用 Three.js 粒子动画将其演绎成「混沌→秩序」的沉浸式视觉体验。

## 工作原理

### 兜底机制（广挂 + 让位）

Vibe 的 detector 会为所有非空 text 类型的剪贴板条目挂载附件。renderer 在渲染时检查同一条目是否存在来自**其他插件命名空间**的附件——如果有，则让位（`shouldDisplay: false`），优先展示更专业的插件。只有当没有其他插件声明该条目时，Vibe 才显示动画卡。

### 三个可切换动画

Vibe 内置三个动画。Clipbus 在卡片下方渲染原生按钮栏，按**配置列表**的顺序为每个动画显示一个按钮。点击任意按钮即切换到对应动画；点击当前动画按钮则重播。**列表中的第一个**动画在加载时显示。显示哪些动画及其顺序可通过设置项配置（见下文），未配置时显示全部三个（默认顺序）。

#### Particle Core（5 阶段，4.8s）

| 阶段 | 时间 | 描述 |
|---|---|---|
| 起手淡入 | 0 – 0.18s | 粒子在文字字形位置浮现 |
| Burst（爆发） | 0.18 – 0.35s | 粒子从字形向外炸开 |
| Chaos（混沌） | 0.35 – 1.6s | Simplex 噪声流场，有机涌动 |
| Attraction（吸引） | 1.6 – 3.1s | 弹簧力收束至 Fibonacci 球 |
| Reassembly（重组） | 3.1 – 4.1s | 精确收敛到球面，bloom 脉冲 |
| Settle（静息） | 4.1s+ | 球体缓慢自转 + 透明呼吸 |

配色：cyan `#5CE1FF`、purple `#9A6BFF`、soft white `#EAF6FF`。

#### Text Reveal（6 阶段，4.6s）

| 阶段 | 时间 | 描述 |
|---|---|---|
| Text In（文字入场） | 0 – 0.6s | 粒子收敛至字形，**可读 ≥ 0.6s** |
| Scan（光扫描） | 0.6 – 1.2s | 光带从左到右扫过字形，能量聚集 |
| Deconstruct（裂解） | 1.2 – 1.8s | 边缘粒子错峰漂移，轮廓保持可辨 |
| Burst（爆发） | 1.8 – 2.4s | 错峰释放——粒子从字形向外炸开 |
| Recall（回收） | 2.4 – 3.5s | 弹簧力将粒子拉向多面体光核 |
| Form / Settle（成形 / 静息） | 3.5s+ | 粒子锁定到二十面体顶点，缓慢自转 |

配色：cyan `#7EE7FF`、purple `#A78BFA`、soft white `#FFFFEF`。重组目标为 IcosahedronGeometry（detail 4），呈现有棱角的"数据晶体"形态，区别于第一版的光滑球。

后处理链均为：RenderPass → AfterimagePass（拖尾）→ UnrealBloomPass（泛光）→ OutputPass。

#### Text Loop（`text-loop`）— 10s 无缝循环

| 阶段 | 时间 | 描述 |
|---|---|---|
| P1 文字呈现 | 0 – 1.0s | 字形稳定显示，透明度淡入后缓慢呼吸 |
| P2 粒子化 | 1.0 – 2.0s | 错峰噪声抖动打散字形边缘，轮廓保持可辨 |
| P3 爆发 | 2.0 – 3.0s | 粒子从字形向云端位置散射 |
| P4 漂移云 | 3.0 – 5.0s | 噪声驱动能量云；两端漂移幅度归零（无缝衔接） |
| P5 召回 | 5.0 – 6.5s | 漩涡将粒子引向 Fibonacci 球；抵达后漩涡淡出 |
| P6 稳定球 | 6.5 – 8.0s | 球体轻柔脉动；无累积旋转（循环安全） |
| P7 解构 | 8.0 – 9.0s | 球体溶解回云端位置 |
| P8 重组 | 9.0 – 10.0s | 粒子沿原爆发路径逆向流动，精确还原字形 — 循环重启 |

配色：cyan `#7EE7FF`、purple `#A78BFA`、white `#FFFFFF`。

### 切换动画

切换由 SDK 的原生 renderer 按钮 API 驱动（`clipbus.attachmentRenderer.setButtons` + `onHostInvoke`）——卡片内无内置按钮。加载时 Vibe 从设置中解析动画列表，调用 `setButtons` 为每个动画注册一个**启用**的按钮，第一个动画默认显示。点击任意按钮即切换；点击当前按钮则重播。

### 设置

Vibe 读取一个只读设置项 **`plugin.vibe.animations`**——按顺序显示的动画 id 列表。**第一个**条目在加载时显示；每个列出的动画对应一个按钮。

| 值 | 效果 |
|---|---|
| id 的 JSON 数组，如 `["text-loop","particle-core"]` | 按该顺序仅显示这些动画；第一个在加载时显示 |
| 未设置 / 为空 / 无有效 id | 按默认顺序显示全部动画（`particle-core`、`text-reveal`、`text-loop`）；第一个在加载时显示 |

有效 id：`particle-core`、`text-reveal`、`text-loop`。未知 id 会被忽略，重复项会被合并。也接受逗号/空格分隔的字符串（如 `"text-loop, particle-core"`）。

插件只能**读**设置（`clipbus.settings.get`）——没有 `settings.set`，manifest 也无设置 schema。设置是宿主持有的扁平共享 JSON 存储，key 以 plugin id 作命名空间前缀。配置方法：编辑宿主的 external-settings 文件，然后重载插件：

```
~/Library/Application Support/Clipbus/ExternalSettings/settings.json   （debug 构建为 …/ClipbusDebug/…）
```

```json
{ "plugin.vibe.animations": ["text-loop", "particle-core"] }
```

然后在 Clipbus 里重载 Vibe（Settings → Plugins → Developer Plugins → Reload）或重启 Clipbus。卡片内的切换仅当次会话有效，不会写回设置。

## 注意事项

- **跨插件让位**需在真实 Clipbus 环境中验证，dev 预览仅有本插件故始终显示 Vibe 卡。
- 卡片背景为深色太空渐变，是动画的视觉本质，并非 theme 错误。
- 附件 syncScope 为 `local_only`，不会跨设备同步。
