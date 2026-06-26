# clipbus-generator-plugin

A Clipbus plugin that generates UUIDs (v4) and strong passwords via a draft action form.

## Capability

| ID | Type | Lifecycle |
|---|---|---|
| `gen-tool` | action | `draft` |

## What it does

Opens a form UI inside Clipbus where you can:
- Switch between **UUID** and **Password** generation modes
- Set how many values to generate (1–20)
- For passwords: set length (8–64) and toggle uppercase letters, numbers, and symbols
- Preview generated output live in a monospace block
- Click **重新生成** to regenerate with fresh randomness
- Click **生成并复制** (host button) to complete the action and copy the result to the clipboard

UUID generation uses the browser's `crypto.getRandomValues` via the pure `uuidFromBytes` helper (version nibble 4, variant `10xx`). Password generation draws from a configurable charset: lowercase is always included; uppercase, digits, and symbols are additive.

## Dev

```sh
npm install
npm run dev      # Vite preview workbench — ?view=action
npm run verify   # typecheck + lint + build + test
```
