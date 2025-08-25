/**
 * UEM API Client - Handles communication with Workspace ONE UEM APIs
 * This version delegates API calls to the background script to avoid CORS issues
 */

class UEMAPIClient {
  constructor() {
    // Caching removed
  }

  /**
   * Initialize the API client
   */
  async initialize() {
    console.log('UEM API Client: Content script client initialized');
  }

  /**
   * Resolve a UUID to entity information via background script
   */
  async resolveUUID(uuid, entityType) {
    console.log(`UEM API Client: Attempting to resolve UUID ${uuid} as type ${entityType}`);

    try {
      console.log(`UEM API Client: Sending resolution request to background script`);
      const response = await chrome.runtime.sendMessage({
        action: 'resolveUUID',
        uuid,
        entityType
      });

      if (response?.success) {
        console.log(`UEM API Client: Successfully resolved ${uuid}:`, response.data);
        return response.data;
      }
      throw new Error(response?.error || 'Unknown error from background script');
    } catch (error) {
      console.error(`UEM API Client: Failed to resolve UUID ${uuid} (type: ${entityType}):`, error);
      return {
        uuid,
        name: `Resolution Failed: ${error.message}`,
        type: entityType,
        error: error.message
      };
    }
  }

  // No-op for API parity
  clearCache() {}
}

// Export for use in other modules
window.UEMAPIClient = UEMAPIClient;
