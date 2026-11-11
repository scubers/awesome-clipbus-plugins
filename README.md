# Clipbus Plugin Collection

English | [中文](./README_zh.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**The official plugin collection for Clipbus — the programmable clipboard for macOS.** A growing collection of ready-to-install plugins, plus the tools to write your own.

[clipbus.com](https://clipbus.com) · [Plugin docs](https://clipbus.com/plugin-doc)

## Install the AI skills

Use `clipbus-plugin-generator` to create or extend a plugin, and `clipbus-sdk-upgrade`
to upgrade an existing plugin's SDK. From your own project directory, install both:

```sh
npx skills add https://github.com/scubers/awesome-clipbus-plugins \
  --skill clipbus-plugin-generator \
  --skill clipbus-sdk-upgrade
```

Keep just one `--skill` option to install that workflow on its own. Add `-g` for
user-wide installation. No manual clone of this collection is required. See
[Build and maintain plugins with AI](#build-and-maintain-plugins-with-ai) for usage.

## Install into Clipbus

The primary way to use these plugins is installing straight from this repository — no clone, no local build required.

1. Open Clipbus and go to **Settings → Plugins → Install → Git Repository**. This opens the **"Install From Git Repository"** panel.
2. Fill in the form:

   | Field | Value |
   |---|---|
   | Repository URL | `https://github.com/scubers/awesome-clipbus-plugins` |
   | Subdirectory | the plugin's directory name, e.g. `clipbus-toolbox-plugin` — see the **Subdirectory** column in the [Plugins table](#plugins) below |
   | Ref | leave blank to track `main`, or pin a branch/tag/commit |

3. Click **Install**.

Clipbus's free tier includes 3 slots per capability type (detector / renderer / action) — Pro lifts the limits and adds Cloud Sync.

## Build and maintain plugins with AI

Install the relevant skill with the [commands above](#install-the-ai-skills), open
your target folder in your AI coding agent, and describe the task. For manual
installation, keep each skill's `SKILL.md` and `references/` together in its own
folder. Each skill can be distributed and used independently.
Node.js, npm, Git, and access to the upstream template and npm registry are required.
The agent reads the current official template and the installed SDK documentation,
adapts the implementation to the project, and runs the project's own validation.
Cloning this collection or keeping a local template is unnecessary.

To contribute changes to this collection, clone the repository and open it with
your preferred AI coding agent.

The repository includes identical skill files in `.agents/skills/`, `.codex/skills/`,
and `.claude/skills/`. They work directly after cloning on Windows and macOS.
Keep all three copies updated together; CI checks that their contents match.

Two skills under `.agents/skills/` provide purpose-built workflows:

- **Create — [`clipbus-plugin-generator`](./.agents/skills/clipbus-plugin-generator/):** An instruction-based workflow for empty folders, standalone plugins, and collections. The agent consults the official template and installed SDK documentation, implements the feature, and runs the project's own checks. Existing plugin responsibilities guide reuse when relevant.
- **Upgrade — [`clipbus-sdk-upgrade`](./.agents/skills/clipbus-sdk-upgrade/):** Upgrades the SDK and related protocol/configuration in standalone plugins or a selected collection by comparing their actual implementation with the official template and SDK documentation, adapting relevant changes, and running each project's own checks.

Both skills contain instructions and references, with no bundled scaffold,
build assets, or fixed plugin-structure validators. They do not require one another.

## Plugins

Each plugin below lives in its own top-level directory and is fully self-contained (own `npm install`, own build) — there is no root `package.json` or shared build orchestration. The **Subdirectory** column can be pasted directly into the install form above.

| Plugin | Plugin ID | Subdirectory | Description |
|--------|-----------|--------------|-------------|
| [Toolbox](./clipbus-toolbox-plugin/README.md) | `plugin.awesome.toolbox` | `clipbus-toolbox-plugin` | 17 detectors, 16 cards and 24 Actions: Base64/JWT, XML/CSV, timestamps/radix/durations, address inspectors, Markdown/rich text/gradients/Cron, and text transformations. Complements the Host's builtin JSON, color and encoding tools. |
| [Vibe](./clipbus-vibe-plugin/README.md) | `plugin.awesome.vibe` | `clipbus-vibe-plugin` | Independent text fallback with three configurable Three.js particle animations. |

The former seven utility plugins are consolidated into Toolbox. See [migration and removed capabilities](./clipbus-toolbox-plugin/README.md#migration-from-the-former-seven-plugins) before replacing existing installations or saved Flows.

The [official plugin template](https://github.com/scubers/clipbus-template-plugin) is maintained upstream. Agents retrieve it temporarily when needed; this repository does not keep a template copy.

## Community plugins

Building a Clipbus plugin outside this collection? List it here.

| Plugin | Description | Repository | Install Subdirectory |
|--------|-------------|------------|-----------------------|
| [Copy Sound](https://github.com/MuhametSmaili/clipbus-plugins/tree/main/sound-plugin) | Quiet copy feedback for macOS, with custom sound and volume settings. | `https://github.com/MuhametSmaili/clipbus-plugins` | `sound-plugin` |

To add a row, open a PR — see **Contributing** below.

## Contributing

There are two ways to contribute:

1. **PR into this repository** to join the official collection. Your plugin directory must pass its own build and test gate — `npm install && npm run verify` (build + test) inside that directory. See [AGENTS.md](./AGENTS.md) for the plugin architecture, the protocol V2 contributions (detector / renderer / Action / messages), the cross-file wiring invariants, and the new-plugin workflow.
2. **Maintain your own repository** and submit a PR adding a row to the [Community plugins](#community-plugins) table above. Only the link and description are reviewed — not the code.
