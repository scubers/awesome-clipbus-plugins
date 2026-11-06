# Toolbox

English | [中文](./README_zh.md)

One Clipbus plugin for developer clipboard inspectors, previews and composable text transformations. It contributes **16 detectors, 16 renderers and 24 Actions**, using SDK 3.2 and protocol V2 (manifest schema 6).

## Automatic cards

Each row lists paired detector/renderer IDs. All detectors accept text.

| Detector | Renderer | Function |
|---|---|---|
| `base64-detector` | `base64-renderer` | Standard / URL-safe Base64 that decodes to readable UTF-8; decoded text preview |
| `jwt-detector` | `jwt-renderer` | JWT header, payload, claims and expiry; local decoding only, no signature verification |
| `xml-detector` | `xml-renderer` | Indented XML, element/attribute counts and depth |
| `csv-detector` | `csv-table` | Comma, tab or semicolon tables; Markdown and JSON export |
| `timestamp-detector` | `timestamp-renderer` | 10/13-digit Unix timestamps in 2001–2099; local, UTC, ISO and world clocks |
| `radix-detector` | `radix-renderer` | Integer DEC/HEX/OCT/BIN conversions, bit count and printable ASCII |
| `duration-detector` | `duration` | ISO 8601 durations; breakdown and total seconds, approximate for years/months |
| `entities-detector` | `entities-renderer` | At least two unique emails / IPv4 addresses in text; excludes URLs and addresses inside them |
| `url-detector` | `url-parsed` | URL components, query pairs and tracking-parameter cleanup; also naked queries with at least two pairs |
| `ip-detector` | `ip-details` | A whole IPv4/IPv6 address or CIDR; scope, normalized forms and network details |
| `geo-detector` | `geo-coordinates` | Decimal coordinates, DMS forms and copyable map links |
| `mac-detector` | `mac-address` | Separated MAC address forms, OUI/NIC split and address flags |
| `uuid-detector` | `uuid-details` | UUID normalization, version/variant and embedded v1/v7 timestamps |
| `markdown-detector` | `markdown-renderer` | Safe Markdown subset; requires at least two distinct syntax signals |
| `gradient-detector` | `gradient-swatch` | Complete CSS gradient functions and color stops |
| `cron-detector` | `cron-renderer` | Five-field cron explanation and next five local run times; does not schedule jobs |

The Host supplies the outer card chrome. Pages use the Host theme and scoped content sizing. Previews include 20 scenarios mounting the actual components.

## Actions

Every Action consumes the current Flow text and returns text without a form or intermediate card.

| Group | IDs |
|---|---|
| HTML / Unicode (4) | `html-encode`, `html-decode`, `unicode-escape`, `unicode-unescape` |
| Naming (10) | `uppercase`, `lowercase`, `camelCase`, `pascalCase`, `snakeCase`, `kebabCase`, `constantCase`, `titleCase`, `sentenceCase`, `dotCase` |
| Text cleanup (7) | `text-sort`, `text-dedup`, `text-trim`, `text-strip-ansi`, `text-reverse-lines`, `text-reverse-characters`, `text-sort-characters` |
| JSON (3) | `text-pretty-json`, `text-minify-json`, `json-to-yaml` |

Text sorting uses natural, case-insensitive ordering. Character operations preserve grapheme clusters such as emoji. JSON Actions reject invalid JSON; JSON-to-YAML returns the full conversion rather than a truncated preview. JSON transformations parse and serialize values, so numeric formatting and precision follow JavaScript semantics; the builtin JSON card preserves original number lexemes.

## Detection policy

- Ordinary decimal integers do not create radix cards by default. Explicit `0x`, `0b` and `0o` integers do.
- Valid Unix timestamps always take priority over decimal radix detection, including when decimal radix is enabled.
- A whole IP/CIDR creates an IP detail card. Text containing at least two unique emails / IPv4 addresses creates a batch extraction card. A single address embedded in prose creates neither card.
- URL lists, JSON cards and color cards belong to the builtin Host. Toolbox keeps URL parameter inspection and tracking cleanup as a separate developer tool.

To opt in to ordinary decimal radix cards, merge this key into the Host's external settings JSON and reload Toolbox:

```json
{ "plugin.toolbox.decimalRadix": true }
```

For macOS, the store is `~/Library/Application Support/Clipbus/ExternalSettings/settings.json` (`ClipbusDebug` for debug builds). Toolbox only reads this setting. The Host also owns the individual detector, renderer and Action enable/order preferences.

## Migration from the former seven plugins

Install this repository with subdirectory **`clipbus-toolbox-plugin`**, or add this directory as a developer plugin. The plugin identity is `plugin.toolbox`; Vibe remains a separate `plugin.vibe` plugin.

| Former plugin | Destination |
|---|---|
| Decoder | Base64/JWT cards and HTML/Unicode Actions in Toolbox |
| Formatter | XML/CSV cards in Toolbox; YAML becomes `json-to-yaml` |
| Converter | Timestamp/radix/duration cards and naming Actions in Toolbox |
| Extractor | URL parameters, email/IP extraction and address inspectors in Toolbox |
| Preview | Markdown and gradient cards in Toolbox |
| Text Tools | All nine Actions in Toolbox |
| Cron | Cron card in Toolbox |

Data URI, temperature, data-size and symbolic-permission cards have been removed. Standalone plugin JSON and color cards have been removed in favor of builtin cards; the old color plugin's named-color, alpha and WCAG enhancements are not retained.

Use the builtin Actions for these removed duplicates:

| Former Decoder Action | Builtin Action ID |
|---|---|
| `url-encode` / `url-decode` | `url_encode` / `url_decode` |
| `base64-encode` / `base64-decode` | `base64_encode` / `base64_decode` |
| `json-escape` / `json-unescape` | `json_escape` / `json_unescape` |

Retained Action local IDs are unchanged, but saved Flows must be rebuilt/re-saved with `plugin.toolbox` references. Replace the six removed Actions with their builtin counterparts. Check boundary behavior: builtin URL encoding also escapes `!'()*`. This repository does not rewrite Host settings or saved Flows automatically.

Disable/remove the former plugin installations after installing Toolbox to avoid duplicate cards and Actions. Re-detect existing entries to populate Toolbox's new attachment namespace. Existing capability preferences under the former plugin identities are not migrated automatically.

## Development

```sh
npm install
npm run dev
npm run verify
```

`verify` validates the manifest, typechecks, lints, builds Runtime and all 16 pages, checks build wiring and output paths, then runs the Node tests against `dist/plugin.cjs`. See [GUIDE.md](./GUIDE.md) and the installed SDK's `docs/README.md` / `API.md`.
