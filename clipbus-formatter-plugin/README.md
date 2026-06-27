# clipbus-formatter-plugin

Clipbus plugin that detects JSON, XML, and SQL text on the clipboard, auto-formats it with proper indentation or keyword casing, and shows a preview card. Supports one-click copy of the formatted result.

## Features

### JSON

- **JSON Detector** (`json-detector`): Tries `JSON.parse` on `text` input; attaches `plugin.formatter.json` when the result is an object or array.
- **JSON Formatter** (`json-renderer`): Preview card showing the top-level type (object/array), key/item count, and the 2-space-indented formatted JSON.
- **Copy Formatted JSON** (`json-copy`, auto-run): Returns the formatted JSON text directly to the clipboard.

### XML

- **XML Detector** (`xml-detector`): Detects text containing valid tag structure (element pairs, prolog, or comments) and attaches `plugin.xml.formatted`.
- **XML Formatter** (`xml-renderer`): Preview card showing element count, attribute count, nesting depth, and the indented XML.
- **Copy Formatted XML** (`xml-copy`, auto-run): Returns the indented XML text to the clipboard.

### SQL

- **SQL Detector** (`sql-detector`): Detects SELECT / INSERT / UPDATE / DELETE and other SQL statement patterns, attaches `plugin.sql.formatted`. Filters out natural-language English sentences that accidentally match (e.g. "select the best option from the menu").
- **SQL Formatter** (`sql-renderer`): Preview card showing the statement type and keyword-uppercased, clause-per-line SQL.
- **Copy Formatted SQL** (`sql-copy`, auto-run): Returns the formatted SQL text to the clipboard.

## Local Development

```sh
npm install
npm run dev       # Vite preview workbench
npm run verify    # typecheck + lint + build + tests (all green before shipping)
```
