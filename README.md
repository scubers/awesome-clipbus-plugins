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

## Build and maintain plugins with AI

To create or upgrade a plugin in your own project, install the relevant skill's
`SKILL.md` and `references/` in your AI coding agent, open your target folder,
and describe the task. Each skill can be distributed and used independently.
Node.js, npm, Git, and access to the upstream template and npm registry are required.
The agent reads the current official template and the installed SDK documentation,
adapts the implementation to the project, and runs the project's own validation.
Cloning this collection or keeping a local template is unnecessary.

To contribute changes to this collection, clone the repository and open it with
your preferred AI coding agent.

The repository includes identical skill files in `.agents/skills/`, `.codex/skills/`,
and `.claude/skills/`. They work directly after cloning on Windows and macOS.
Keep all three copies updated together; CI checks that their contents match.

Two skills under `.agents/skills/` provide purpose-built workflows:

- **Create — [`clipbus-plugin-generator`](./.agents/skills/clipbus-plugin-generator/):** An instruction-based workflow for empty folders, standalone plugins, and collections. The agent consults the official template and installed SDK documentation, implements the feature, and runs the project's own checks. Existing plugin responsibilities guide reuse when relevant.
- **Sync — [`clipbus-template-sync`](./.agents/skills/clipbus-template-sync/):** Upgrades standalone plugins or a selected collection by comparing their actual implementation with the official template and SDK documentation, adapting relevant changes, and running each project's own checks.

Both skills contain instructions and references, with no bundled scaffold,
build assets, or fixed plugin-structure validators. They do not require one another.

## Plugins

Each plugin below lives in its own top-level directory and is fully self-contained (own `npm install`, own build) — there is no root `package.json` or shared build orchestration. The **Subdirectory** column can be pasted directly into the install form above.

| Plugin | Subdirectory | Description | Demo |
|--------|--------------|-------------|------|
| [clipbus-decoder-plugin](./clipbus-decoder-plugin/README.md) | `clipbus-decoder-plugin` | Detect readable UTF-8 Base64, JWT, and `data:` URIs, plus 10 independent auto-run URL / HTML / Base64 / Unicode / JSON encode/decode actions designed for host-side cascades. | [GIF](./docs/gifs/decoder.gif) |
| [clipbus-formatter-plugin](./clipbus-formatter-plugin/README.md) | `clipbus-formatter-plugin` | Detect and format JSON / XML, including pretty/minified/YAML JSON views, and render CSV/TSV as a table with JSON export. | — |
| [clipbus-converter-plugin](./clipbus-converter-plugin/README.md) | `clipbus-converter-plugin` | Numeric, time, unit, and permission conversions, plus 10 independent auto-run naming-case actions that can be cascaded by the host. | — |
| [clipbus-extractor-plugin](./clipbus-extractor-plugin/README.md) | `clipbus-extractor-plugin` | Extract and parse URLs, naked query strings, entities, IP/CIDR, coordinates, MAC addresses, and UUIDs; URL Details also strips tracking parameters and preserves duplicate query pairs. | — |
| [clipbus-preview-plugin](./clipbus-preview-plugin/README.md) | `clipbus-preview-plugin` | Visual previews for colors (with WCAG contrast), CSS gradients, and sanitised Markdown. | [GIF](./docs/gifs/preview.gif) |
| [clipbus-text-plugin](./clipbus-text-plugin/README.md) | `clipbus-text-plugin` | Nine independent auto-run text actions for JSON pretty-printing/minification, sorting, deduping, whitespace cleanup, ANSI stripping, and reversing or sorting characters/lines. | — |
| [clipbus-cron-plugin](./clipbus-cron-plugin/README.md) | `clipbus-cron-plugin` | Detect 5-field cron expressions: a per-field explanation table, a one-sentence summary, and the next 5 fire times (live, local time), guarded to avoid misfiring on ordinary number rows. | — |
| [clipbus-vibe-plugin](./clipbus-vibe-plugin/README.md) | `clipbus-vibe-plugin` | Emotional fallback for plain text with no structured match: three switchable Three.js particle animations — ① Particle Core: glyphs burst → noise drift → glowing Fibonacci sphere; ② Text Reveal: readable text (≥ 0.6 s, glyph-fit scaled) → light scan → edge disintegration → burst → polyhedral data crystal; ③ Text Loop: seamless 8-phase cycle — text → scatter → burst → drift cloud → sphere recall → stable sphere → deconstruct → text reassembly. A native button bar switches between them; which animations appear and their order are configurable via the `plugin.vibe.animations` setting (defaults to all three). | [GIF](./docs/gifs/vibe.gif) |

The [official plugin template](https://github.com/scubers/clipbus-template-plugin) is maintained upstream. Agents retrieve it temporarily when needed; this repository does not keep a template copy.

## Community plugins

Building a Clipbus plugin outside this collection? List it here.

| Plugin | Description | Repository | Install Subdirectory |
|--------|-------------|------------|-----------------------|
| [Copy Sound](https://github.com/MuhametSmaili/clipbus-plugins/tree/main/sound-plugin) | Quiet copy feedback for macOS, with custom sound and volume settings. | `https://github.com/MuhametSmaili/clipbus-plugins` | `sound-plugin` |

To add a row, open a PR — see **Contributing** below.

## Contributing

There are two ways to contribute:

1. **PR into this repository** to join the official collection. Your plugin directory must pass its own build and test gate — `npm install && npm run verify` (build + test) inside that directory. See [AGENTS.md](./AGENTS.md) for the plugin architecture, the protocol V2 contributions (detector / renderer / Action / messages), the cross-file wiring invariants, and the new-plugin workflow.
2. **Maintain your own repository** and submit a PR adding a row to the [Community plugins](#community-plugins) table above. Only the link and description are reviewed — not the code.
