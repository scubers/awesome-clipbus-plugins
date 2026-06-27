# Converter

Clipbus plugin that integrates three conversion capabilities: Unix timestamp display, integer radix conversion, and text case transformation.

## Features

- **Unix Timestamp Detector** (`timestamp-detector`): Recognises 10-digit (seconds) and 13-digit (milliseconds) Unix timestamps in clipboard text. Rejects values that fall outside the year range 2001–2099.
- **Unix Timestamp Renderer** (`timestamp-renderer`): Displays the detected timestamp as local time, UTC, ISO 8601, weekday, and a human-readable relative time (e.g. "3h ago"). Includes a "Copy ISO 8601" button.
- **Radix Detector** (`radix-detector`): Recognises integers written in decimal, hexadecimal (`0x`), binary (`0b`), or octal (`0o`) notation. Rejects floats and non-numeric text.
- **Radix Converter** (`radix-renderer`): Shows the detected integer in all four bases (DEC / HEX / OCT / BIN) with per-row copy buttons. Also displays bit count, ASCII character (printable range 32–126), and a "Negative" badge for signed values. Includes a "Copy all radix" button.
- **Duration Detector** (`duration-detector`): Recognises ISO 8601 duration strings (e.g. `PT4M13S`, `P1Y2M10DT2H30M`, `P3W`). Rejects bare `P`/`PT`, unknown components, and strings with trailing text.
- **Duration Renderer** (`duration`): Displays the detected duration as a human breakdown (e.g. "1 year, 2 months, 10 days, 2 hours, 30 minutes"), total seconds (marked "≈" when years or months are present, "=" otherwise), and the original input. Includes a "Copy Seconds" button.
- **Case Converter** (`case-tool`): Draft action that converts clipboard text into eight naming conventions — camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE, Title Case, Sentence case, dot.case — and lets you copy any variant or submit the camelCase result.

## Development

```sh
npm install
npm run dev        # Vite preview workbench
npm run build      # Full build
npm test           # Run tests
npm run verify     # Build + test (pre-commit gate)
```
