# clipbus-inspector-plugin

Clipbus plugin that computes character/word/line/byte statistics and MD5, SHA-1, SHA-256 hashes for clipboard text, displaying them as a read-only info card.

## Features

- **字符统计**: total Unicode code-point count and non-whitespace count
- **词统计**: whitespace-delimited word count
- **行统计**: line count (handles `\n`, `\r\n`, `\r`)
- **字节统计**: UTF-8 byte length
- **哈希**: MD5, SHA-1, SHA-256 in monospace
- **复制哈希按钮**: host buttons copy SHA-256 or MD5 to clipboard directly from the renderer card

## Detection rule

Triggers only when the clipboard item is `text` kind **and** `text.trim().length >= 20`. Short snippets under 20 trimmed characters are ignored to avoid attaching a card to every small copy.

## Capabilities

| Kind | ID |
|---|---|
| Detector | `text-stats-detector` |
| Attachment Renderer | `text-stats-renderer` |
| Attachment Type | `plugin.inspector.text-stats` |

No action capability — this plugin is purely read-only (detector + renderer).

## Usage

1. Copy any text longer than 20 characters to the clipboard.
2. Open Clipbus — the **文本统计** card appears automatically beneath the item.
3. The card shows a stats grid (字符, 词, 行, 字节) and the three hashes.
4. Use the **复制 SHA-256** or **复制 MD5** host button to copy a hash.

## Development

```sh
cd clipbus-inspector-plugin
npm install
npm run dev        # Vite preview workbench
npm run verify     # typecheck + lint + build + test
```

Load in Clipbus: Settings → Plugins → Developer Plugins → Add Path → select this directory.
