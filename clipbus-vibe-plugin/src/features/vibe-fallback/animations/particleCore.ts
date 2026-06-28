/**
 * particleCore — Three.js 五阶段粒子动画
 * 动画叙事：data → consciousness；entropy → structure
 * 所有过渡用 cubic in/out 缓动，无突兀跳变。
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

// ── 时间轴常量（秒）──────────────────────────────────────────────────────────
const BURST_END      = 0.35;
const CHAOS_END      = 1.6;
const ATTRACT_END    = 3.1;
const REASSEMBLE_END = 4.1;
// SETTLE_END = 4.8 之后保持 settle 状态

const BURST_SPEED = 3.5;
const R_SPHERE    = 1.5;
const NOISE_FREQ  = 0.6;
const NOISE_FLOW  = 0.25;
const NOISE_STR   = 1.3;
const BASE_BLOOM  = 0.42;
const BASE_DAMP   = 0.82;

// ── 工具函数 ─────────────────────────────────────────────────────────────────

function ease(x: number): number {
  // cubic in/out
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** 简单 LCG 伪随机（可重现，不依赖 Math.random） */
function makeLCG(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/** Fibonacci 球均匀分布，半径 R，返回 Float32Array(N*3) */
function fibSphere(N: number, R: number): Float32Array {
  const arr = new Float32Array(N * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y   = 1 - (i / (N - 1)) * 2;
    const r   = Math.sqrt(Math.max(0, 1 - y * y));
    const θ   = golden * i;
    arr[i * 3]     = Math.cos(θ) * r * R;
    arr[i * 3 + 1] = y * R;
    arr[i * 3 + 2] = Math.sin(θ) * r * R;
  }
  return arr;
}

/** CSS 渐变占位（WebGL 不可用时） */
function makeCSSFallback(container: HTMLElement): VibeAnimationInstance {
  const el = document.createElement("div");
  el.style.cssText =
    "width:100%;height:100%;background:radial-gradient(ellipse at 50% 50%," +
    "#0a0a1a 0%,#050508 60%,#020203 100%);";
  container.appendChild(el);
  return {
    start:   () => { /* no-op */ },
    replay:  () => { /* no-op */ },
    dispose: () => { el.remove(); },
  };
}

// ── 主导出 ────────────────────────────────────────────────────────────────────

export const particleCore: VibeAnimation = {
  id: "particle-core",
  label: "Particle Core",

  create(ctx: VibeAnimationContext): VibeAnimationInstance {
    const { container, text } = ctx;

    // WebGL 可用性检测
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

    // ── 粒子数据初始化 ───────────────────────────────────────────────────────
    const raw   = sampleText(text, 2600);
    const N     = clamp(raw.length > 0 ? raw.length : 1400, 600, 2600);
    const seed  = ((text.charCodeAt(0) || 42) * 1234 + N) >>> 0;
    const rand  = makeLCG(seed);

    const posArr       = new Float32Array(N * 3);
    const velArr       = new Float32Array(N * 3);
    const textPosArr   = new Float32Array(N * 3);
    const spherePosArr = new Float32Array(N * 3);
    const colorArr     = new Float32Array(N * 3);
    const sizeArr      = new Float32Array(N);
    const burstVelArr  = new Float32Array(N * 3);

    // 文字字形位置（或抽象 fallback 点云）
    if (raw.length > 0) {
      for (let i = 0; i < N; i++) {
        const src = raw[i < raw.length ? i : Math.floor(rand() * raw.length)];
        textPosArr[i * 3]     = src.x * 1.7;
        textPosArr[i * 3 + 1] = src.y * 0.7;
        textPosArr[i * 3 + 2] = (rand() - 0.5) * 0.08;  // 微小 Z 散布
      }
    } else {
      // 空文本：用小 Fibonacci 球作为起始点云
      const fb = fibSphere(N, 0.4);
      textPosArr.set(fb);
    }

    // Fibonacci 球（重组目标）
    spherePosArr.set(fibSphere(N, R_SPHERE));

    // 颜色：cyan/purple/white 按径向位置混合
    // cyan #5CE1FF = (0.361, 0.882, 1.0)
    // purple #9A6BFF = (0.604, 0.420, 1.0)
    // white #EAF6FF  = (0.918, 0.965, 1.0)
    for (let i = 0; i < N; i++) {
      const dx   = textPosArr[i * 3];
      const dy   = textPosArr[i * 3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      const p    = clamp(dist / 1.2, 0, 1);   // 0=中心(white) 1=外缘(cyan/purple)
      const cp   = rand();                      // cyan←→purple 随机权重
      colorArr[i * 3]     = lerp(lerp(0.361, 0.604, cp), 0.918, 1 - p);
      colorArr[i * 3 + 1] = lerp(lerp(0.882, 0.420, cp), 0.965, 1 - p);
      colorArr[i * 3 + 2] = 1.0;
    }

    // 粒子大小 + 预计算爆发速度
    for (let i = 0; i < N; i++) {
      sizeArr[i] = 0.5 + rand() * 1.2;

      const bx  = textPosArr[i * 3];
      const by  = textPosArr[i * 3 + 1];
      const bz  = textPosArr[i * 3 + 2];
      const len = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
      const nx  = bx / len, ny = by / len, nz = bz / len;
      // 切向分量防止爆发呆板（XY 平面垂直旋转）
      const sign  = rand() > 0.5 ? 1 : -1;
      const tx    = -ny * sign;
      const ty    =  nx * sign;
      const speed = BURST_SPEED * (0.55 + 0.45 * rand());
      burstVelArr[i * 3]     = (nx + tx * 0.25) * speed;
      burstVelArr[i * 3 + 1] = (ny + ty * 0.25) * speed;
      burstVelArr[i * 3 + 2] = (nz + (rand() - 0.5) * 0.4) * speed;
    }

    // 初始位置 = textPos
    posArr.set(textPosArr);

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

    // 深空背景平面（NDC 全屏四边形，径向渐变）
    const bgGeo = new THREE.PlaneGeometry(2, 2);
    const bgMat = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: /* glsl */`
        varying vec2 vPos;
        void main() {
          vPos = position.xy;
          gl_Position = vec4(position.xy, 0.9999, 1.0);
        }
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

    // 粒子几何体（动态更新 position）
    const geometry = new THREE.BufferGeometry();
    const posAttr  = new THREE.BufferAttribute(posArr, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("position", posAttr);
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colorArr, 3));
    geometry.setAttribute("aSize",  new THREE.BufferAttribute(sizeArr,  1));

    // 粒子着色器：圆形柔光发光点，加法混合
    // 点大小 = PARTICLE_PX(世界系数) × aSize × 透视衰减(300/-z)；按 buffer 高度缩放保持物理像素一致
    const PARTICLE_PX = 0.08;
    const dpr0   = Math.min(devicePixelRatio, 2);
    const baseSz = (H0 * dpr0) / 220 * PARTICLE_PX;

    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        uSize:    { value: baseSz },
        uOpacity: { value: 0.0 },
      },
      vertexShader: /* glsl */`
        attribute vec3  aColor;
        attribute float aSize;
        uniform   float uSize;
        varying   vec3  vColor;
        void main() {
          vColor = aColor;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize * aSize * (300.0 / -mvPos.z);
          gl_Position  = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uOpacity;
        varying vec3  vColor;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vColor, a * uOpacity * 0.28);
        }
      `,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      depthTest:   false,
      transparent: true,
    });

    const points = new THREE.Points(geometry, particleMat);
    scene.add(points);

    // 后处理链：RenderPass → AfterimagePass → UnrealBloomPass → OutputPass
    const composer      = new EffectComposer(renderer);
    const renderPass    = new RenderPass(scene, camera);
    const afterimgPass  = new AfterimagePass(BASE_DAMP);
    const bloomPass     = new UnrealBloomPass(new THREE.Vector2(W0, H0), BASE_BLOOM, 0.6, 0.18);
    const outputPass    = new OutputPass();
    composer.addPass(renderPass);
    composer.addPass(afterimgPass);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    // 噪声场（漂移流场）
    const noise3D = createNoise3D(seed + 7);

    // ── RAF 状态 ─────────────────────────────────────────────────────────────
    let rafId          = 0;
    let disposed       = false;
    let t              = 0;
    let lastTime       = -1;
    let burstInited    = false;
    let bloomPulse     = 0;   // 超出 BASE_BLOOM 的额外量（衰减包络）

    function resetState() {
      t           = 0;
      lastTime    = -1;
      burstInited = false;
      bloomPulse  = 0;
      posArr.set(textPosArr);
      velArr.fill(0);
      particleMat.uniforms["uOpacity"].value = 0;
      bloomPass.strength = BASE_BLOOM;
      afterimgPass.damp  = BASE_DAMP;
      posAttr.needsUpdate = true;
      points.rotation.y  = 0;
    }

    function tick(now: number) {
      if (disposed) return;
      rafId = requestAnimationFrame(tick);

      if (lastTime < 0) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;
      t += dt;

      // ── 淡入包络（0→0.18s）─────────────────────────────────────────────
      if (t < 0.18) {
        particleMat.uniforms["uOpacity"].value = t / 0.18;
      }

      // ── Phase 1: Burst（t ≤ BURST_END）────────────────────────────────
      if (t < BURST_END) {
        if (!burstInited && t >= 0.18) {
          burstInited = true;
          velArr.set(burstVelArr);
        }
        if (burstInited) {
          for (let i = 0; i < N; i++) {
            const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
            velArr[ix] *= 0.90; velArr[iy] *= 0.90; velArr[iz] *= 0.90;
            posArr[ix] += velArr[ix] * dt;
            posArr[iy] += velArr[iy] * dt;
            posArr[iz] += velArr[iz] * dt;
          }
        }
        afterimgPass.damp  = BASE_DAMP;
        bloomPass.strength = BASE_BLOOM;

      // ── Phase 2: Chaos（BURST_END < t ≤ CHAOS_END）────────────────────
      } else if (t < CHAOS_END) {
        particleMat.uniforms["uOpacity"].value = 1.0;
        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          const px = posArr[ix], py = posArr[iy], pz = posArr[iz];
          const e  = 0.4;
          const tz = pz * NOISE_FREQ + t * NOISE_FLOW;
          // 近似 curl noise（有限差分方向梯度）
          const dnx = noise3D(px + e, py, tz) - noise3D(px - e, py, tz);
          const dny = noise3D(px, py + e, tz) - noise3D(px, py - e, tz);
          const dnz = noise3D(px, py, tz + e) - noise3D(px, py, tz - e);
          const nl  = Math.sqrt(dnx * dnx + dny * dny + dnz * dnz) || 1;
          // 噪声方向力 + 极弱向心力防飘散
          const ax = (dnx / nl) * NOISE_STR - px * 0.15;
          const ay = (dny / nl) * NOISE_STR - py * 0.15;
          const az = (dnz / nl) * NOISE_STR - pz * 0.15;
          velArr[ix] = (velArr[ix] + ax * dt) * 0.96;
          velArr[iy] = (velArr[iy] + ay * dt) * 0.96;
          velArr[iz] = (velArr[iz] + az * dt) * 0.96;
          posArr[ix] += velArr[ix] * dt;
          posArr[iy] += velArr[iy] * dt;
          posArr[iz] += velArr[iz] * dt;
        }
        afterimgPass.damp  = BASE_DAMP;
        bloomPass.strength = BASE_BLOOM;

      // ── Phase 3: Attraction（CHAOS_END < t ≤ ATTRACT_END）────────────
      } else if (t < ATTRACT_END) {
        particleMat.uniforms["uOpacity"].value = 1.0;
        const p      = ease(clamp((t - CHAOS_END) / (ATTRACT_END - CHAOS_END), 0, 1));
        const spring = lerp(1.5, 7.0, p);
        const noiseW = 1 - p;
        const damp   = lerp(0.96, 0.90, p);

        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          const px = posArr[ix], py = posArr[iy], pz = posArr[iz];
          const e  = 0.4;
          const tz = pz * NOISE_FREQ + t * NOISE_FLOW;
          const dnx = (noise3D(px + e, py, tz) - noise3D(px - e, py, tz)) * NOISE_STR;
          const dny = (noise3D(px, py + e, tz) - noise3D(px, py - e, tz)) * NOISE_STR;
          const dnz = (noise3D(px, py, tz + e) - noise3D(px, py, tz - e)) * NOISE_STR;
          const ax  = (spherePosArr[ix] - px) * spring + dnx * noiseW;
          const ay  = (spherePosArr[iy] - py) * spring + dny * noiseW;
          const az  = (spherePosArr[iz] - pz) * spring + dnz * noiseW;
          velArr[ix] = (velArr[ix] + ax * dt) * damp;
          velArr[iy] = (velArr[iy] + ay * dt) * damp;
          velArr[iz] = (velArr[iz] + az * dt) * damp;
          posArr[ix] += velArr[ix] * dt;
          posArr[iy] += velArr[iy] * dt;
          posArr[iz] += velArr[iz] * dt;
        }
        afterimgPass.damp  = lerp(BASE_DAMP, 0.70, p);
        bloomPass.strength = BASE_BLOOM;

      // ── Phase 4: Reassembly（ATTRACT_END < t ≤ REASSEMBLE_END）───────
      } else if (t < REASSEMBLE_END) {
        const p      = ease(clamp((t - ATTRACT_END) / (REASSEMBLE_END - ATTRACT_END), 0, 1));
        const lerpK  = 0.12 + 0.5 * p;
        const dampFk = lerp(0.90, 0.98, p);

        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          posArr[ix] = lerp(posArr[ix], spherePosArr[ix], lerpK);
          posArr[iy] = lerp(posArr[iy], spherePosArr[iy], lerpK);
          posArr[iz] = lerp(posArr[iz], spherePosArr[iz], lerpK);
          velArr[ix] *= dampFk;
          velArr[iy] *= dampFk;
          velArr[iz] *= dampFk;
        }

        // 成形脉冲：p≈0.9 时触发 bloom 短包络
        if (p > 0.88 && bloomPulse === 0) {
          bloomPulse = 0.8;
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
        afterimgPass.damp = lerp(0.70, 0.60, p);

      // ── Phase 5: Settle（t > REASSEMBLE_END）──────────────────────────
      } else {
        // 精确锁定 spherePos
        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          posArr[ix] = spherePosArr[ix];
          posArr[iy] = spherePosArr[iy];
          posArr[iz] = spherePosArr[iz];
        }
        // 极缓慢自转（data core 存在感）
        points.rotation.y += 0.05 * dt;
        // 呼吸透明度
        particleMat.uniforms["uOpacity"].value = 0.9 + Math.sin(t * 0.8) * 0.05;
        bloomPass.strength = BASE_BLOOM;
        afterimgPass.damp  = 0.60;
      }

      posAttr.needsUpdate = true;
      composer.render(dt);
    }

    // ResizeObserver：容器尺寸变化时更新渲染目标
    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      const w = (entry?.contentRect.width)  || 320;
      const h = (entry?.contentRect.height) || 220;
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const dpr = Math.min(devicePixelRatio, 2);
      particleMat.uniforms["uSize"].value = (h * dpr) / 220 * PARTICLE_PX;
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
        composer.dispose();
        // EffectComposer.dispose() 只释放自身 renderTarget + copyPass，不级联各 pass。
        // 显式释放 bloom/afterimage 的内部 renderTarget，防频繁切换剪贴板项时累积泄漏 → context lost。
        renderPass.dispose?.();
        afterimgPass.dispose?.();
        bloomPass.dispose?.();
        outputPass.dispose?.();
        renderer.dispose();
        canvas.remove();
      },
    };
  },
};
