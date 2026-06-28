import type { SampledPoint } from "./textSampler";

// Viewport world height at camera z=4.2, fov=50
const V_WORLD = 2 * Math.tan((50 * Math.PI / 180) / 2) * 4.2;  // ≈ 3.916

export interface GlyphFit { scale: number; cx: number; cy: number; }

/**
 * Compute scale + centering offset to fit a glyph point cloud into world space.
 * Text height targets heightFrac of viewport height; width is capped at widthFrac of
 * viewport width (aspect-corrected). The smaller scale wins (fit, not fill).
 * @param aspect W/H (container pixel ratio)
 */
export function computeGlyphFit(
  points: SampledPoint[],
  aspect: number,
  heightFrac = 0.46,
  widthFrac  = 0.84,
): GlyphFit {
  if (points.length === 0) return { scale: 1, cx: 0, cy: 0 };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const gW = Math.max(maxX - minX, 1e-3);
  const gH = Math.max(maxY - minY, 1e-3);
  const cx  = (minX + maxX) / 2;
  const cy  = (minY + maxY) / 2;
  const hWorld = V_WORLD * aspect;         // world width
  const scaleH = (V_WORLD * heightFrac) / gH;
  const scaleW = (hWorld  * widthFrac)  / gW;
  return { scale: Math.min(scaleH, scaleW), cx, cy };
}
