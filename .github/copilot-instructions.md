<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# UUID Resolver Chrome Extension Instructions

This is a Chrome Extension project for Workspace ONE UEM UUID resolution. When working on this project:

## Core Functionality
- Focus on DOM manipulation to detect UUIDs in workflow pages
- Use Chrome Extension APIs for storage, authentication, and cross-origin requests
- Implement caching strategies to minimize API calls
- Handle various entity types (Tags, Applications, Profiles, etc.)

## API Integration
- Use Workspace ONE UEM REST APIs for entity resolution
- Implement proper error handling for API failures
- Support both OAuth and API key authentication methods
- Cache resolved UUIDs to improve performance

## UI Enhancement
- Inject resolved entity names inline with UUIDs
- Use non-intrusive styling that matches the existing UEM interface
- Provide visual indicators for resolved vs unresolved UUIDs
- Handle loading states gracefully

## Best Practices
- Use Manifest V3 patterns and APIs
- Implement proper content security policies
- Handle permissions and host restrictions appropriately
- Follow Chrome Extension development best practices for performance and security
