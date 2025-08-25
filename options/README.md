# Options Page Interface

This directory contains the full-screen options page implementation for the UUID Resolver Chrome Extension.

## Files

- `options.html` - Complete options page with dashboard and comprehensive settings
- `options.css` - Professional styling with responsive design and modern UI
- `options.js` - Full-featured options logic with auto-save, validation, and export

## Features

### ✅ **Full-Screen Interface**
- Professional dashboard layout with statistics
- Comprehensive settings sections
- Responsive design for all screen sizes
- Modern Material Design-inspired UI

### ✅ **Enhanced Functionality**
- **Live Statistics Dashboard** - Shows UUIDs found, resolved, cache hits, success rate
- **Quick Actions Panel** - Test connection, refresh, clear cache, export settings
- **Advanced Settings** - API timeout, concurrent requests, debug mode
- **Settings Export/Import** - Backup and restore configurations
- **Keyboard Shortcuts** - Ctrl/Cmd+S to save, Ctrl/Cmd+T to test

### ✅ **Auto-Save & Persistence**
- Auto-saves settings 2 seconds after typing stops
- Immediate save on input blur
- Visual indicators for unsaved changes
- Multiple storage fallback methods
- Save on page unload

### ✅ **User Experience**
- **Toast Notifications** - Success, error, warning, info messages
- **Visual Status Indicators** - Connection status, save status
- **Form Validation** - Real-time validation with helpful messages
- **Entity Type Cards** - Visual selection with icons and descriptions

## Access Methods

### **1. Click Extension Icon**
- Click the UUID Resolver icon in Chrome toolbar
- Opens options page in new tab

### **2. Context Menu**
- Right-click on any page → "Open UUID Resolver Settings"

### **3. Chrome Extensions Page**
- Go to `chrome://extensions/`
- Find "Workspace ONE UEM UUID Resolver"
- Click "Details" → "Extension options"

### **4. Direct URL**
- Navigate to `chrome-extension://[extension-id]/options/options.html`

## Settings Sections

### **1. Statistics Dashboard**
- Real-time stats from all UEM tabs
- Visual cards showing key metrics
- Success rate calculation

### **2. Server Configuration**
- UEM server URL input
- Authentication type selection
- Connection status indicator

### **3. Authentication**
- **Basic Auth**: Username, password, API key
- **OAuth 2.0**: Client credentials flow
- **Token Management**: Automatic token handling

### **4. General Settings**
- Enable/disable UUID resolution
- Auto-refresh on page load
- Show detailed tooltips
- Cache timeout configuration

### **5. Entity Types**
- Visual cards for each entity type
- Icons and descriptions
- Individual enable/disable controls

### **6. Advanced Settings**
- API timeout configuration
- Max concurrent requests
- Debug mode toggle

## Technical Features

### **Auto-Save Mechanism**
- Debounced saving (2 seconds)
- Multiple storage methods with fallbacks
- Visual feedback for save status
- Keyboard shortcuts for manual save

### **Statistics Integration**
- Queries all active UEM tabs
- Aggregates statistics across tabs
- Updates every 10 seconds
- Handles offline/error states gracefully

### **Export/Import**
- JSON format export
- Excludes sensitive data (passwords, tokens)
- One-click download
- Future: Import functionality

### **Responsive Design**
- Mobile-friendly layout
- Tablet optimization
- Desktop full-screen experience
- Print-friendly styles

## Benefits Over Popup/Side Panel

✅ **No Tab Switching Issues** - Full tab interface, never closes unexpectedly  
✅ **Complete Feature Set** - Room for comprehensive settings and dashboard  
✅ **Better Performance** - No size constraints or memory limitations  
✅ **Professional UX** - Full application-like experience  
✅ **Keyboard Shortcuts** - Power user features  
✅ **Export/Backup** - Enterprise-friendly data management  
✅ **Universal Compatibility** - Works in all Chrome versions
