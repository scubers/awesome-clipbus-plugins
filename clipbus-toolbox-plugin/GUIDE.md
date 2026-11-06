# Toolbox development guide

Feature scope and usage are in [README.md](./README.md); Chinese instructions are in [GUIDE_zh.md](./GUIDE_zh.md).

## Install and preview

Run commands in `clipbus-toolbox-plugin/`, not the repository root:

```sh
npm install
npm run dev
```

The Vite workbench opens `/src/preview/preview-host/index.html`. Select a scenario and switch dark/light themes; it mounts the real Vue feature component. Preview records Host calls, but does not enforce real Host isolation, write declarations or commit budgets.

## Build and verify

```sh
npm run verify
```

The gate validates the manifest, typechecks, lints, builds the CommonJS Runtime and each manifest renderer page, checks registry/page wiring, validates the built files, and runs Node `.cjs` tests. Business parser vectors remain alongside tests of the delivered `dist/plugin.cjs`.

Build outputs live in ignored `dist/`. The install hook uses the committed lockfile with `npm ci`, then builds with the Host-provided npm invocation. Do not edit generated build output.

## Load in Clipbus

Settings → Plugins → Developer Plugins → Add Path: select this directory, which contains `manifest.json`. Reload re-reads configuration; Run Install re-runs the install hook. Rebuild this exact directory after source changes. Re-detect an existing entry when checking new detector output.

## Extend the plugin

Read `node_modules/@clipbus/plugin-sdk/docs/README.md` and `API.md` first. Keep manifest IDs, Runtime handlers, declared writes, renderer source folders, actual component previews and tests aligned. Every output page has an independent folder. Readonly package files and shared payload modules must respect the installed SDK's environment constraints.

The project was checked against the [official template](https://github.com/scubers/clipbus-template-plugin), commit `6008c5a269ea0ceb79e0d51ac678d55c3c69f72c`; local build configuration remains adapted to these actual features.
