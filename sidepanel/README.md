# Side Panel Interface

This directory contains the side panel implementation for the UUID Resolver Chrome Extension.

## Files

- `sidepanel.html` - Side panel UI layout optimized for narrow panel format
- `sidepanel.css` - Responsive styling for the side panel interface  
- `sidepanel.js` - Side panel logic with auto-save and persistence

## Features

### ✅ Persistent Interface
- Stays open while browsing between tabs
- Maintains form state across navigation
- Auto-saves settings every 1.5 seconds after typing stops

### ✅ Real-time Statistics
- Shows live UUID count from current page
- Displays resolution statistics  
- Updates cache hit information

### ✅ Quick Actions
- Refresh UUID resolution on current page
- Clear resolution cache
- Test API connection

### ✅ Complete Settings Management
- Dual authentication support (Basic Auth + OAuth 2.0)
- Entity type filtering
- Visual indicators for unsaved changes
- Connection status display

## Usage

1. **Opening the Side Panel:**
   - Click the extension icon in the toolbar
   - The side panel will open and stay visible while browsing

2. **Configuration:**
   - Enter your UEM server URL
   - Choose authentication type and provide credentials
   - Click "Test Connection" to verify setup
   - Settings auto-save as you type

3. **Monitoring:**
   - Statistics update automatically every 5 seconds
   - Status indicator shows configuration state
   - Use quick action buttons for immediate control

## Technical Details

### Auto-Save Mechanism
- 1.5 second delay after typing stops
- Immediate save on input blur
- Visual indicators for unsaved changes
- Multiple storage fallback methods

### Responsive Design
- Optimized for Chrome's side panel width (typically 320px)
- Graceful handling of very narrow panels
- Scrollable content with custom scrollbars

### Error Handling
- Comprehensive fallbacks for storage operations
- Graceful degradation when content scripts unavailable
- User-friendly error messages
