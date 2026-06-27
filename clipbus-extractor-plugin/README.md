# Extractor

Clipbus plugin that extracts URLs, email addresses, and IP addresses from clipboard text, parses individual URL structure in detail, and provides an interactive regex tester.

## Features

### URL / Email / IP Extraction (`entities-*`)

Automatically detects URLs (http/https), email addresses, and IPv4 addresses in clipboard text. Results are shown in a categorised attachment card.

- **Detector** (`entities-detector`): input kind `text`, attachment type `plugin.extractor.entities`
- **Renderer** (`entities-renderer`): groups results into URLs / Emails / IP Addresses sections; each item is individually copyable and a Copy All button is provided

### URL Structure Parser (`url-*`)

Detects a single HTTP/HTTPS URL on the clipboard and renders a structured breakdown of its components.

- **Detector** (`url-detector`): input kind `text`, attachment type `plugin.extractor.url`
- **Renderer** (`url-parsed`): displays scheme, host, pathname, query parameters (as a key/value table), and fragment in separate rows; height adapts automatically to fit the content

### Regex Tester (`regex-tool`)

A draft action providing an interactive regex debugger inside Clipbus.

- **Action** (`regex-tool`, draft): input kind `text`
- Clipboard text is pre-filled into the test input when available
- Enter a pattern and flags (`g` / `i` / `m` etc.) to see all matches, capture groups, and match positions in real time
- Capped at 200 matches; input longer than 20,000 characters is truncated to prevent freezing

## Development

```sh
npm install
npm run dev       # Vite preview workbench
npm run verify    # typecheck + lint + build + tests
```
