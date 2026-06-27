# Color Inspector Plugin

A Clipbus plugin that detects color values in clipboard text and provides a rich color swatch with format conversion and WCAG contrast analysis.

## Features

### Detector: `color-detector`

Scans clipboard text for a single CSS color value. Supports:

- **Hex**: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa` (short forms expanded; alpha channel preserved)
- **RGB / RGBA**: `rgb(r, g, b)` and `rgba(r, g, b, a)` with channel clamping
- **HSL / HSLA**: `hsl(h, s%, l%)` and `hsla(h, s%, l%, a)` converted to RGB
- **28 CSS named colors**: `red`, `blue`, `orange`, `coral`, `tomato`, `salmon`, and more (case-insensitive)

When the entire clipboard content (trimmed) is recognized as a color, the detector produces a `plugin.color.swatch` attachment.

### Renderer: `color-swatch`

Displays a rich color card at a fixed height of 260px:

- **Swatch block**: A 120px tall rounded block filled with the detected color. The hex label is rendered in whichever of white or black achieves higher WCAG contrast against the swatch.
- **Facts grid**: HEX, RGB, and HSL representations in monospace type.
- **Contrast row**: Contrast ratios vs. white and black with WCAG level badges (AA if >= 4.5:1, AAA if >= 7:1).
- **Host button**: "Copy All Formats" copies all three format strings (HEX, RGB, HSL) to the clipboard.

## Getting started

```sh
cd clipbus-color-plugin
npm install
npm run verify
```

To load in Clipbus: Settings → Plugins → Developer Plugins → Add Path, select this directory.
