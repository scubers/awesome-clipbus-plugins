# Link & Contact Extractor Plugin

A Clipbus plugin that extracts URLs, email addresses, and IPv4 addresses from clipboard text, deduplicates them, and presents them in a grouped list with one-click copy.

## Features

- **Detector** — scans text clipboard items and produces an `entities_preview` attachment when 2 or more entities are found
- **Attachment renderer** — displays extracted entities in grouped sections (Links / Emails / IP Addresses) with a "复制全部" host button
- **Auto-run action** — immediately copies all extracted entities (newline-separated) to the clipboard

## Detection rules

| Entity | Pattern |
|---|---|
| URL | `https?://…` — trailing punctuation (`. , ; : ! ?`) stripped |
| Email | Standard RFC-style address (`user@domain.tld`) |
| IPv4 | Four-octet dotted-decimal (`0–255` per octet) |

**Deduplication**: each entity type is deduplicated by first-occurrence order. IPs that appear as part of a URL host are excluded from the IP list to avoid double-counting.

**Trigger condition**: `totalCount >= 2` — at least two distinct entities across all three types must be found, otherwise the detector returns nothing and the action returns `none`.

## Usage

1. Copy any text containing links, email addresses, or IP addresses.
2. The extractor attachment card appears automatically in Clipbus.
3. Click **复制全部** to copy every extracted entity as a newline-separated list.
4. The auto-run action also fires immediately and copies the same list.

## Commands

```sh
npm install       # install dependencies
npm run dev       # Vite preview workbench
npm test          # run tests
npm run build     # production build to dist/
npm run verify    # typecheck + lint + build + test (pre-commit gate)
```

## Attachment type

`plugin.extractor.entities`
