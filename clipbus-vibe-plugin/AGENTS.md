# Vibe development

Follow the repository's [AGENTS.md](../AGENTS.md). This is the actual `@clipbus/vibe-plugin` project, using protocol V2 and manifest schema 6.

Run `npm install` before development. Read the installed SDK's `docs/README.md`, then `API.md` and the relevant topic docs. Do not inspect or edit SDK implementation sources.

- `manifest.json` and `src/plugin.ts` must agree on detector and Action IDs.
- `scripts/build-ui.mjs` discovers pages from the manifest and `src/features/<renderer-id>/`; no hand-maintained page map is needed.
- Declare every attachment type and search scope in `writes`. Check installed manifest and per-item limits before adding capabilities.
- Shared payload/contracts must work in Runtime and browser code.
- Maintain real component previews and business regression vectors. Runtime behavior tests load `dist/plugin.cjs`.
- Run `npm run verify`, then check the affected preview components. Build in the directory the Host actually loads.

See [README.md](./README.md) for feature scope and [GUIDE.md](./GUIDE.md) for development.
