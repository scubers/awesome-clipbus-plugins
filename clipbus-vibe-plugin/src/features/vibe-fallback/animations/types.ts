export interface VibeAnimationContext { container: HTMLElement; text: string; }
export interface VibeAnimationInstance {
  start(): void;     // 启动 RAF
  replay(): void;    // 重置时间轴重播
  dispose(): void;   // 释放全部资源（RAF/observer/three geometry/material/renderer/canvas）
}
export interface VibeAnimation {
  id: string;
  label: string;     // 英文，按钮 title 用
  create(ctx: VibeAnimationContext): VibeAnimationInstance;
}
