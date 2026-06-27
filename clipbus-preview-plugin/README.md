# Preview

Clipbus plugin that detects color values and Markdown text on the clipboard, rendering a rich color swatch with WCAG contrast analysis or a sanitised HTML preview card.

## Features

### Color Swatch (`color-*`)

Detects a single CSS color value in clipboard text and renders a rich preview card.

- **Detector** (`color-detector`): attachment type `plugin.preview.color`. Supports:
  - **Hex**: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa` (short forms expanded; alpha channel preserved)
  - **RGB / RGBA**: `rgb(r, g, b)` and `rgba(r, g, b, a)` with channel clamping
  - **HSL / HSLA**: `hsl(h, s%, l%)` and `hsla(h, s%, l%, a)` converted to RGB
  - **28 CSS named colors**: `red`, `blue`, `orange`, `coral`, `tomato`, `salmon`, and more (case-insensitive)
- **Renderer** (`color-swatch`): Fixed height of 260px. Displays:
  - A 120px swatch block filled with the detected color; the hex label is rendered in whichever of white or black achieves higher WCAG contrast
  - HEX, RGB, and HSL values in monospace type
  - Contrast ratios vs. white and black with WCAG level badges (AA if >= 4.5:1, AAA if >= 7:1)
  - "Copy All Formats" host button that copies all three format strings to the clipboard

### Markdown Preview (`markdown-*`)

Detects Markdown text on the clipboard and renders it as a sanitised HTML card.

- **Detector** (`markdown-detector`): attachment type `plugin.preview.markdown`. Recognises common Markdown patterns (headings, lists, code blocks, bold/italic, links).
- **Renderer** (`markdown-renderer`): Renders parsed Markdown to safe HTML using a whitelist sanitiser. Height adapts from 120px to 480px to fit the content.

## Development

```sh
npm install
npm run dev       # Vite preview workbench
npm run verify    # typecheck + lint + build + tests
```

To load in Clipbus: Settings → Plugins → Developer Plugins → Add Path, select this directory.
