# clipbus-csv-plugin

Clipbus plugin that detects CSV text on the clipboard and renders it as a formatted table.

## Features

- **CSV Detector** (`csv-detector`): Recognises comma, tab, and semicolon-delimited CSV. Rejects prose with accidental commas by requiring at least 2 columns, 2 lines, and a majority of rows with consistent column counts. Handles RFC 4180 quoted fields (embedded delimiters and escaped `""`).
- **CSV Table Renderer** (`csv-table`): Displays the CSV as an HTML table with zebra-striped rows and a horizontally-scrollable container. Caps display at 50 rows and shows a "+N more" note for larger files. Long cells ellipsize.
- **Copy as Markdown Table** (`csv-copy`): Auto-run action that converts the detected CSV to a GitHub-flavored Markdown table (header row + `---` separator + data rows, with `|` characters in cells escaped).
