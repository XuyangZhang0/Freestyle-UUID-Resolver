
# Workspace ONE UEM UUID Resolver Chrome Extension

## 📝 Project Summary

**Title**: Workspace ONE UEM UUID Resolver Chrome Extension

**Purpose**:  
Improve the user experience of editing and viewing automation workflows in Workspace ONE UEM by resolving UUIDs to human-readable entity names (e.g., Tags, Applications, Profiles) using UEM APIs. This extension overlays entity names directly in the UI, helping users understand workflow configurations without needing to manually cross-reference UUIDs.

---

## 📄 Detailed Description

### Background
In Workspace ONE UEM automation workflows, actions such as **Add Tag to Devices**, **Install Internal Application**, and others require users to select entities (e.g., Tags, Applications, Profiles). While configuring these workflows, only the **UUIDs** of selected entities are saved to avoid stale data issues due to name changes.

However, this design has led to **user experience complaints**: when users revisit workflows, they see UUIDs instead of meaningful names, making it difficult to understand what each action is targeting.

### Proposed Solution
Develop a **Chrome Extension** that:
- Detects UUIDs in the workflow editor UI.
- Identifies the entity type (e.g., Tag, Application, Profile).
- Uses Workspace ONE UEM APIs to fetch entity details (like name).
- Displays the resolved name and other relevant metadata inline in the UI.

This will allow users to quickly understand workflow configurations without leaving the page or manually querying the API.

---

## 🔧 Technical Details

### Core Features
- **UUID Detection**: Scan the DOM for UUIDs in known workflow action components.
- **Entity Type Mapping**: Use context or predefined rules to infer entity type (e.g., if UUID appears in "Add Tag to Device", it's a Tag).
- **API Integration**: Call Workspace ONE UEM APIs to resolve UUIDs:
  - Use endpoints like `GET /tags/{uuid}`, `GET /apps/internal/{uuid}`, etc.
  - Handle exceptions like Tags, which may not support direct UUID lookup.
- **UI Enhancement**: Inject resolved names and metadata (e.g., description, type) next to UUIDs using DOM manipulation.

### Authentication
- Support OAuth or API Key-based authentication to access UEM APIs.
- Store credentials securely using Chrome Extension storage APIs.

### Fallback Handling
- For entities like Tags that don’t support direct UUID lookup:
  - Optionally fetch all tags and match UUID locally.
  - Display a warning or fallback message if resolution fails.

### Performance Considerations
- Cache resolved UUIDs locally to reduce API calls.
- Debounce API requests when scanning large workflows.

---

## 📌 Usage Scenarios
- A user opens a workflow with an action like “Add Tag to Device” and sees `UUID: 123e4567-e89b-12d3-a456-426614174000`.
- The extension detects the UUID, identifies it as a Tag, and calls the UEM API.
- It replaces or supplements the UUID with `Tag Name: "Production Devices"` directly in the UI.

---

## ✅ Benefits
- Reduces cognitive load and manual effort for users.
- Improves workflow transparency and maintainability.
- Accelerates troubleshooting and editing workflows.
