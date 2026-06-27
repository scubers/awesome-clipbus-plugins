# clipbus-inspector-plugin

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

## Unified Diff Viewer (`diff-*`)

Detects standard unified diff format (supports `diff --git` headers and bare hunk format) and displays:

- Stats bar: number of changed files, added lines (+), and deleted lines (−)
- Syntax-coloured lines: added lines in green, deleted lines in red, context lines unchanged

Trigger condition: text contains `---`/`+++` headers plus at least two change lines (`+`/`-`).

| Extension point | ID |
|---|---|
| Detector | `diff-detector` |
| Attachment Renderer | `diff-renderer` |
| Attachment Type | `plugin.diff.unified` |

## Development

```sh
cd clipbus-inspector-plugin
npm install
npm run dev        # Vite preview workbench
npm run verify     # typecheck + lint + build + test
```

Loading: Settings → Plugins → Developer Plugins → Add Path → select this directory.
