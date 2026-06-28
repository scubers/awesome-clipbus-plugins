/**
 * textReveal — Three.js 六阶段粒子动画
 * 叙事：文字完整可读 → 光扫描 → 边缘裂解 → 爆发 → 回收 → 多面体光核
 * 防过曝要点（复用第一版经验）：小点径 + 低 alpha + 低 bloom strength
 */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";
import type { VibeAnimation, VibeAnimationContext, VibeAnimationInstance } from "./types";
import { sampleText } from "./textSampler";
import { createNoise3D } from "./noise";
import { computeGlyphFit } from "./glyphFit";

// ── 时间轴（秒）──────────────────────────────────────────────────────────────
const TEXT_IN_END  = 0.6;
const SCAN_END     = 1.2;
const DECON_END    = 1.8;
const BURST_END    = 2.4;
const RECALL_END   = 3.5;
const FORM_END     = 4.6;

const NOISE_FREQ  = 0.6;
const NOISE_FLOW  = 0.25;
const NOISE_STR   = 1.2;
const BURST_SPEED = 3.2;
const BASE_BLOOM  = 0.4;
const BASE_THRESH = 0.18;
// afterimage 文字阶段低（别糊字），爆发后升
const DAMP_TEXT  = 0.50;
const DAMP_BURST = 0.82;

// ── 工具 ──────────────────────────────────────────────────────────────────────

