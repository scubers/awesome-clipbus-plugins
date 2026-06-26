# URL Inspector Plugin

A Clipbus plugin that detects URLs in clipboard text and provides a parsed view of scheme, host, path, query parameters, and hash, with one-click query parameter extraction.

## Features

### Detector: `url-detector`

Scans clipboard text for a URL with a scheme + `//` authority (accepts `http`, `https`, `ftp`, `ws`, `wss`, and custom schemes with `//`). Rejects `mailto:`, `tel:`, bare colon-separated strings, and plain prose. Only fires when the trimmed clipboard content is a valid URL with a non-empty hostname.

### Renderer: `url-parsed`

Displays a content-driven card (height `"auto"`) with:

- **Facts grid**: Scheme, Host, Port (if non-default), Path, and Hash in monospace type.
- **Query params table**: Key/value table with zebra-striped rows for all query parameters; shows "无查询参数" when none are present.
- **Host button**: "复制查询参数 JSON" copies all query parameters as a formatted JSON object (or the full href when there are no query params).

### Auto-run Action: `url-copy`

Triggered for text items matching keywords `url`, `链接`, `query`, `参数`. Behaviour:

- URL with query parameters → returns a formatted JSON object of key/value pairs with message "已复制查询参数".
- URL without query parameters → returns the full href with message "已复制 URL".
- Non-URL content → returns `none` with message "不是 URL".

## Getting started

```sh
cd clipbus-url-plugin
npm install
npm run verify
```

To load in Clipbus: Settings → Plugins → Developer Plugins → Add Path, select this directory.
