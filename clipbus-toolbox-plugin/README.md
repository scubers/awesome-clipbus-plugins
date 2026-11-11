# Toolbox

English | [中文](./README_zh.md)

One Clipbus plugin for developer clipboard inspectors, previews and composable text transformations. It contributes **17 detectors, 16 renderers and 24 Actions**, using SDK 3.3 and protocol V2 (manifest schema 6).

Plugin ID: **`plugin.awesome.toolbox`**. Attachment types and external settings use this same prefix.

## Automatic cards

Each row lists paired detector/renderer IDs. All detectors accept text.

| Detector | Renderer | Function |
|---|---|---|
| `base64-detector` | `base64-renderer` | Standard / URL-safe Base64 that decodes to readable UTF-8; decoded text preview |
| `jwt-detector` | `jwt-renderer` | JWT header, payload, claims and expiry; local decoding only, no signature verification |
| `xml-detector` | `xml-renderer` | Syntax-validated XML with matching tags/quoted attributes; indented output, counts and depth |
| `csv-detector` | `csv-table` | Strict, consistent comma/tab/semicolon records, including quoted multiline cells; rejects ambiguous unquoted comma-space headers |
| `timestamp-detector` | `timestamp-renderer` | 10/13-digit Unix timestamps in 2001–2099; local, UTC, ISO and world clocks |
| `radix-detector` | `radix-renderer` | Integer DEC/HEX/OCT/BIN conversions, bit count and printable ASCII |
| `duration-detector` | `duration` | ISO 8601 durations; breakdown and total seconds, approximate for years/months |
| `entities-detector` | `entities-renderer` | At least two unique emails / IPv4 addresses in text; excludes URLs and addresses inside them |
| `url-detector` | `url-parsed` | A single URL with query parameters, or a naked query with at least two pairs; duplicate pairs and tracking cleanup |
| `ip-detector` | `ip-details` | A whole IPv4/IPv6 address or CIDR; scope, normalized forms and network details |
| `geo-detector` | `geo-coordinates` | Coordinates with degree/hemisphere markers by default; DMS forms and map links |
| `mac-detector` | `mac-address` | Separated MAC address forms, OUI/NIC split and address flags |
| `uuid-detector` | `uuid-details` | UUID normalization, version/variant and embedded v1/v7 timestamps |
| `markdown-detector` | `markdown-renderer` | Safe Markdown; paired fences, multi-item lists or two syntax signals; JSON/XML/CSV/Cron take priority |
| `rich-text-detector` | `markdown-renderer` | Saved HTML rich text, loaded on demand and sanitized; preserves common formatting, structure and safe links |
| `gradient-detector` | `gradient-swatch` | CSS-validated gradient functions with recognizable color stops |
| `cron-detector` | `cron-renderer` | Five-field cron explanation and next five local run times; does not schedule jobs |

The Host supplies the outer card chrome. Pages use the Host theme and scoped content sizing. Previews include 23 scenarios mounting the actual components.

The shared **Formatted Text** card handles Markdown and rich text. Rich-text attachments contain only a small format marker, never another copy of the HTML or Base64 RTF. The card fetches the original HTML with `item.getRichText` when displayed, honors the Host's UTF-8 fragment offsets, removes scripts/event handlers/remote images, and opens safe HTTP(S)/mailto links through the Host. It preserves common inline spacing, indentation, line height, list and table styling plus semantic attributes such as merged cells and ordered-list numbering, without imposing the Markdown card's typography on rich content. Content height adapts up to 400 points, then scrolls inside the card. **Copy Rich Text** writes the original HTML/RTF plus plain-text fallback to the native clipboard, including for RTF-only items. RTF-only items show an explanatory fallback because this card does not include an RTF renderer. No search index, network permission or additional attachment type is used.

## Actions

Every Action consumes the current Flow text and returns text without a form or intermediate card.

| Group | IDs |
|---|---|
| HTML / Unicode (4) | `html-encode`, `html-decode`, `unicode-escape`, `unicode-unescape` |
| Naming (10) | `uppercase`, `lowercase`, `camelCase`, `pascalCase`, `snakeCase`, `kebabCase`, `constantCase`, `titleCase`, `sentenceCase`, `dotCase` |
| Text cleanup (7) | `text-sort`, `text-dedup`, `text-trim`, `text-strip-ansi`, `text-reverse-lines`, `text-reverse-characters`, `text-sort-characters` |
| JSON (3) | `text-pretty-json`, `text-minify-json`, `json-to-yaml` |

Text sorting uses natural, case-insensitive ordering. Character operations preserve grapheme clusters such as emoji. JSON Actions reject invalid JSON; JSON-to-YAML returns the full conversion rather than a truncated preview. JSON transformations parse and serialize values, so numeric formatting and precision follow JavaScript semantics; the builtin JSON card preserves original number lexemes.

## Detection and search policy

