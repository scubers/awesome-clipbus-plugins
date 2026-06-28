export interface SampledPoint { x: number; y: number; }  // 归一化，x∈[-1,1], y 向上为正

// 把 text 渲染到离屏 canvas，采样不透明像素为点集；空/失败时返回 []（调用方回退点云）
export function sampleText(text: string, maxPoints = 2600, step = 3): SampledPoint[] {
  const W = 640, H = 256;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  // 取首行、压缩空白、截断到能读的长度（过长字形太密看不清）
  const firstLine = (text.split(/\r?\n/).find((l) => l.trim().length) ?? text).trim().replace(/\s+/g, " ");
  const sample = firstLine.slice(0, 16) || "·";
  // 自适应字号：从大往小试，直到测量宽度 <= W*0.86
  let font = 180;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  do { ctx.font = `700 ${font}px "SF Pro Display", system-ui, sans-serif`; font -= 6; }
  while (font > 24 && ctx.measureText(sample).width > W * 0.86);
  ctx.fillStyle = "#fff";
  ctx.fillText(sample, W / 2, H / 2);
  const data = ctx.getImageData(0, 0, W, H).data;
  const pts: SampledPoint[] = [];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    if (data[(y * W + x) * 4 + 3] > 128) pts.push({ x: (x / W) * 2 - 1, y: -((y / H) * 2 - 1) });
  }
  // 下采样到 maxPoints（均匀抽稀，保形）
  if (pts.length > maxPoints) {
    const out: SampledPoint[] = [];
    const stride = pts.length / maxPoints;
    for (let i = 0; i < maxPoints; i++) out.push(pts[Math.floor(i * stride)]);
    return out;
  }
  return pts;
}
