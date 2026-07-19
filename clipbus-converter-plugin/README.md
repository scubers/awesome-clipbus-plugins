# Converter

Clipbus plugin for numeric, time, unit, permission, and composable text case conversions.

## Features

- **Unix Timestamp Detector** (`timestamp-detector`): Recognises 10-digit (seconds) and 13-digit (milliseconds) Unix timestamps in clipboard text. Rejects values that fall outside the year range 2001–2099.
- **Unix Timestamp Renderer** (`timestamp-renderer`): Displays the detected timestamp as local time, UTC, ISO 8601, weekday, and a human-readable relative time (e.g. "3h ago"). Includes a "Copy ISO 8601" button.
- **Radix Detector** (`radix-detector`): Recognises integers written in decimal, hexadecimal (`0x`), binary (`0b`), or octal (`0o`) notation. Rejects floats and non-numeric text.
- **Radix Converter** (`radix-renderer`): Shows the detected integer in all four bases (DEC / HEX / OCT / BIN) with per-row copy buttons. Also displays bit count, ASCII character (printable range 32–126), and a "Negative" badge for signed values. Includes a "Copy all radix" button.
- **Duration Detector** (`duration-detector`): Recognises ISO 8601 duration strings (e.g. `PT4M13S`, `P1Y2M10DT2H30M`, `P3W`). Rejects bare `P`/`PT`, unknown components, and strings with trailing text.
- **Duration Renderer** (`duration`): Displays the detected duration as a human breakdown (e.g. "1 year, 2 months, 10 days, 2 hours, 30 minutes"), total seconds (marked "≈" when years or months are present, "=" otherwise), and the original input. Includes a "Copy Seconds" button.
- **Temperature Detector** (`temperature-detector`): Recognises single temperature values such as `37°C`, `98.6°F`, `300 K`, `37 Celsius`. Requires an explicit scale marker — bare values like `37C` or `300K` (no degree sign or separating space) are rejected to avoid false positives.
- **Temperature Renderer** (`temperature`): Converts the detected temperature to all three scales (Celsius, Fahrenheit, Kelvin) and displays them in a facts grid with per-row copy buttons. The source scale is highlighted. Shows a warning note when the value is below absolute zero.
- **Case Actions**: Ten independent auto-run actions for uppercase, lowercase, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case, Sentence case, and dot.case. Each action consumes the current cascade text so the host can automate multi-step transformations.

## Development

```sh
npm install
npm run dev        # Vite preview workbench
npm run build      # Full build
npm test           # Run tests
npm run verify     # Build + test (pre-commit gate)
```
