/**
 * UEM API Client - Handles communication with Workspace ONE UEM APIs
 * This version delegates API calls to the background script to avoid CORS issues
 */

class UEMAPIClient {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Initialize the API client
   */
  async initialize() {
    // No initialization needed for content script version
    console.log('UEM API Client: Content script client initialized');
  }

  /**
   * Resolve a UUID to entity information via background script
   */
  async resolveUUID(uuid, entityType) {
    console.log(`UEM API Client: Attempting to resolve UUID ${uuid} as type ${entityType}`);
    const cacheKey = `${uuid}-${entityType}`;
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      console.log(`UEM API Client: Found cached result for ${uuid}`);
      return cached;
    }

    try {
      console.log(`UEM API Client: Sending resolution request to background script`);
      
      // Send message to background script to handle the API call
      const response = await chrome.runtime.sendMessage({
        action: 'resolveUUID',
        uuid: uuid,
        entityType: entityType
      });

      if (response.success) {
        console.log(`UEM API Client: Successfully resolved ${uuid}:`, response.data);
        // Cache the result
        this.setCachedResult(cacheKey, response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Unknown error from background script');
      }
    } catch (error) {
      console.error(`UEM API Client: Failed to resolve UUID ${uuid} (type: ${entityType}):`, error);
      console.error('UEM API Client: Error details:', {
        message: error.message,
        stack: error.stack,
        uuid: uuid,
        entityType: entityType
      });
      
      return {
        uuid: uuid,
        name: `Resolution Failed: ${error.message}`,
        type: entityType,
        error: error.message
      };
    }
  }

  /**
   * Get cached result if not expired
   */
  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  /**
   * Cache result with timestamp
   */
  setCachedResult(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export for use in other modules
window.UEMAPIClient = UEMAPIClient;
