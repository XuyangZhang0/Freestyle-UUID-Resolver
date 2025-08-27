# Workspace ONE UEM UUID Resolver — User Guide

## Overview
This Chrome extension resolves selected UUIDs on Workspace ONE UEM pages into readable entity details. Use the context menu to resolve, and view results via toasts and notifications.

## Install
1) Open chrome://extensions/
2) Enable Developer mode
3) Click "Load unpacked" and select the extension folder

## Configure
1) Click the extension icon to open Settings (or right-click any page → Open UUID Resolver Settings)
2) Enter:
   - Server URL (e.g., https://your-server.data.workspaceone.com)
   - Organization Group ID
   - Authentication:
     - Basic: username, password, optional API Key (tenant code)
     - OAuth: client ID, client secret, token URL
3) Click Test Connection to validate

## Use
- On a UEM page, select text containing a UUID → right-click → Resolve UUID
- A colored toast and a system notification will show the resolved entity details
- The popup shows the last resolved entity

## Entity Types
- Tags — Device tags
- Applications — Internal/Public/Purchased apps
- Profiles — Configuration profiles
- Scripts — Desktop scripts/workflows
- Products — Product provisioning
- Organization Groups — UEM groups

## Privacy and Credentials
- Your credentials and settings are stored locally using Chrome storage (sync/local). They are not included when you zip or share this folder by default.
- Do NOT commit real credentials to version control.
- Before packaging/sharing:
  - Clear sensitive fields in Settings or export sanitized settings
  - Ensure no secrets exist in files (grep for your username/clientId/tenant code)

## Packaging and Sharing
Option A: Share source folder (recommended for internal dev)
- Ensure .git, node_modules, and any local build artifacts are excluded
- Zip the folder contents (icons, manifest, background, content, options, popup)

Option B: Chrome CRX (not needed for local sharing)
- Use Chrome Developer Dashboard to publish (requires a developer account)

## FAQ
- Context menu missing: ensure you selected text; reload extension in chrome://extensions
- No toast/notification: check Chrome notification permissions
- OAuth token issues: confirm token URL and client credentials; host permissions may need identity domain if used

## Support
- Open an issue in the repository or contact the maintainer.
