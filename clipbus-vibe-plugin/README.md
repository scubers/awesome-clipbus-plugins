# Vibe

**Emotional fallback animation for Clipbus** — when no other plugin can render a copied text, Vibe turns it into a premium Three.js particle animation: chaos → order.

## How it works

### Fallback mechanism (broad-attach + yield)

Vibe's detector attaches to every non-empty text item. Its renderer then checks whether any *other* plugin has also produced an attachment for the same item. If so, Vibe yields (`shouldDisplay: false`) — deferring to the more specialised renderer. Only when no other plugin claims the item does Vibe display its animation card.

This makes Vibe a true last-resort fallback: it shows up exactly when nothing else does.

### Three switchable animations

Vibe ships with three animations. The bottom button cycles between them; the first is chosen at random on load.

#### Particle Core (`particle-core`) — 4.8 s

| Phase | Time | Description |
|---|---|---|
| Intro | 0 – 0.18s | Particles materialise at the text glyph positions (fade-in) |
| Burst | 0.18 – 0.35s | Compressed-energy release outward into 3-D space |
| Chaos | 0.35 – 1.6s | Simplex-noise flow field — organic, turbulent drift |
| Attraction | 1.6 – 3.1s | Spring force pulls particles toward a Fibonacci sphere |
| Reassembly | 3.1 – 4.1s | Particles converge precisely onto the sphere; bloom pulse fires |
| Settle | 4.1s+ | Fibonacci sphere rotates slowly; opacity breathes — calm endpoint |

Palette: cyan `#5CE1FF`, purple `#9A6BFF`, soft white `#EAF6FF`.

#### Text Reveal (`text-reveal`) — 4.6 s

| Phase | Time | Description |
|---|---|---|
| Text In | 0 – 0.6s | Particles settle into readable text glyphs (≥ 0.6 s legible) |
| Scan | 0.6 – 1.2s | A light band sweeps left-to-right, highlighting the glyphs |
| Deconstruct | 1.2 – 1.8s | Edge particles begin to drift; silhouette stays recognisable |
| Burst | 1.8 – 2.4s | Staggered release — particles explode outward from the text shape |
| Recall | 2.4 – 3.5s | Spring force draws particles toward a polyhedral core |
| Form / Settle | 3.5s+ | Particles lock onto an icosahedron; core rotates slowly |

Palette: cyan `#7EE7FF`, purple `#A78BFA`, soft white `#FFFFEF`. The reassembly target is an icosahedron (detail-4), giving a faceted "data crystal" look distinct from Particle Core's smooth sphere.

> **Text fit fix**: glyph positions are now computed with `computeGlyphFit`, scaling the text to ~46 % of the card height. On real small cards the text is now clearly readable instead of appearing as a tiny cluster.

#### Text Loop (`text-loop`) — 10 s seamless loop

| Phase | Time | Description |
|---|---|---|
| P1 Text Present | 0 – 1.0s | Text glyphs hold steady; opacity fades in then gently breathes |
| P2 Particlise | 1.0 – 2.0s | Staggered noise jitter breaks the glyph outlines (silhouette preserved) |
| P3 Burst | 2.0 – 3.0s | Particles scatter from text toward their cloud positions |
| P4 Drift Cloud | 3.0 – 5.0s | Noise-driven energy cloud; drift amplitude is zero at both ends (seamless join) |
| P5 Recall | 5.0 – 6.5s | Swirling vortex draws particles onto a Fibonacci sphere; swirl fades out on arrival |
| P6 Stable Sphere | 6.5 – 8.0s | Sphere pulses gently; no accumulated rotation (loop-safe) |
| P7 Deconstruct | 8.0 – 9.0s | Sphere dissolves back to cloud positions |
| P8 Reassemble | 9.0 – 10.0s | Particles flow along the original burst paths in reverse, reforming exact text glyphs — loop restarts |

Seamless guarantee: P8 ends with every particle at `textPos` (= P1 start); P4 drift envelope `sin(π·lp)` is zero at both ends; P5 swirl `θ = swirl·(1−lp)·3` is zero at `lp=1`; afterimage damp is constant throughout to prevent a seam flash.

Palette: cyan `#7EE7FF`, purple `#A78BFA`, white `#FFFFFF`.

### Animation switch button

The bottom button shows the name of the currently playing animation (`Particle Core`, `Text Reveal`, or `Text Loop`). Click to switch to the next one. The first animation is chosen at random when the card loads.

### Adding more animations

The registry (`src/features/vibe-fallback/animations/index.ts`) accepts any object implementing `VibeAnimation`. Append it to the array — the switch button cycles through all registered animations automatically.

## Notes

- **Cross-plugin yielding** requires a real Clipbus environment to test — the dev preview only runs this plugin and always shows the Vibe card.
- The card background is intentionally dark (deep-space radial gradient). This is a deliberate design choice for the animation, not a theming error.
- Attachment sync scope is `local_only` — Vibe attachments are not synced across devices.
