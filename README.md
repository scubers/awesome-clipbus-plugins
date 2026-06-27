# Clipbus Plugin Collection

English | [中文](./README_zh.md)

A collection of clipboard (**Clipbus**) plugins — **one plugin per top-level directory**. Every plugin is fully self-contained: its own `npm install` and its own build. There is no root `package.json`, workspace, or shared build orchestration; run every command **inside a specific plugin directory**.

- **`template-plugin/`** is the official scaffold and full-capability reference. It is meant to be **copied**, not imported — a new plugin starts as a copy of it.
- New plugins are authored with the **`clipbus-plugin-generator`** skill (under `.claude/skills/`), which surveys the existing plugins and—by their real responsibilities—**extends the best-matching plugin** rather than creating a near-duplicate.

## Plugins

| Plugin | Description |
|--------|-------------|
| [clipbus-decoder-plugin](./clipbus-decoder-plugin/README.md) | Encode/decode toolkit: detect & decode Base64, parse JWT (header/payload + expiry status), inspect a `data:` URI (media type / encoding / decoded size + text preview), plus a multi-codec draft (URL / HTML / Base64 / Unicode / JSON, both directions). |
| [clipbus-formatter-plugin](./clipbus-formatter-plugin/README.md) | Pretty-printer: detect JSON / XML / SQL and re-indent (or uppercase keywords), and render CSV/TSV as a table — formatted preview with one-click copy. |
| [clipbus-converter-plugin](./clipbus-converter-plugin/README.md) | Conversion toolkit: Unix timestamp ↔ date (local / ISO / UTC / relative), integer radix table (dec/hex/oct/bin + ASCII), ISO 8601 duration breakdown (human components + total seconds), and a naming-case draft (camel/snake/kebab… 8 styles). |
| [clipbus-extractor-plugin](./clipbus-extractor-plugin/README.md) | Extract & parse: pull de-duplicated URLs / Emails / IPv4 from text, break a single URL into scheme / host / path / query, a single IP / CIDR into version / scope / network range, a lat/lng pair into DMS + map links, or a MAC address into OUI / NIC + unicast/multicast & universal/local bits, plus a regex-tester draft. |
| [clipbus-inspector-plugin](./clipbus-inspector-plugin/README.md) | Inspection toolkit: character / word / line / byte stats + MD5 / SHA-1 / SHA-256 hashes; unified-diff viewer (stats bar + per-line coloring); image details (format / dimensions / aspect ratio / megapixels / size) for copied images; and a Unicode character inspector (code point / UTF-8 / UTF-16 / HTML entity / category) for a single glyph or emoji. |
| [clipbus-preview-plugin](./clipbus-preview-plugin/README.md) | Visual preview: detect color values (HEX / RGB / HSL + CSS names) into a swatch with WCAG contrast, and render Markdown into a safe HTML preview card. |
| [clipbus-text-plugin](./clipbus-text-plugin/README.md) | Line-processing toolkit: sort lines / dedupe lines / tidy whitespace — three one-click auto-run actions. |
| [clipbus-generator-plugin](./clipbus-generator-plugin/README.md) | Generate a UUID v4 or a strong random password (configurable length / case / digits / symbols / count) via Web Crypto, plus Lorem Ipsum placeholder text (paragraphs / sentences / words); live-preview and copy from a draft form. |
| [clipbus-cron-plugin](./clipbus-cron-plugin/README.md) | Detect 5-field cron expressions: a per-field explanation table, a one-sentence summary, and the next 5 fire times (live, local time), guarded to avoid misfiring on ordinary number rows. |

## Development

Each plugin is built from two sides — a Node **Runtime** (`src/plugin.ts` → esbuild → `dist/plugin.cjs`) and a Vue **UI** (WebView, Vite → `dist/ui/`). See **[CLAUDE.md](./CLAUDE.md)** for the architecture, the four extension points (detector / renderer / action / messageHandlers), the wiring invariants, and the new-plugin workflow.

Common commands — run **inside a plugin directory**:

```sh
npm install     # pull @clipbus/plugin-sdk (and its authoritative docs)
npm run dev      # Vite preview workbench (?view=renderer / ?view=action)
npm run build    # typecheck → lint → build runtime + UI → verify build
npm test         # Node test runner over tests/
npm run verify   # build + test — the full pre-commit gate
```
