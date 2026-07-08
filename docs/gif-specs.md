# GIF Specs

Recording spec for the three demo GIFs referenced from the [Plugins table](../README.md#plugins) in the root README. Recording itself is done by a human; this file only pins down script, timing, and export settings so the three clips read as one consistent series.

## Shared setup

**Resolution & frame rate**

| Parameter | Value |
|---|---|
| Capture resolution | 1280×800 or 1440×900 (on a Retina display, capture at 2x and export at 1x) |
| Capture frame rate | 60fps (keeps keyboard/UI motion smooth) |
| GIF export frame rate | 15fps (balances file size and smoothness) |
| Video export, if also kept as .mp4 | H.264 |

**Recommended tools**

| Tool | Purpose | Price |
|---|---|---|
| [Kap](https://getkap.co) | Screen recording, direct GIF or .mp4 export | Free, open source |
| [ScreenStudio](https://screenstudio.lemonsqueezy.com) | Screen recording with built-in keystroke overlay | Free tier available |
| [Gifski](https://gif.ski) | High-quality .mp4 → GIF conversion (better than Kap's built-in GIF export) | Free, open source |

Suggested combo: record with ScreenStudio (keystroke overlay baked in) → export .mp4 → convert with Gifski. Simplest combo: record and export straight from Kap.

**Before recording**

- [ ] Desktop is clean (no visible files; hide desktop icons or use Stacks)
- [ ] Menu bar has no unrelated icons visible
- [ ] Do Not Disturb is on (no notification banners)
- [ ] Only the app(s) needed for the scene are open
- [ ] Clipbus is running with the target plugin installed and enabled, history has no unrelated sensitive entries visible
- [ ] Any terminal/editor window used to stage the copy content is cleared of unrelated text

**Output**

Save each GIF into `docs/gifs/` using the exact filename listed per clip below — the corresponding table row in `README.md` / `README_zh.md` links to that path.

## Shared script shape

All three clips follow the same three-beat structure so the series reads as one system:

1. **Copy** — the demo content is copied (⌘C or equivalent).
2. **Detector fires** — Clipbus recognizes the copied content (the history entry appears with its attachment indicator).
3. **Card renders** — the plugin's inline preview card appears, fully rendered.

Total length: **10–15 seconds** per clip. No narration — keystroke overlay only (see tools above).

## 1. Decoder — JWT decode

- **Plugin**: `clipbus-decoder-plugin`
- **Output path**: `docs/gifs/decoder.gif`
- **Content to copy**: a sample JWT (three base64url segments separated by `.`). Use a throwaway/example token — never a real credential.
- **Beats**:
  1. `0–2s` — A terminal or text editor shows the JWT string; select it and copy (⌘C).
  2. `2–4s` — Switch to Clipbus, summon history (⌘⇧V); the new entry appears with the decoder attachment indicator.
  3. `4–13s` — Open the entry; the decoder card renders header + payload fields and expiry status. Show a one-click copy on a decoded field.
  4. `13–15s` — Hold on the fully rendered card.

## 2. Preview — color swatch

- **Plugin**: `clipbus-preview-plugin`
- **Output path**: `docs/gifs/preview.gif`
- **Content to copy**: a HEX color string (e.g. `#4F46E5`). A CSS gradient string (e.g. `linear-gradient(...)`) is an equally valid input to the same plugin if this clip is re-recorded later — pick one per clip, not both.
- **Beats**:
  1. `0–2s` — A terminal or text editor shows the color string; select it and copy (⌘C).
  2. `2–4s` — Switch to Clipbus, summon history; the new entry appears.
  3. `4–13s` — The color card renders: swatch fill, HEX/RGB/HSL values, WCAG contrast readout.
  4. `13–15s` — Hold on the rendered card.

## 3. Vibe — particle fallback

- **Plugin**: `clipbus-vibe-plugin`
- **Output path**: `docs/gifs/vibe.gif`
- **Content to copy**: a short plain-text sentence with no structured match — no URL, JSON, color, timestamp, etc. The point of this clip is that no other plugin claims the content, so Vibe's fallback takes over.
- **Beats**:
  1. `0–2s` — Select the plain text and copy (⌘C).
  2. `2–4s` — Switch to Clipbus, summon history; the new entry appears.
  3. `4–13s` — Vibe's Three.js particle animation plays (any of the plugin's configured animations is acceptable; Particle Core — glyphs burst, drift, reform — is the default and the simplest to read at 15fps).
  4. `13–15s` — Hold on the settled or looping state.

## Consistency checklist (before exporting)

- [ ] Same window chrome / appearance (all light or all dark, not mixed) across all three clips
- [ ] Same capture resolution across all three
- [ ] Keystroke overlay style matches across all three
- [ ] Each clip is 10–15s, starts on the copy action, ends on the fully rendered card
- [ ] File saved to the exact output path listed above so the README links resolve