function ease(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function makeLCG(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function makeCSSFallback(container: HTMLElement): VibeAnimationInstance {
  const el = document.createElement("div");
  el.style.cssText =
    "width:100%;height:100%;background:radial-gradient(ellipse at 50% 50%," +
    "#0a0a1a 0%,#050508 60%,#020203 100%);";
  container.appendChild(el);
  return { start: () => { /* no-op */ }, replay: () => { /* no-op */ }, dispose: () => { el.remove(); } };
}

// ── 主导出 ────────────────────────────────────────────────────────────────────

export const textReveal: VibeAnimation = {
  id: "text-reveal",
  label: "Text Reveal",

  create(ctx: VibeAnimationContext): VibeAnimationInstance {
    const { container, text } = ctx;

    // WebGL 容错
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      return makeCSSFallback(container);
    }
    if (!renderer.getContext()) {
      renderer.dispose();
      return makeCSSFallback(container);
    }

    // ── 粒子数据 ─────────────────────────────────────────────────────────────
    // step=2 → 更密采样，文字可读性更强
    const raw  = sampleText(text, 5000, 2);
    const N    = clamp(raw.length > 0 ? raw.length : 1600, 800, 5000);
    const seed = ((text.charCodeAt(0) || 42) * 7919 + N) >>> 0;
    const rand = makeLCG(seed);

    const posArr      = new Float32Array(N * 3);
    const velArr      = new Float32Array(N * 3);
    const textPosArr  = new Float32Array(N * 3);
    const corePos     = new Float32Array(N * 3);
    const colorArr    = new Float32Array(N * 3);
    const sizeArr     = new Float32Array(N);
    const burstVelArr = new Float32Array(N * 3);
    const releaseDelay = new Float32Array(N);   // 0..0.5，错峰裂解
    const burstFired  = new Uint8Array(N);       // 每粒子是否已注入爆发速度

    // 文字字形位置：等比 fit 到视口（文字高度 ~46%，真机小卡片可读）
    if (raw.length > 0) {
      const fitAspect = (container.clientWidth || 320) / (container.clientHeight || 220);
      const fit = computeGlyphFit(raw, fitAspect);
      for (let i = 0; i < N; i++) {
        const src = raw[i < raw.length ? i : Math.floor(rand() * raw.length)];
        textPosArr[i * 3]     = (src.x - fit.cx) * fit.scale;
        textPosArr[i * 3 + 1] = (src.y - fit.cy) * fit.scale;
        textPosArr[i * 3 + 2] = (rand() - 0.5) * 0.03;
      }
    } else {
      // 空文本 fallback：小平面点云
      for (let i = 0; i < N; i++) {
        textPosArr[i * 3]     = (rand() - 0.5) * 2.8;
        textPosArr[i * 3 + 1] = (rand() - 0.5) * 0.8;
        textPosArr[i * 3 + 2] = (rand() - 0.5) * 0.06;
      }
    }

    // 多面体光核（IcosahedronGeometry 顶点，区别第一版 fibonacci 球）
    {
      const icoGeo  = new THREE.IcosahedronGeometry(1.45, 4);
      const icoAttr = icoGeo.getAttribute("position") as THREE.BufferAttribute;
      const icoCount = icoAttr.count;
      for (let i = 0; i < N; i++) {
        const j = i % icoCount;
        corePos[i * 3]     = icoAttr.getX(j);
        corePos[i * 3 + 1] = icoAttr.getY(j);
        corePos[i * 3 + 2] = icoAttr.getZ(j);
      }
      icoGeo.dispose();   // 顶点已提取，释放几何体
    }

    // 颜色：cyan #7EE7FF / purple #A78BFA / white #FFFFEF，按径向位置混合
    for (let i = 0; i < N; i++) {
      const dx   = textPosArr[i * 3];
      const dy   = textPosArr[i * 3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      const p    = clamp(dist / 1.2, 0, 1);   // 0=中心(白) 1=外缘(cyan/purple)
      const cp   = rand();
      colorArr[i * 3]     = lerp(lerp(0.494, 0.655, cp), 1.000, 1 - p);
      colorArr[i * 3 + 1] = lerp(lerp(0.906, 0.545, cp), 1.000, 1 - p);
      colorArr[i * 3 + 2] = lerp(lerp(1.000, 0.980, cp), 0.937, 1 - p);
    }

    // 粒子大小 + 错峰延迟 + 爆发速度
    for (let i = 0; i < N; i++) {
      sizeArr[i]       = 0.5 + rand() * 1.1;         // 0.5..1.6
      releaseDelay[i]  = rand() * 0.5;               // 0..0.5s 错峰

      // burstVel：从字形向外 + 小噪声扰动 + 切向
      const bx  = textPosArr[i * 3];
      const by  = textPosArr[i * 3 + 1];
      const bz  = textPosArr[i * 3 + 2];
      const len = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
      const nx  = bx / len, ny = by / len, nz = bz / len;
      const sign  = rand() > 0.5 ? 1 : -1;
      const tx    = -ny * sign, ty = nx * sign;
      const noisePerturbX = (rand() - 0.5) * 0.5;
      const noisePerturbY = (rand() - 0.5) * 0.5;
      const speed = BURST_SPEED * (0.5 + 0.5 * rand());
      burstVelArr[i * 3]     = (nx + tx * 0.2 + noisePerturbX) * speed;
      burstVelArr[i * 3 + 1] = (ny + ty * 0.2 + noisePerturbY) * speed;
      burstVelArr[i * 3 + 2] = (nz + (rand() - 0.5) * 0.35)    * speed;
    }

    // ── Three.js 场景 ────────────────────────────────────────────────────────
    const W0 = container.clientWidth  || 320;
    const H0 = container.clientHeight || 220;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W0 / H0, 0.1, 100);
    camera.position.z = 4.2;

    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W0, H0);
    renderer.setClearColor(0x05060a, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.style.cssText = "width:100%;height:100%;display:block;";
    container.appendChild(canvas);

    // 深空背景（同第一版）
    const bgGeo = new THREE.PlaneGeometry(2, 2);
    const bgMat = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: /* glsl */`
        varying vec2 vPos;
        void main() { vPos = position.xy; gl_Position = vec4(position.xy, 0.9999, 1.0); }
      `,
      fragmentShader: /* glsl */`
        varying vec2 vPos;
        void main() {
          float d = clamp(length(vPos) * 0.75, 0.0, 1.0);
          vec3 c = mix(vec3(0.040, 0.040, 0.086), vec3(0.016, 0.016, 0.039), d);
          gl_FragColor = vec4(c, 1.0);
        }
      `,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.renderOrder = -1;
    bgMesh.frustumCulled = false;
    scene.add(bgMesh);

    // 粒子几何
    const geometry = new THREE.BufferGeometry();
    const posAttr  = new THREE.BufferAttribute(posArr, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("position", posAttr);
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colorArr, 3));
    geometry.setAttribute("aSize",  new THREE.BufferAttribute(sizeArr,  1));

    // 粒子着色器：包含扫描高亮（uScan）
    // 防过曝：点径系数 ~21，单点基础 alpha 0.26（文字密集时靠数量形成亮度，非单点放大）
    const dpr0   = Math.min(devicePixelRatio, 2);
    const baseSz = (H0 * dpr0) / 220 * 0.5;

    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        uSize:    { value: baseSz },
        uOpacity: { value: 0.0 },
        uScan:    { value: -1.0 },   // <0 = 无扫描
      },
      vertexShader: /* glsl */`
        attribute vec3  aColor;
        attribute float aSize;
        uniform   float uSize;
        uniform   float uScan;
        varying   vec3  vColor;
        varying   float vScan;
        void main() {
          vColor = aColor;
          // 扫描带高亮：归一化 x∈[-1,1]，uScan*2-1 是扫描线位置
          float sx  = position.x / 1.8;
          vScan = uScan < 0.0 ? 0.0 : smoothstep(0.18, 0.0, abs(sx - (uScan * 2.0 - 1.0)));
          vec4 mv   = modelViewMatrix * vec4(position, 1.0);
          // 防过曝：系数 21（vs 第一版 300），目标 ~5px 物理大小
          gl_PointSize = uSize * aSize * (1.0 + vScan * 1.2) * (21.0 / -mv.z);
          gl_Position  = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uOpacity;
        varying vec3  vColor;
        varying float vScan;
        void main() {
          float d   = length(gl_PointCoord - 0.5);
          float a   = smoothstep(0.5, 0.0, d);
          vec3  col = vColor + vScan * vec3(0.5);        // 扫描处偏白增亮
          // 基础 alpha 0.26 防过曝；扫描带显著提亮
          gl_FragColor = vec4(col, a * uOpacity * (0.26 + vScan * 0.5));
        }
      `,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      depthTest:   false,
      transparent: true,
    });

    const points = new THREE.Points(geometry, particleMat);
    scene.add(points);

    // 后处理
    const composer     = new EffectComposer(renderer);
    const renderPass   = new RenderPass(scene, camera);
    const afterimgPass = new AfterimagePass(DAMP_TEXT);
    const bloomPass    = new UnrealBloomPass(new THREE.Vector2(W0, H0), BASE_BLOOM, 0.6, BASE_THRESH);
    const outputPass   = new OutputPass();
    composer.addPass(renderPass);
    composer.addPass(afterimgPass);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    // 噪声场
    const noise3D = createNoise3D(seed + 13);

    // ── RAF 状态 ─────────────────────────────────────────────────────────────
    let rafId      = 0;
    let disposed   = false;
    let t          = 0;
    let lastTime   = -1;
    let bloomPulse = 0;

    // 初始位置：textPos + 轻微向上偏移（Text In 阶段收敛到字形）
    function initPos() {
      const r = makeLCG(seed + 1);
      for (let i = 0; i < N; i++) {
        posArr[i * 3]     = textPosArr[i * 3]     + (r() - 0.5) * 0.05;
        posArr[i * 3 + 1] = textPosArr[i * 3 + 1] + 0.15 + r() * 0.05;
        posArr[i * 3 + 2] = textPosArr[i * 3 + 2] + (r() - 0.5) * 0.02;
      }
    }

    function resetState() {
      t          = 0;
      lastTime   = -1;
      bloomPulse = 0;
      initPos();
      velArr.fill(0);
      burstFired.fill(0);
      particleMat.uniforms["uOpacity"].value = 0;
      particleMat.uniforms["uScan"].value    = -1;
      bloomPass.strength  = BASE_BLOOM;
      bloomPass.threshold = BASE_THRESH;
      afterimgPass.damp   = DAMP_TEXT;
      posAttr.needsUpdate = true;
      points.rotation.y   = 0;
    }

    function tick(now: number) {
      if (disposed) return;
      rafId = requestAnimationFrame(tick);

      if (lastTime < 0) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;
      t += dt;

      // ── Phase 1: Text In (0..0.6) ────────────────────────────────────────
      if (t < TEXT_IN_END) {
        // 透明度淡入（前 0.35s）
        if (t < 0.35) {
          particleMat.uniforms["uOpacity"].value = t / 0.35;
        } else {
          // 末段轻呼吸
          particleMat.uniforms["uOpacity"].value = 1.0 + Math.sin(t * 6) * 0.03;
        }
        particleMat.uniforms["uScan"].value = -1;
        // 粒子收敛到字形（per-frame lerp）
        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          posArr[ix] = lerp(posArr[ix], textPosArr[ix], 0.12);
          posArr[iy] = lerp(posArr[iy], textPosArr[iy], 0.12);
          posArr[iz] = lerp(posArr[iz], textPosArr[iz], 0.12);
        }
        afterimgPass.damp  = DAMP_TEXT;
        bloomPass.strength = BASE_BLOOM;

      // ── Phase 2: Scan (0.6..1.2) ────────────────────────────────────────
      } else if (t < SCAN_END) {
        particleMat.uniforms["uOpacity"].value = 1.0;
        particleMat.uniforms["uScan"].value    = (t - TEXT_IN_END) / (SCAN_END - TEXT_IN_END);
        // 粒子微抖但保持字形
        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          posArr[ix] = lerp(posArr[ix], textPosArr[ix], 0.08);
          posArr[iy] = lerp(posArr[iy], textPosArr[iy], 0.08);
          posArr[iz] = lerp(posArr[iz], textPosArr[iz], 0.08);
        }
        afterimgPass.damp  = DAMP_TEXT;
        bloomPass.strength = BASE_BLOOM;

      // ── Phase 3: Deconstruct (1.2..1.8) ─────────────────────────────────
      } else if (t < DECON_END) {
        particleMat.uniforms["uOpacity"].value = 1.0;
        particleMat.uniforms["uScan"].value    = -1;
        const progress = (t - SCAN_END) / (DECON_END - SCAN_END);

        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          const px = posArr[ix], py = posArr[iy], pz = posArr[iz];
          const tz = pz * NOISE_FREQ + t * NOISE_FLOW;
          const e   = 0.4;
          const dnx = noise3D(px + e, py, tz) - noise3D(px - e, py, tz);
          const dny = noise3D(px, py + e, tz) - noise3D(px, py - e, tz);
          const dnz = noise3D(px, py, tz + e) - noise3D(px, py, tz - e);
          const nl  = Math.sqrt(dnx * dnx + dny * dny + dnz * dnz) || 1;
          // 小幅噪声位移（轮廓边缘开始裂解）
          posArr[ix] += (dnx / nl) * 0.04 * dt;
          posArr[iy] += (dny / nl) * 0.04 * dt;
          posArr[iz] += (dnz / nl) * 0.04 * dt;
          // releaseDelay 小的粒子提前累积少量向外速度
          if (releaseDelay[i] < progress * 0.5) {
            const bx  = textPosArr[ix] || 0.001, by = textPosArr[iy] || 0.001, bz = textPosArr[iz];
            const bl  = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
            velArr[ix] += (bx / bl) * 0.3 * dt;
            velArr[iy] += (by / bl) * 0.3 * dt;
            velArr[iz] += (bz / bl) * 0.3 * dt;
          }
          velArr[ix] *= 0.98; velArr[iy] *= 0.98; velArr[iz] *= 0.98;
          posArr[ix] += velArr[ix] * dt;
          posArr[iy] += velArr[iy] * dt;
          posArr[iz] += velArr[iz] * dt;
        }
        afterimgPass.damp  = lerp(DAMP_TEXT, 0.70, progress);
        bloomPass.strength = lerp(BASE_BLOOM, 0.55, progress);  // 能量积聚微升

      // ── Phase 4: Burst (1.8..2.4) ────────────────────────────────────────
      } else if (t < BURST_END) {
        particleMat.uniforms["uOpacity"].value = 1.0;
        particleMat.uniforms["uScan"].value    = -1;

        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          // 错峰注入：粒子到释放时刻才注入速度（一次）
          if (!burstFired[i] && t > DECON_END + releaseDelay[i]) {
            burstFired[i] = 1;
            velArr[ix] = burstVelArr[ix];
            velArr[iy] = burstVelArr[iy];
            velArr[iz] = burstVelArr[iz];
          }
          velArr[ix] *= 0.90; velArr[iy] *= 0.90; velArr[iz] *= 0.90;
          posArr[ix] += velArr[ix] * dt;
          posArr[iy] += velArr[iy] * dt;
          posArr[iz] += velArr[iz] * dt;
        }
        afterimgPass.damp  = DAMP_BURST;
        bloomPass.strength = BASE_BLOOM;

      // ── Phase 5: Recall (2.4..3.5) ────────────────────────────────────────
      } else if (t < RECALL_END) {
        particleMat.uniforms["uOpacity"].value = 1.0;
        particleMat.uniforms["uScan"].value    = -1;
        const p      = ease(clamp((t - BURST_END) / (RECALL_END - BURST_END), 0, 1));
        const spring = lerp(1.5, 7.0, p);
        const noiseW = 1 - p;
        const damp   = lerp(0.96, 0.90, p);

        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          const px = posArr[ix], py = posArr[iy], pz = posArr[iz];
          const e   = 0.4;
          const tz  = pz * NOISE_FREQ + t * NOISE_FLOW;
          const dnx = (noise3D(px + e, py, tz) - noise3D(px - e, py, tz)) * NOISE_STR;
          const dny = (noise3D(px, py + e, tz) - noise3D(px, py - e, tz)) * NOISE_STR;
          const dnz = (noise3D(px, py, tz + e) - noise3D(px, py, tz - e)) * NOISE_STR;
          const ax  = (corePos[ix] - px) * spring + dnx * noiseW;
          const ay  = (corePos[iy] - py) * spring + dny * noiseW;
          const az  = (corePos[iz] - pz) * spring + dnz * noiseW;
          velArr[ix] = (velArr[ix] + ax * dt) * damp;
          velArr[iy] = (velArr[iy] + ay * dt) * damp;
          velArr[iz] = (velArr[iz] + az * dt) * damp;
          posArr[ix] += velArr[ix] * dt;
          posArr[iy] += velArr[iy] * dt;
          posArr[iz] += velArr[iz] * dt;
        }
        afterimgPass.damp  = lerp(DAMP_BURST, 0.70, p);
        bloomPass.strength = BASE_BLOOM;

      // ── Phase 6: Form (3.5..4.6) ─────────────────────────────────────────
      } else if (t < FORM_END) {
        particleMat.uniforms["uScan"].value = -1;
        const p     = ease(clamp((t - RECALL_END) / (FORM_END - RECALL_END), 0, 1));
        const lerpK = 0.12 + 0.5 * p;
        const dampFk = lerp(0.90, 0.98, p);

        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          posArr[ix] = lerp(posArr[ix], corePos[ix], lerpK);
          posArr[iy] = lerp(posArr[iy], corePos[iy], lerpK);
          posArr[iz] = lerp(posArr[iz], corePos[iz], lerpK);
          velArr[ix] *= dampFk;
          velArr[iy] *= dampFk;
          velArr[iz] *= dampFk;
        }
        // 成形脉冲（p≈0.88 触发）
        if (p > 0.88 && bloomPulse === 0) {
          bloomPulse = 0.5;
        }
        if (bloomPulse > 0) {
          bloomPulse = Math.max(0, bloomPulse - dt * 2.5);
          bloomPass.strength = BASE_BLOOM + bloomPulse;
          particleMat.uniforms["uOpacity"].value = clamp(
            (particleMat.uniforms["uOpacity"].value as number) + bloomPulse * 0.05, 0.9, 1.0
          );
        } else {
          particleMat.uniforms["uOpacity"].value = 1.0;
          bloomPass.strength = BASE_BLOOM;
        }
        // 自转从 Form 阶段开始
        points.rotation.y  += 0.06 * dt;
        afterimgPass.damp   = lerp(0.70, 0.60, p);

      // ── Settle (>4.6) ─────────────────────────────────────────────────────
      } else {
        particleMat.uniforms["uScan"].value = -1;
        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          posArr[ix] = corePos[ix];
          posArr[iy] = corePos[iy];
          posArr[iz] = corePos[iz];
        }
        points.rotation.y  += 0.06 * dt;
        particleMat.uniforms["uOpacity"].value = 0.9 + Math.sin(t * 0.8) * 0.05;
        bloomPass.strength  = BASE_BLOOM;
        afterimgPass.damp   = 0.60;
      }

      posAttr.needsUpdate = true;
      composer.render(dt);
    }

    // ResizeObserver
    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      const w = entry?.contentRect.width  || 320;
      const h = entry?.contentRect.height || 220;
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const dpr = Math.min(devicePixelRatio, 2);
      particleMat.uniforms["uSize"].value = (h * dpr) / 220 * 0.5;
    });
    observer.observe(container);

    return {
      start() {
        if (disposed) return;
        resetState();
        rafId = requestAnimationFrame(tick);
      },
      replay() {
        if (disposed) return;
        cancelAnimationFrame(rafId);
        resetState();
        rafId = requestAnimationFrame(tick);
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        cancelAnimationFrame(rafId);
        observer.disconnect();
        geometry.dispose();
        particleMat.dispose();
        bgGeo.dispose();
        bgMat.dispose();
        // EffectComposer.dispose() 不级联各 pass，须显式释放（参照第一版修正后做法）
        renderPass.dispose?.();
        afterimgPass.dispose?.();
        bloomPass.dispose?.();
        outputPass.dispose?.();
        composer.dispose();
        renderer.dispose();
        canvas.remove();
      },
    };
  },
};
