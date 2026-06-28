/**
 * textLoop — Three.js 8-phase seamless-loop particle animation
 * Narrative: text → particle scatter → burst → drift cloud → sphere recall →
 *            stable sphere → deconstruct → text re-assembly → (loop)
 * Key design: purely procedural keyframe interpolation, no velocity physics —
 * so `t = elapsed % LOOP` gives a perfect seamless loop.
 */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";
import type { VibeAnimation, VibeAnimationContext, VibeAnimationInstance } from "./types";
import { sampleText } from "./textSampler";
import { computeGlyphFit } from "./glyphFit";
import { createNoise3D } from "./noise";

// ── Time axis (seconds) ───────────────────────────────────────────────────────
const P1_END  = 1.0;
const P2_END  = 2.0;
const P3_END  = 3.0;
const P4_END  = 5.0;
const P5_END  = 6.5;
const HOLD    = 1.5;   // P6 hold duration (configurable 1–2)
const P6_END  = P5_END + HOLD;   // 8.0
const P7_END  = P6_END + 1.0;    // 9.0
const P8_END  = P7_END + 1.0;    // 10.0
const LOOP    = P8_END;           // 10.0

// ── Anti-overexposure params (reuse textReveal values) ───────────────────────
const BASE_BLOOM  = 0.4;
const BASE_THRESH = 0.18;
const AFTERIMG_DAMP = 0.6;   // constant throughout — avoids loop-seam jump

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Main export ───────────────────────────────────────────────────────────────

