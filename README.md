# Workspace ONE UEM UUID Resolver

Context menu-based Chrome extension that resolves selected UUIDs on Workspace ONE UEM pages to human-readable entities. Shows colored in-page toasts and best-effort system notifications.

## Current Architecture
- background/service-worker.js — context menu, resolution pipeline, notifications, stats
- content/content-script-simple.js — in-page toast fallback and UI
- options/ — settings UI (server URL, auth, entity types, toast detail toggle)
- popup/ — popup.html + popup-simple.js (shows last resolved entity)
- icons/ — extension icons

Removed legacy components: auto-detection content scripts, uuid-detector*, ui-enhancer, extra debug/test scripts, sidepanel, and legacy popup.js/css.

## Usage
- Select a UUID on a UEM page, right-click, choose "Resolve UUID".
- Configure server/auth in Options if prompted.

## Build/Load
- Load unpacked in Chrome from this folder.

## Stats
- Background tracks: totalFound, totalResolved, totalFailures, totalErrors.

## Distribution and Safety
- Credentials are stored locally by Chrome and are not part of the repo.
- Before zipping/sharing, clear credentials in Options or verify no secrets are present.
- See docs/USER_GUIDE.md for packaging and privacy guidance.
