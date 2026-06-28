# Vibe（情绪兜底动画）

**Clipbus 情绪兜底动画 renderer** — 当某条复制的文本没有任何更专业的插件能够展示时，Vibe 用 Three.js 粒子动画将其演绎成「混沌→秩序」的沉浸式视觉体验。

## 工作原理

### 兜底机制（广挂 + 让位）

Vibe 的 detector 会为所有非空 text 类型的剪贴板条目挂载附件。renderer 在渲染时检查同一条目是否存在来自**其他插件命名空间**的附件——如果有，则让位（`shouldDisplay: false`），优先展示更专业的插件。只有当没有其他插件声明该条目时，Vibe 才显示动画卡。

### 两个可切换动画

Vibe 内置两个动画，底部按钮循环切换；首次随机选择。

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

### 切换按钮

底部按钮显示当前动画名（`Particle Core` 或 `Text Reveal`），点击切换到下一个。

## 注意事项

- **跨插件让位**需在真实 Clipbus 环境中验证，dev 预览仅有本插件故始终显示 Vibe 卡。
- 卡片背景为深色太空渐变，是动画的视觉本质，并非 theme 错误。
- 附件 syncScope 为 `local_only`，不会跨设备同步。