export const textLoop: VibeAnimation = {
  id: "text-loop",
  label: "Text Loop",

  create(ctx: VibeAnimationContext): VibeAnimationInstance {
    const { container, text } = ctx;

    // WebGL fallback
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

    // ── Per-particle precomputation (invariants) ──────────────────────────────
    const raw  = sampleText(text, 4200, 2);
    const N    = clamp(raw.length > 0 ? raw.length : 1600, 800, 4200);
    const seed = ((text.charCodeAt(0) || 42) * 7919 + N) >>> 0;
    const rand = makeLCG(seed);

    const W0 = container.clientWidth  || 320;
    const H0 = container.clientHeight || 220;

    // textPos: glyph positions, fit to viewport
    const textPosArr  = new Float32Array(N * 3);
    if (raw.length > 0) {
      const fit = computeGlyphFit(raw, W0 / H0);
      for (let i = 0; i < N; i++) {
        const src = raw[i < raw.length ? i : Math.floor(rand() * raw.length)];
        textPosArr[i * 3]     = (src.x - fit.cx) * fit.scale;
        textPosArr[i * 3 + 1] = (src.y - fit.cy) * fit.scale;
        textPosArr[i * 3 + 2] = (rand() - 0.5) * 0.03;
      }
    } else {
      // fallback: flat random cloud
      for (let i = 0; i < N; i++) {
        textPosArr[i * 3]     = (rand() - 0.5) * 2.8;
        textPosArr[i * 3 + 1] = (rand() - 0.5) * 0.8;
        textPosArr[i * 3 + 2] = (rand() - 0.5) * 0.06;
      }
    }

    // cloudPos: burst/drift/reassembly target — built from textPos direction so
    // both P3 (scatter) and P8 (reassembly) travel the same path (P8 = reverse P3).
    const cloudPosArr = new Float32Array(N * 3);
    {
      const r2 = makeLCG(seed + 3);
      for (let i = 0; i < N; i++) {
        const tx = textPosArr[i * 3], ty = textPosArr[i * 3 + 1], tz = textPosArr[i * 3 + 2];
        const tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
        // dir = normalize(textPos) + small random perturbation
        const dx = tx / tl + (r2() - 0.5) * 0.4;
        const dy = ty / tl + (r2() - 0.5) * 0.4;
        const dz = tz / tl + (r2() - 0.5) * 0.4;
        const dl = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const dist = 1.6 + r2() * 1.2;
        cloudPosArr[i * 3]     = tx + (dx / dl) * dist;
        cloudPosArr[i * 3 + 1] = ty + (dy / dl) * dist;
        cloudPosArr[i * 3 + 2] = tz + (dz / dl) * dist;
      }
    }

    // spherePos: Fibonacci sphere (R=1.0), recall/hold target
    const spherePosArr = new Float32Array(N * 3);
    {
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) {
        const y    = 1 - (i / (N - 1)) * 2;
        const r    = Math.sqrt(Math.max(0, 1 - y * y));
        const phi  = i * goldenAngle;
        spherePosArr[i * 3]     = Math.cos(phi) * r;
        spherePosArr[i * 3 + 1] = y;
        spherePosArr[i * 3 + 2] = Math.sin(phi) * r;
      }
    }

    // per-particle invariants: color, size, seed, swirl
    const colorArr = new Float32Array(N * 3);
    const sizeArr  = new Float32Array(N);
    const seedArr  = new Float32Array(N);   // 0..1, for P2 stagger
    const swirlArr = new Float32Array(N);   // signed, for P5 swirl phase

    {
      const r3 = makeLCG(seed + 7);
      for (let i = 0; i < N; i++) {
        const tx  = textPosArr[i * 3], ty = textPosArr[i * 3 + 1];
        const dist = Math.sqrt(tx * tx + ty * ty);
        const p   = clamp(dist / 1.2, 0, 1);   // 0=centre(white), 1=edge(cyan/purple)
        const cp  = r3();
        // cyan #7EE7FF=(0.494,0.906,1.0) / purple #A78BFA=(0.655,0.545,0.980)
        colorArr[i * 3]     = lerp(lerp(0.494, 0.655, cp), 1.000, 1 - p);
        colorArr[i * 3 + 1] = lerp(lerp(0.906, 0.545, cp), 1.000, 1 - p);
        colorArr[i * 3 + 2] = lerp(lerp(1.000, 0.980, cp), 1.000, 1 - p);
        sizeArr[i]  = 0.5 + r3() * 1.0;
        seedArr[i]  = r3();
        swirlArr[i] = (r3() - 0.5);            // per-particle swirl phase ∈ (-.5, .5)
      }
    }

    // ── Three.js scene ────────────────────────────────────────────────────────
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

    // deep-space background
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

    // particle geometry
    const posArr  = new Float32Array(N * 3);
    const geometry = new THREE.BufferGeometry();
    const posAttr  = new THREE.BufferAttribute(posArr, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("position", posAttr);
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colorArr, 3));
    geometry.setAttribute("aSize",  new THREE.BufferAttribute(sizeArr,  1));

    // particle shader — glowing circles, anti-overexposure (size coeff 21, base alpha 0.26)
    const dpr0   = Math.min(devicePixelRatio, 2);
    const baseSz = (H0 * dpr0) / 220 * 0.5;

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
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize * aSize * (21.0 / -mv.z);
          gl_Position  = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uOpacity;
        varying vec3  vColor;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vColor, a * uOpacity * 0.26);
        }
      `,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      depthTest:   false,
      transparent: true,
    });

    const points = new THREE.Points(geometry, particleMat);
    scene.add(points);

    // post-processing
    const composer     = new EffectComposer(renderer);
    const renderPass   = new RenderPass(scene, camera);
    const afterimgPass = new AfterimagePass(AFTERIMG_DAMP);
    const bloomPass    = new UnrealBloomPass(new THREE.Vector2(W0, H0), BASE_BLOOM, 0.6, BASE_THRESH);
    const outputPass   = new OutputPass();
    composer.addPass(renderPass);
    composer.addPass(afterimgPass);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    // noise field (for P2/P3/P4 perturbation)
    const noise3D = createNoise3D(seed + 13);

    // ── RAF state ─────────────────────────────────────────────────────────────
    let rafId    = 0;
    let disposed = false;
    let elapsed  = 0;
    let lastTime = -1;

    function resetState() {
      elapsed  = 0;
      lastTime = -1;
      // start at P1: all particles at textPos
      for (let i = 0; i < N; i++) {
        posArr[i * 3]     = textPosArr[i * 3];
        posArr[i * 3 + 1] = textPosArr[i * 3 + 1];
        posArr[i * 3 + 2] = textPosArr[i * 3 + 2];
      }
      particleMat.uniforms["uOpacity"].value = 0;
      bloomPass.strength  = BASE_BLOOM;
      bloomPass.threshold = BASE_THRESH;
      afterimgPass.damp   = AFTERIMG_DAMP;
      posAttr.needsUpdate = true;
    }

    function tick(now: number) {
      if (disposed) return;
      rafId = requestAnimationFrame(tick);

      if (lastTime < 0) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime  = now;
      elapsed  += dt;

      // modular time — the heart of seamless looping
      const t  = elapsed % LOOP;

      // ── P1: Text Present (0..1.0) ─────────────────────────────────────────
      if (t < P1_END) {
        // gentle breath only — NO per-loop fade (would jump uOpacity 1→0 at the
        // loop seam). First-entry softness is handled by globalFade below.
        particleMat.uniforms["uOpacity"].value = 1.0 + Math.sin(t * 6) * 0.03;
        for (let i = 0; i < N; i++) {
          posArr[i * 3]     = textPosArr[i * 3];
          posArr[i * 3 + 1] = textPosArr[i * 3 + 1];
          posArr[i * 3 + 2] = textPosArr[i * 3 + 2];
        }

      // ── P2: Particlise (1.0..2.0) ─────────────────────────────────────────
      } else if (t < P2_END) {
        const lp = (t - P1_END) / (P2_END - P1_END);
        particleMat.uniforms["uOpacity"].value = 1.0;
        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          const tx = textPosArr[ix], ty = textPosArr[iy], tz = textPosArr[iz];
          // stagger: high-seed particles jitter later and less
          const delay  = seedArr[i] * 0.5;
          const jitter = Math.max(0, lp - delay / 1.0) * 0.06;
          const nx = noise3D(tx * 1.5, ty * 1.5, t * 0.8);
          const ny = noise3D(tx * 1.5 + 5.1, ty * 1.5, t * 0.8);
          const nz = noise3D(tx * 1.5, ty * 1.5 + 3.3, t * 0.8);
          posArr[ix] = tx + nx * jitter;
          posArr[iy] = ty + ny * jitter;
          posArr[iz] = tz + nz * jitter;
        }

      // ── P3: Burst (2.0..3.0) ──────────────────────────────────────────────
      } else if (t < P3_END) {
        const lp = (t - P2_END) / (P3_END - P2_END);
        const e3 = ease(lp);
        particleMat.uniforms["uOpacity"].value = 1.0;
        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          const tx = textPosArr[ix], ty = textPosArr[iy], tz = textPosArr[iz];
          const cx = cloudPosArr[ix], cy = cloudPosArr[iy], cz = cloudPosArr[iz];
          // noise micro-perturbation on the trajectory
          const np = noise3D(tx * 0.8 + t * 0.3, ty * 0.8, tz * 0.4) * 0.08 * lp;
          posArr[ix] = lerp(tx, cx, e3) + np;
          posArr[iy] = lerp(ty, cy, e3) + np;
          posArr[iz] = lerp(tz, cz, e3) + np;
        }

      // ── P4: Drift Cloud (3.0..5.0) ────────────────────────────────────────
      // env = sin(π*lp): zero at both ends → seamless join with P3 and P5
      } else if (t < P4_END) {
        const lp  = (t - P3_END) / (P4_END - P3_END);
        const env = Math.sin(Math.PI * lp);        // 0→1→0
        particleMat.uniforms["uOpacity"].value = 1.0;
        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          const cx = cloudPosArr[ix], cy = cloudPosArr[iy], cz = cloudPosArr[iz];
          const nx = noise3D(cx * 0.6 + t * 0.3, cy * 0.6, cz * 0.4) * 0.5 * env;
          const ny = noise3D(cx * 0.6, cy * 0.6 + t * 0.3 + 4.7, cz * 0.4) * 0.5 * env;
          const nz = noise3D(cx * 0.6 + 2.1, cy * 0.6, cz * 0.4 + t * 0.3) * 0.5 * env;
          posArr[ix] = cx + nx;
          posArr[iy] = cy + ny;
          posArr[iz] = cz + nz;
        }

      // ── P5: Recall to Sphere (5.0..6.5) ───────────────────────────────────
      // swirl: θ = swirl*(1-lp)*3.0 — lp→1 means θ→0, seamlessly joins P6
      } else if (t < P5_END) {
        const lp = (t - P4_END) / (P5_END - P4_END);
        const e5 = ease(lp);
        particleMat.uniforms["uOpacity"].value = 1.0;
        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          const cx = cloudPosArr[ix], cy = cloudPosArr[iy], cz = cloudPosArr[iz];
          const sx = spherePosArr[ix], sy = spherePosArr[iy], sz = spherePosArr[iz];
          const bx = lerp(cx, sx, e5);
          const by = lerp(cy, sy, e5);
          const bz = lerp(cz, sz, e5);
          // swirl around z-axis; sin(π·lp) envelope → zero at BOTH ends, so the
          // recall joins P4 (lp=0, no swirl) and P6 (lp=1, on sphere) seamlessly.
          const theta = swirlArr[i] * Math.sin(Math.PI * lp) * 3.0;
          const cosT  = Math.cos(theta), sinT = Math.sin(theta);
          posArr[ix] = bx * cosT - by * sinT;
          posArr[iy] = bx * sinT + by * cosT;
          posArr[iz] = bz;
        }

      // ── P6: Stable Sphere (6.5..8.0) ──────────────────────────────────────
      // pulse breath via sin — no accumulated rotation (loop-safe)
      } else if (t < P6_END) {
        // hp = progress within hold; sin(π·hp) is 0 at both ends → opacity & pulse
        // return to 1.0 at P5→P6 and P6→P7 seams (no jump).
        const hp = (t - P5_END) / HOLD;
        particleMat.uniforms["uOpacity"].value = 1.0 - Math.sin(Math.PI * hp) * 0.05;
        const pulse = 1 + Math.sin(Math.PI * hp) * 0.02;
        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          posArr[ix] = spherePosArr[ix] * pulse;
          posArr[iy] = spherePosArr[iy] * pulse;
          posArr[iz] = spherePosArr[iz] * pulse;
        }

      // ── P7: Deconstruct (8.0..9.0) ────────────────────────────────────────
      } else if (t < P7_END) {
        const lp = (t - P6_END) / (P7_END - P6_END);
        const e7 = ease(lp);
        particleMat.uniforms["uOpacity"].value = 1.0;
        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          const sx = spherePosArr[ix], sy = spherePosArr[iy], sz = spherePosArr[iz];
          const cx = cloudPosArr[ix],  cy = cloudPosArr[iy],  cz = cloudPosArr[iz];
          posArr[ix] = lerp(sx, cx, e7);
          posArr[iy] = lerp(sy, cy, e7);
          posArr[iz] = lerp(sz, cz, e7);
        }

      // ── P8: Reassemble Text (9.0..10.0) ───────────────────────────────────
      // cloudPos → textPos: exact reverse of P3, so lp=1 → pos=textPos = P1 start → seamless
      } else {
        const lp = clamp((t - P7_END) / (P8_END - P7_END), 0, 1);
        const e8 = ease(lp);
        particleMat.uniforms["uOpacity"].value = 1.0;
        for (let i = 0; i < N; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          const cx = cloudPosArr[ix],  cy = cloudPosArr[iy],  cz = cloudPosArr[iz];
          const tx = textPosArr[ix],   ty = textPosArr[iy],   tz = textPosArr[iz];
          posArr[ix] = lerp(cx, tx, e8);
          posArr[iy] = lerp(cy, ty, e8);
          posArr[iz] = lerp(cz, tz, e8);
        }
      }

      // one-shot first-entry fade (elapsed-based, not loop-t) — keeps the loop
      // seam continuous while softening the very first appearance.
      particleMat.uniforms["uOpacity"].value *= clamp(elapsed / 0.6, 0, 1);
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
        // explicit per-pass dispose (EffectComposer.dispose() does not cascade)
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