- Ordinary decimal integers do not create radix cards by default. Explicit `0x`, `0b` and `0o` integers do. Valid Unix timestamps always take priority over decimal radix.
- Plain URLs stay with the builtin Host. Toolbox only adds a card for query parameters, and rejects internal whitespace/control characters instead of treating following prose as a URL path.
- CSV records must all have the same number of columns and valid quoting. Unquoted comma-space headers are treated conservatively as prose; use ordinary delimiter-separated or quoted headers for automatic preview.
- Whole IP/CIDR inputs create IP detail cards. Text containing at least two unique emails / IPv4 addresses creates batch extraction; a single address embedded in prose creates neither.
- Plain decimal coordinate pairs are opt-in. Degree signs or hemisphere letters identify coordinates by default.
- Base64 and XML previews are shortened visually, but their copy buttons use the complete result. Results over the SDK attachment budget are omitted rather than copied partially.

**Search extensions are off by default for all 17 detectors.** Cards do not require a search index. XML, CSV, timestamps, radix, durations, entities, URLs/queries, IP, coordinates, MAC, UUID, Markdown, rich text, gradients and Cron never add search entries.

Only Base64 and JWT have explicit opt-ins to index decoded content, using semantic scopes `base64` / `jwt`. Each optional entry contains at most 4 KiB of UTF-8 text without splitting code points. Search extensions and attachments remain on this device and do not follow history cloud sync. The manifest's two declared scopes are only a write allowlist and do not create indexes themselves. Disabling an opt-in and recopying explicitly replaces that detector's previous scope with an empty group; full re-detection also clears old detector output.

Merge only the options you want into the Host's external settings JSON, then reload Toolbox. All four default to false:

```json
{
  "plugin.awesome.toolbox.decimalRadix": true,
  "plugin.awesome.toolbox.decimalCoordinates": true,
  "plugin.awesome.toolbox.indexBase64": true,
  "plugin.awesome.toolbox.indexJwt": true
}
```

For macOS, the store is `~/Library/Application Support/Clipbus/ExternalSettings/settings.json` (`ClipbusDebug` for debug builds). Toolbox only reads these settings. The Host owns individual capability enable/order preferences.

## Migration from the former seven plugins

The former `plugin.toolbox` ID is now **`plugin.awesome.toolbox`**; `plugin.vibe` is now **`plugin.awesome.vibe`**. Install/re-add the new identities and retire the old ones. Capability preferences and saved Flow references do not automatically follow an ID change. Copy the old `plugin.toolbox.decimalRadix` setting to `plugin.awesome.toolbox.decimalRadix` if needed, and move `plugin.vibe.animations` to `plugin.awesome.vibe.animations`.

An ID change also changes the owner of stored attachments/search extensions. A new-ID re-detection does **not** erase old-ID search records. To remove old scopes completely, the Host must clear the former owners, or the original-ID detectors must commit empty output before retirement. Uninstalling/reloading alone must not be assumed to clean history. This plugin cannot write another identity's records and does not modify the user's database.

Install this repository with subdirectory **`clipbus-toolbox-plugin`**, or add this directory as a developer plugin. The plugin identity is `plugin.awesome.toolbox`; Vibe remains a separate `plugin.awesome.vibe` plugin.

| Former plugin | Destination |
|---|---|
| Decoder | Base64/JWT cards and HTML/Unicode Actions in Toolbox |
| Formatter | XML/CSV cards in Toolbox; YAML becomes `json-to-yaml` |
| Converter | Timestamp/radix/duration cards and naming Actions in Toolbox |
| Extractor | URL parameters, email/IP extraction and address inspectors in Toolbox |
| Preview | Markdown, rich-text and gradient cards in Toolbox |
| Text Tools | All nine Actions in Toolbox |
| Cron | Cron card in Toolbox |

Data URI, temperature, data-size and symbolic-permission cards have been removed. Standalone plugin JSON and color cards have been removed in favor of builtin cards; the old color plugin's named-color, alpha and WCAG enhancements are not retained.

Use the builtin Actions for these removed duplicates:

| Former Decoder Action | Builtin Action ID |
|---|---|
| `url-encode` / `url-decode` | `url_encode` / `url_decode` |
| `base64-encode` / `base64-decode` | `base64_encode` / `base64_decode` |
| `json-escape` / `json-unescape` | `json_escape` / `json_unescape` |

Retained Action local IDs are unchanged, but saved Flows must be rebuilt/re-saved with `plugin.awesome.toolbox` references. Replace the six removed Actions with their builtin counterparts. Check boundary behavior: builtin URL encoding also escapes `!'()*`. This repository does not rewrite Host settings or saved Flows automatically.

Disable/remove the former plugin installations after installing Toolbox to avoid duplicate cards and Actions. Re-detect existing entries to populate Toolbox's new attachment namespace. Existing capability preferences under the former plugin identities are not migrated automatically.

## Development

```sh
npm install
npm run dev
npm run verify
```

`verify` validates the manifest, typechecks, lints, builds Runtime and all 16 pages, checks build wiring and output paths, then runs the Node tests against `dist/plugin.cjs`. See [GUIDE.md](./GUIDE.md) and the installed SDK's `docs/README.md` / `API.md`.
