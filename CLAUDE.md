# CLAUDE.md

@AGENTS.md

`AGENTS.md` (imported above) is the authoritative guide. Notes specific to Claude Code:

- Verify visual changes by building, starting `npx astro preview`, and running `scripts/screenshot.mjs`. Check
  light, dark (`:dark`) and phone width (`@390`).
- Run `scripts/smoke-test.mjs` after touching filters, the People tabs, redirects or the theme toggle.
- Node may only be on `PATH` through nvm in non-interactive shells
  (`~/.nvm/versions/node/<version>/bin`).
