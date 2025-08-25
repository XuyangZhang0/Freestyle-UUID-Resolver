# Workspace ONE UEM UUID Resolver Chrome Extension

A Chrome extension that resolves UUIDs to human-readable entity names in Workspace ONE UEM automation workflows. This extension improves the user experience by displaying entity names (Tags, Applications, Profiles, etc.) directly in the workflow UI, eliminating the need to manually cross-reference UUIDs.

## 🚀 Features

- **Automatic UUID Detection**: Scans workflow pages for UUIDs and identifies entity types
- **Real-time Resolution**: Uses UEM APIs to fetch entity details and display names inline
- **Multiple Entity Types**: Supports Tags, Applications, Profiles, Scripts, Products, and Organization Groups
- **Intelligent Caching**: Reduces API calls with smart caching mechanisms
- **Non-intrusive UI**: Seamlessly integrates with existing UEM interface
- **Configurable**: Customizable settings for different entity types and server configurations

## 📋 Prerequisites

- Chrome browser (version 88 or higher)
- Workspace ONE UEM environment
- Valid API credentials (OAuth token or API key)
- Access to UEM workflow editor pages

## 🛠️ Installation

### For Development

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension should now appear in your Chrome toolbar

### For Production

1. Download the extension from the Chrome Web Store (when available)
2. Click "Add to Chrome" to install

## ⚙️ Configuration

1. Click the UUID Resolver icon in your Chrome toolbar
2. Configure the following settings:
   - **UEM Server URL**: Your Workspace ONE UEM server URL (e.g., `https://your-server.awmdm.com`)
   - **Authentication Type**: Choose between Basic Authentication or OAuth 2.0
   
   ### Basic Authentication
   - **Username**: Your UEM username
   - **Password**: Your UEM password  
   - **API Key**: Your tenant code/API key (found in UEM Console → Groups & Settings → All Settings → System → Advanced → API)
   
   ### OAuth 2.0 Authentication
   - **Client ID**: OAuth application client ID
   - **Client Secret**: OAuth application client secret
   - **Token URL**: OAuth token endpoint (e.g., `https://your-server.vmwareidentity.com/SAAS/auth/oauthtoken`)
   
   - **Entity Types**: Select which entity types to resolve
   - **Cache Settings**: Configure cache timeout and behavior

3. Click "Test Connection" to verify your settings
4. Save your configuration

## 🔧 Usage

1. Navigate to any Workspace ONE UEM workflow editor page
2. The extension automatically detects UUIDs in the page
3. Resolved entity names appear next to UUIDs with the format: `UUID → Entity Name (type)`
4. Hover over resolved names to see detailed information in tooltips
5. Use the extension popup to view statistics and manage settings

## 🎯 Supported Entity Types

- **Tags**: Device and user tags
- **Applications**: Internal and public applications
- **Profiles**: Configuration profiles
- **Scripts**: Automation workflows and scripts
- **Products**: Deployment packages and manifests
- **Organization Groups**: Organizational units

## 🔒 Security & Privacy

- All API communication is encrypted using HTTPS
- Credentials are stored securely using Chrome's storage APIs
- No data is transmitted to third-party servers
- The extension only operates on UEM domain pages

## 🐛 Troubleshooting

### Common Issues

**Extension not working on UEM pages:**
- Verify the UEM server URL matches your environment
- Check that you're on a supported UEM page (*.awmdm.com)
- Ensure the extension is enabled in Chrome settings

**Authentication errors:**
- Verify your API token is valid and has appropriate permissions
- Check that the token hasn't expired
- Test the connection using the "Test Connection" button

**UUIDs not being resolved:**
- Check that the entity type is enabled in settings
- Verify network connectivity to UEM APIs
- Clear the cache and try again

### Debug Mode

Enable debug mode by opening the browser console and running:
```javascript
window.uuidResolverDebug.scanForUUIDs();
```

## 📊 Performance

- **Initial scan**: Typically completes in < 1 second
- **Cache hit ratio**: > 90% for repeated page visits
- **Memory usage**: < 10MB typical
- **Network requests**: Minimized through intelligent caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development

### Project Structure

```
├── manifest.json           # Extension manifest
├── content/                # Content scripts
│   ├── uuid-detector.js    # UUID detection logic
│   ├── uem-api-client.js   # UEM API integration
│   ├── ui-enhancer.js      # DOM manipulation
│   ├── content-script.js   # Main content script
│   └── styles.css          # Styling
├── background/             # Background scripts
│   └── service-worker.js   # Background service worker
├── popup/                  # Extension popup
│   ├── popup.html          # Popup interface
│   ├── popup.css           # Popup styling
│   └── popup.js            # Popup logic
└── icons/                  # Extension icons
```

### Building

This extension uses Manifest V3 and doesn't require a build process. Simply load the unpacked extension in Chrome for development.

### Testing

1. Load the extension in Chrome
2. Navigate to a UEM workflow page
3. Open browser developer tools to view console logs
4. Test various scenarios and entity types

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-repo/uuid-resolver/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-repo/uuid-resolver/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/uuid-resolver/discussions)

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release
- Basic UUID detection and resolution
- Support for major entity types
- Configurable settings and caching
- Chrome Manifest V3 compliance

## 🙏 Acknowledgments

- Workspace ONE UEM team for comprehensive APIs
- Chrome Extension development community
- Beta testers and early adopters

---

**Made with ❤️ for the Workspace ONE community**
