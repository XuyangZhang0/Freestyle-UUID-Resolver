# Workspace ONE UEM UUID Resolver

A lightweight Chrome extension (MV3) that resolves selected Workspace ONE UEM UUIDs into human‑readable entities. Triggered from the context menu, with clear in‑page toasts and optional system notifications.

## Features
- Right‑click → "Resolve UUID" on UEM pages
- Supports Tags, Scripts/Workflows, Organization Groups, Applications, Products, and Profiles
- In‑page toasts: success shows entity Name as the title with a Type pill; errors/warnings are clearly styled
- Optional extra fields in toast body (toggle in Options)
- Caching and stats tracking (found/resolved/failures/errors)

## Authentication
- Basic: username + password + API Key (Tenant Code) is REQUIRED
  - aw-tenant-code header is always sent for Basic auth
- OAuth: client ID/secret supported
- Configure these in the Options page and use "Test Connection" to verify

## Usage
1) Select a UUID on a Workspace ONE UEM page
2) Right‑click and choose "Resolve UUID"
3) A toast appears with the result. Success toasts show the Name as the title and a Type pill. Optional details can be shown if enabled in Options

## Options
- Server URL and authentication (Basic or OAuth)
- API Key (Tenant Code) required for Basic
- Toggle to show extra fields in toasts
- Live statistics and a connection test utility

## Project Structure
- background/service-worker.js — context menu, resolution pipeline, auth, notifications, stats
- content/content-script-simple.js — in‑page toast UI
- options/ — settings UI, validation, stats
- popup/ — simple view of last resolved entity and config status
- icons/ — generated PNGs; source SVGs in icons/src; backups in icons/backup

## Build, Icons, and Release
- Icons: run `npm run icons:build` to regenerate PNGs from SVG sources (backups created automatically)
- Validate: `npm run validate`
- Release: `npm run release` produces a zip under `dist/` and includes `docs/USER_GUIDE.md`
- Load Unpacked: open chrome://extensions → enable Developer Mode → Load unpacked → select this folder

## Privacy & Safety
- Credentials are stored by Chrome and are not committed to the repo
- Review settings before distribution; see `docs/USER_GUIDE.md` for details

## License
MIT
