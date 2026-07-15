# Clipbus Plugin Collection

English | [中文](./README_zh.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**The official plugin collection for Clipbus — the programmable clipboard for macOS.** A growing collection of ready-to-install plugins, plus the tools to write your own.

[clipbus.com](https://clipbus.com) · [Plugin docs](https://clipbus.com/plugin-doc)

## Install into Clipbus

The primary way to use these plugins is installing straight from this repository — no clone, no local build required.

1. Open Clipbus and go to **Settings → Plugins → Install → Git Repository**. This opens the **"Install From Git Repository"** panel.
2. Fill in the form:

   | Field | Value |
   |---|---|
   | Repository URL | `https://github.com/scubers/awesome-clipbus-plugins` |
   | Subdirectory | the plugin's directory name, e.g. `clipbus-decoder-plugin` — see the **Subdirectory** column in the [Plugins table](#plugins) below |
   | Ref | leave blank to track `main`, or pin a branch/tag/commit |

3. Click **Install**.

Clipbus's free tier includes 3 slots per capability type (detector / renderer / action) — Pro lifts the limits and adds Cloud Sync.

## Create plugins with AI

1. Clone this repository.
2. Open [Claude Code](https://claude.ai/code) inside it.
3. Describe the plugin you want.

This repository ships a `clipbus-plugin-generator` Claude Code skill (under `.claude/skills/`). It surveys the existing plugins first and, based on their real responsibilities, either extends the best-matching plugin or scaffolds a new one — instead of creating a near-duplicate.

## Plugins

Each plugin below lives in its own top-level directory and is fully self-contained (own `npm install`, own build) — there is no root `package.json` or shared build orchestration. The **Subdirectory** column can be pasted directly into the install form above.

| Plugin | Subdirectory | Description | Demo |
|--------|--------------|-------------|------|
| [clipbus-decoder-plugin](./clipbus-decoder-plugin/README.md) | `clipbus-decoder-plugin` | Encode/decode toolkit: detect & decode readable UTF-8 Base64 while rejecting binary or garbled output, parse JWT (header/payload + expiry status), inspect a `data:` URI (media type / encoding / decoded size + text preview), plus a multi-codec draft (URL / HTML / Base64 / Unicode / JSON, both directions). | [GIF](./docs/gifs/decoder.gif) |
| [clipbus-formatter-plugin](./clipbus-formatter-plugin/README.md) | `clipbus-formatter-plugin` | Pretty-printer: detect JSON / XML / SQL and re-indent (or uppercase keywords) — including a one-click toggle to view & copy JSON as pretty, minified, or YAML, render CSV/TSV as a table with a CSV→JSON export, and parse a URL query string into a key/value table — formatted preview with one-click copy. | — |
| [clipbus-converter-plugin](./clipbus-converter-plugin/README.md) | `clipbus-converter-plugin` | Conversion toolkit: Unix timestamp ↔ date (local / ISO / UTC / relative) with a 9-zone world clock, integer radix table (dec/hex/oct/bin + ASCII), ISO 8601 duration breakdown (human components + total seconds), temperature across Celsius / Fahrenheit / Kelvin, data-size conversion (SI vs IEC: KB/MB/GB and KiB/MiB/GiB + exact bytes), Unix file-permission decoding (symbolic rwxr-xr-x → octal 755 + per-class breakdown), and a naming-case draft (camel/snake/kebab… 8 styles). | — |
| [clipbus-extractor-plugin](./clipbus-extractor-plugin/README.md) | `clipbus-extractor-plugin` | Extract & parse: pull de-duplicated URLs / Emails / IPv4 from text, break a single URL into scheme / host / path / query and strip tracking parameters (utm_*, fbclid, gclid…) into a clean copy-ready URL, a single IP / CIDR into version / scope / network range, a lat/lng pair into DMS + map links, or a MAC address into OUI / NIC + unicast/multicast & universal/local bits, or a UUID into version / variant / embedded timestamp, plus a regex-tester draft. | — |
| [clipbus-inspector-plugin](./clipbus-inspector-plugin/README.md) | `clipbus-inspector-plugin` | Inspection toolkit: character / word / line / byte stats + MD5 / SHA-1 / SHA-256 hashes; unified-diff viewer (stats bar + per-line coloring); image details (format / dimensions / aspect ratio / megapixels / size) for copied images; and a Unicode character inspector (code point / UTF-8 / UTF-16 / HTML entity / category) for a single glyph or emoji; plus a secret scanner that flags pasted API keys / tokens / private keys (AWS / GitHub / Google / Slack / Stripe / OpenAI / PEM…) with a masked warning so credentials aren't leaked into chat or commits. | — |
| [clipbus-preview-plugin](./clipbus-preview-plugin/README.md) | `clipbus-preview-plugin` | Visual preview: detect color values (HEX / RGB / HSL + CSS names) into a swatch with WCAG contrast, render a CSS gradient (linear / radial / conic) into a live swatch, render Markdown into a safe HTML preview card, and turn a copied URL into a scannable QR code. | [GIF](./docs/gifs/preview.gif) |
| [clipbus-text-plugin](./clipbus-text-plugin/README.md) | `clipbus-text-plugin` | Line-processing toolkit: sort lines / dedupe lines / tidy whitespace / strip ANSI escape codes — four one-click auto-run actions. | — |
| [clipbus-generator-plugin](./clipbus-generator-plugin/README.md) | `clipbus-generator-plugin` | Generate a UUID v4, a sortable ULID, or a strong random password (configurable length / case / digits / symbols / count) via Web Crypto, plus Lorem Ipsum placeholder text (paragraphs / sentences / words); live-preview and copy from a draft form. | — |
| [clipbus-cron-plugin](./clipbus-cron-plugin/README.md) | `clipbus-cron-plugin` | Detect 5-field cron expressions: a per-field explanation table, a one-sentence summary, and the next 5 fire times (live, local time), guarded to avoid misfiring on ordinary number rows. | — |
| [clipbus-vibe-plugin](./clipbus-vibe-plugin/README.md) | `clipbus-vibe-plugin` | Emotional fallback for plain text with no structured match: three switchable Three.js particle animations — ① Particle Core: glyphs burst → noise drift → glowing Fibonacci sphere; ② Text Reveal: readable text (≥ 0.6 s, glyph-fit scaled) → light scan → edge disintegration → burst → polyhedral data crystal; ③ Text Loop: seamless 8-phase cycle — text → scatter → burst → drift cloud → sphere recall → stable sphere → deconstruct → text reassembly. A native button bar switches between them; which animations appear and their order are configurable via the `plugin.vibe.animations` setting (defaults to all three). | [GIF](./docs/gifs/vibe.gif) |
| [clipbus-toolbox-plugin](./clipbus-toolbox-plugin/README.md) | `clipbus-toolbox-plugin` | Aggregate toolbox: detect & decode a copied string (JWT / escaped JSON / URL / Unix timestamp / date / Base64) into an inline preview card with one-click copy & expand; six one-click case-convert auto-run actions (UPPER / lower / camelCase / PascalCase / snake_case / kebab-case); and an image crop & compress draft action. | — |

`template-plugin/` is the official scaffold and full-capability reference — it is meant to be **copied**, not installed. It is not a product plugin, so it is not listed in the table above. New plugins created with the AI workflow above start life as a copy of it.

## Community plugins

Building a Clipbus plugin outside this collection? List it here.

_No community plugins yet — be the first._

| Plugin | Description | Repository | Install Subdirectory |
|--------|-------------|------------|-----------------------|
| _(your plugin)_ | _one-line description_ | `https://github.com/<you>/<repo>` | leave blank unless your repo hosts multiple plugins |

To add a row, open a PR — see **Contributing** below.

## Contributing

There are two ways to contribute:

1. **PR into this repository** to join the official collection. Your plugin directory must pass its own build and test gate — `npm install && npm run verify` (build + test) inside that directory. See [CLAUDE.md](./CLAUDE.md) for the plugin architecture, the four extension points (detector / renderer / action / messageHandlers), the cross-file wiring invariants, and the new-plugin workflow.
2. **Maintain your own repository** and submit a PR adding a row to the [Community plugins](#community-plugins) table above. Only the link and description are reviewed — not the code.
