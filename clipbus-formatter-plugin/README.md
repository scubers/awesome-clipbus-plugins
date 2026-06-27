# Formatter

Clipbus plugin that detects JSON, XML, SQL, and CSV data on the clipboard, auto-formats it with proper indentation or keyword casing, and shows a preview card. Supports one-click copy of the formatted result.

## Features

### JSON (`json-*`)

- **JSON Detector** (`json-detector`): Tries `JSON.parse` on `text` input; attaches `plugin.formatter.json` when the result is an object or array.
- **JSON Formatter** (`json-renderer`): Preview card showing the top-level type (object/array), key/item count, and the 2-space-indented formatted JSON with a "Copy Formatted" button.

### XML (`xml-*`)

- **XML Detector** (`xml-detector`): Detects text containing valid tag structure (element pairs, prolog, or comments) and attaches `plugin.formatter.xml`.
- **XML Formatter** (`xml-renderer`): Preview card showing element count, attribute count, nesting depth, and the indented XML with a "Copy Formatted" button.

### SQL (`sql-*`)

- **SQL Detector** (`sql-detector`): Detects SELECT / INSERT / UPDATE / DELETE and other SQL statement patterns, attaches `plugin.formatter.sql`. Filters out natural-language English sentences that accidentally match (e.g. "select the best option from the menu").
- **SQL Formatter** (`sql-renderer`): Preview card showing the statement type and keyword-uppercased, clause-per-line SQL with a "Copy Formatted" button.

### CSV Table (`csv-*`)

- **CSV Detector** (`csv-detector`): Identifies comma-separated values with consistent column counts and attaches `plugin.formatter.csv`.
- **CSV Table** (`csv-table`): Renders the CSV data as a styled table with header row highlighting. Height adapts automatically to fit the content.

### Query String (`query-*`)

- **Query String Detector** (`query-detector`): Identifies bare URL query strings / form-encoded pairs (requires `>=2` `key=value` pairs, no `://`) and attaches `plugin.formatter.query`.
- **Query String** (`query-table`): Renders decoded key/value pairs as a two-column table with a "Copy as JSON" button. Flags duplicate keys inline.

## Development

```sh
npm install
npm run dev       # Vite preview workbench
npm run verify    # typecheck + lint + build + tests (all green before shipping)
```
