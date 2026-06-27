# Inspector

A Clipbus plugin that combines text statistics with unified diff viewing in a single package.

## Text Stats + MD5/SHA Hashes (`text-stats-*`)

Detects any text on the clipboard and automatically computes and displays:

- Character count, non-whitespace character count, word count, line count, and byte count
- MD5, SHA-1, and SHA-256 hash values
- A preview excerpt of the text

Trigger condition: text `trim().length >= 20`.

| Extension point | ID |
|---|---|
| Detector | `text-stats-detector` |
| Attachment Renderer | `text-stats-renderer` |
| Attachment Type | `plugin.inspector.text-stats` |

## Image Details (`image-info-*`)

Detects any image on the clipboard and displays a metadata card with:

- Format (PNG, JPEG, GIF, etc.), dimensions, and orientation (Landscape / Portrait / Square)
- Aspect ratio in reduced form (e.g. 16:9) and decimal (e.g. 1.78:1)
- Megapixel count and human-readable file size
- Common resolution label when applicable (4K UHD, Full HD 1080p, HD 720p, QHD 1440p)

| Extension point | ID |
|---|---|
| Detector | `image-info-detector` |
| Attachment Renderer | `image-info-renderer` |
| Attachment Type | `plugin.inspector.image-info` |

## Unified Diff Viewer (`diff-*`)

Detects standard unified diff format (supports `diff --git` headers and bare hunk format) and displays:

- Stats bar: number of changed files, added lines (+), and deleted lines (−)
- Syntax-coloured lines: added lines in green, deleted lines in red, context lines unchanged

Trigger condition: text contains `---`/`+++` headers plus at least two change lines (`+`/`-`).

| Extension point | ID |
|---|---|
| Detector | `diff-detector` |
| Attachment Renderer | `diff-renderer` |
| Attachment Type | `plugin.inspector.diff` |

## Character Unicode Inspector (`char-info-*`)

Detects a single non-ASCII grapheme cluster (or a `U+XXXX` code point notation) and displays a Unicode fact card with:

- The glyph rendered large, with an "(zero-width / invisible)" hint for invisible characters
- Code point(s) in `U+XXXX` form, UTF-8 hex bytes, UTF-16 hex units, and HTML entity
- Unicode category (Emoji, Letter, Number, Punctuation, Symbol, Mark, Separator, Other/Control)

Trigger condition: text whose trimmed content is exactly one grapheme cluster containing at least one non-ASCII code point (e.g. `é`, `©`, `中`, `😀`, `👨‍👩‍👧`, `​` U+200B), or matches `/^U\+[0-9A-Fa-f]{1,6}$/i`.

| Extension point | ID |
|---|---|
| Detector | `char-info-detector` |
| Attachment Renderer | `char-info-renderer` |
| Attachment Type | `plugin.inspector.char-info` |

## Development

```sh
cd clipbus-inspector-plugin
npm install
npm run dev        # Vite preview workbench
npm run verify     # typecheck + lint + build + test
```

Loading: Settings → Plugins → Developer Plugins → Add Path → select this directory.
