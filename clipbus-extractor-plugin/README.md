# Extractor & Regex

A Clipbus plugin that provides two independent capabilities: URL/Email/IP extraction and an interactive regex tester.

## URL / Email / IP Extraction (entities-*)

Automatically detects URLs (http/https), email addresses, and IPv4 addresses in clipboard text. Results are shown in an attachment card and can be copied to the clipboard in one tap.

- Detector: `entities-detector`, input kind `text`, attachment type `plugin.extractor.entities`
- Renderer: `entities-renderer`, displays a categorised list (URLs / Emails / IP Addresses)
- Action: `entities-copy` (auto-run), extracts and copies all items joined by newlines

## Regex Tester (regex-tool)

A draft action that provides an interactive regex debugger inside Clipbus. Enter a pattern and flags to see all matches, capture groups, and match positions in real time.

- Action: `regex-tool` (draft), UI-driven, supports flags `g` / `i` / `m` etc.
- Clipboard text is pre-filled into the test input when available
- Capped at 200 matches; input longer than 20,000 characters is truncated to prevent freezing
