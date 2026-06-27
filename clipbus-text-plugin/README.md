# Text Tools

Three auto-run text transform actions for [Clipbus](https://clipbus.app).

## Actions

| ID | Title | What it does |
|---|---|---|
| `text-sort` | Sort Lines | Sorts all lines alphabetically and numerically (case-insensitive, natural order). |
| `text-dedup` | Remove Duplicate Lines | Removes later duplicate lines, preserving the first occurrence and original order. |
| `text-trim` | Tidy Whitespace | Trims leading/trailing spaces on each line, strips leading/trailing blank lines, and collapses runs of 2+ consecutive blank lines into a single blank line. |

All three actions are `auto-run` (no UI), apply only to `text` clipboard items, and return the transformed text directly. Empty or whitespace-only input yields a "no content" result with no output.

## Development

```sh
npm install
npm run verify   # typecheck → lint → build → test
```
