/**
 * Main Content Script - Orchestrates UUID detection and resolution
 */

(async () => {
  'use strict';

  console.log('UUID Resolver: Content script starting...');

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve);
    });
  }

  console.log('UUID Resolver: DOM ready, initializing...');

  // Add a simple global test function immediately
  window.uuidResolverTest = () => {
    console.log('UUID Resolver: Test function called - extension is working!');
    return 'Extension loaded successfully!';
  };

  // Initialize components
  const apiClient = new UEMAPIClient();
  const uuidDetector = new UUIDDetector();
  const uiEnhancer = new UIEnhancer(apiClient);

  // Initialize API client
  await apiClient.initialize();

  // Check if extension is enabled for this page
  const settings = await getExtensionSettings();
  if (!settings.enabled) {
    console.log('UUID Resolver: Extension disabled for this page');
    return;
  }

  console.log('UUID Resolver: Starting UUID detection and resolution');
  console.log('UUID Resolver: Current URL:', window.location.href);
  console.log('UUID Resolver: Document ready state:', document.readyState);
  console.log('UUID Resolver: Document body:', document.body);
  console.log('UUID Resolver: Extension enabled:', settings.enabled);

  // Initial scan for UUIDs
  performInitialScan();

  // Also scan after a delay to catch dynamically loaded content
  setTimeout(() => {
    console.log('UUID Resolver: Performing delayed scan for dynamic content...');
    performInitialScan();
  }, 3000);

  // Additional longer delay for Angular apps
  setTimeout(() => {
    console.log('UUID Resolver: Performing extended delay scan for Angular content...');
    performInitialScan();
  }, 5000);

  // Set up continuous monitoring
  setupContinuousMonitoring();

  // NEW: Set up advanced Angular monitoring for programmatic value changes
  uuidDetector.setupAdvancedAngularMonitoring();

  // NEW: Set up ultra-aggressive monitoring for _uuid0 elements in action cards
  uuidDetector.setupUltraAggressiveUuid0Monitoring();

  // NEW: Set up enhanced detection for readonly Angular inputs
  uuidDetector.setupReadonlyAngularInputDetection();

  // NEW: Set up ultra-aggressive Angular JavaScript value detection
  uuidDetector.setupAngularJavaScriptValueDetection();

  // Set up message handling
  setupMessageHandling();

  /**
   * Perform initial scan of the page
   */
  async function performInitialScan() {
    try {
      console.log('UUID Resolver: Starting initial scan...');
      const detectedUUIDs = uuidDetector.scanForUUIDs();
      console.log(`UUID Resolver: Found ${detectedUUIDs.length} UUIDs on initial scan`);
      console.log('UUID Resolver: Detected UUIDs:', detectedUUIDs);
      
      if (detectedUUIDs.length > 0) {
        await uiEnhancer.enhanceUI(detectedUUIDs);
        
        // Notify background script
        chrome.runtime.sendMessage({
          action: 'uuidsDetected',
          count: detectedUUIDs.length,
          types: [...new Set(detectedUUIDs.map(u => u.entityType))]
        });
      } else {
        console.log('UUID Resolver: No UUIDs found on page');
      }
    } catch (error) {
      console.error('UUID Resolver: Error during initial scan:', error);
    }
  }

  // Set up continuous monitoring for dynamic content
  function setupContinuousMonitoring() {
    // Start watching for DOM changes
    const observer = uuidDetector.startWatching();
    
    // Start Angular polling for dynamic content
    const angularPollInterval = uuidDetector.setupAngularPolling();

    // Listen for custom events from UUID detector
    window.addEventListener('uuidsDetected', async (event) => {
      const newUUIDs = event.detail;
      console.log(`UUID Resolver: Found ${newUUIDs.length} new UUIDs from mutation observer`);
      
      if (newUUIDs.length > 0) {
        await uiEnhancer.enhanceUI(newUUIDs);
        
        // Notify background script
        chrome.runtime.sendMessage({
          action: 'uuidsDetected',
          count: newUUIDs.length,
          types: [...new Set(newUUIDs.map(u => u.entityType))]
        });
      }
    });

    // Set up more frequent scanning for Angular content
    const frequentScanInterval = setInterval(() => {
      console.log('UUID Resolver: Performing frequent Angular scan...');
      const foundUUIDs = [];
      uuidDetector.scanAngularDynamicInputs(foundUUIDs);
      uuidDetector.scanReadonlyInputs(foundUUIDs);
      
      if (foundUUIDs.length > 0) {
        console.log(`UUID Resolver: Frequent scan found ${foundUUIDs.length} new UUIDs`);
        uiEnhancer.enhanceUI(foundUUIDs);
      }
    }, 5000); // Every 5 seconds

    // Also listen for page visibility changes (when user switches tabs/windows)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('UUID Resolver: Page became visible, performing fresh scan...');
        setTimeout(() => {
          // Clear detected UUIDs to allow re-detection
          uuidDetector.clearDetectedUUIDs();
          performInitialScan();
        }, 1000);
      }
    });

    // Listen for focus events on the window (when user clicks back into the page)
    window.addEventListener('focus', () => {
      console.log('UUID Resolver: Window gained focus, performing fresh scan...');
      setTimeout(() => {
        uuidDetector.clearDetectedUUIDs();
        performInitialScan();
      }, 500);
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      observer.disconnect();
      clearInterval(frequentScanInterval);
      if (angularPollInterval) {
        clearInterval(angularPollInterval);
      }
    });
  }

  /**
   * Set up message handling from popup and background script
   */
  function setupMessageHandling() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('UUID Resolver: Received message in content script:', message);
      
      switch (message.action) {
        case 'getStatistics':
          const stats = uiEnhancer.getStatistics();
          sendResponse({ success: true, data: stats });
          break;

        case 'refreshResolution':
          performRefresh();
          sendResponse({ success: true });
          break;

        case 'clearCache':
          apiClient.clearCache();
          sendResponse({ success: true });
          break;

        case 'toggleExtension':
          toggleExtension(message.enabled);
          sendResponse({ success: true });
          break;

        case 'resolveSpecificUUID':
          console.log('UUID Resolver: Handling resolveSpecificUUID for:', message.uuid);
          resolveSpecificUUID(message.uuid);
          sendResponse({ success: true });
          break;

        case 'resolveFocusedElementUUID':
          console.log('UUID Resolver: Handling resolveFocusedElementUUID');
          resolveFocusedElementUUID();
          sendResponse({ success: true });
          break;

        default:
          console.log('UUID Resolver: Unknown action:', message.action);
          sendResponse({ success: false, error: 'Unknown action' });
      }
      
      return true; // Keep message channel open for async response
    });
  }

  /**
   * Refresh all UUID resolutions
   */
  async function performRefresh() {
    try {
      // Clear existing enhancements
      uiEnhancer.removeAllEnhancements();
      
      // Clear cache
      apiClient.clearCache();
      
      // Perform fresh scan
      await performInitialScan();
      
      console.log('UUID Resolver: Refresh completed');
    } catch (error) {
      console.error('UUID Resolver: Error during refresh:', error);
    }
  }

  /**
   * Toggle extension on/off
   */
  function toggleExtension(enabled) {
    if (enabled) {
      console.log('UUID Resolver: Extension enabled');
      performInitialScan();
    } else {
      console.log('UUID Resolver: Extension disabled');
      uiEnhancer.removeAllEnhancements();
    }
  }

  /**
   * Resolve UUID from the currently focused element (input field with cursor)
   */
  async function resolveFocusedElementUUID() {
    try {
      const activeElement = document.activeElement;
      console.log('UUID Resolver: Checking focused element:', activeElement);
      
      if (!activeElement) {
        showTemporaryNotification('', null, 'No focused element found');
        return;
      }
      
      // Check if the focused element is an input with a UUID
      if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        const value = activeElement.value;
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const match = value.match(uuidRegex);
        
        if (match) {
          const uuid = match[0];
          console.log(`UUID Resolver: Found UUID in focused input: ${uuid}`);
          await resolveSpecificUUID(uuid);
          return;
        }
      }
      
      // Check if the focused element contains UUID in text content
      const textContent = activeElement.textContent || activeElement.innerText || '';
      const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
      const match = textContent.match(uuidRegex);
      
      if (match) {
        const uuid = match[0];
        console.log(`UUID Resolver: Found UUID in focused element text: ${uuid}`);
        await resolveSpecificUUID(uuid);
        return;
      }
      
      // Check parent elements for UUIDs
      let parent = activeElement.parentElement;
      let depth = 0;
      while (parent && depth < 5) {
        const parentText = parent.textContent || '';
        const parentMatch = parentText.match(uuidRegex);
        if (parentMatch) {
          const uuid = parentMatch[0];
          console.log(`UUID Resolver: Found UUID in parent element: ${uuid}`);
          await resolveSpecificUUID(uuid);
          return;
        }
        parent = parent.parentElement;
        depth++;
      }
      
      showTemporaryNotification('', null, 'No UUID found in focused element or nearby');
      
    } catch (error) {
      console.error('UUID Resolver: Error resolving focused element UUID:', error);
      showTemporaryNotification('', null, 'Error checking focused element');
    }
  }

  /**
   * Resolve a specific UUID from context menu or manual trigger
   */
  async function resolveSpecificUUID(uuid) {
    console.log(`UUID Resolver: resolveSpecificUUID called with: ${uuid}`);
    
    try {
      console.log(`UUID Resolver: Manually resolving UUID: ${uuid}`);
      
      // Try to find the element containing this UUID to get context
      const elementContext = findElementWithUUID(uuid);
      let entityType = 'application'; // default
      
      if (elementContext) {
        // Try to infer entity type from the element context
        entityType = uuidDetector.inferEntityTypeFromElement(elementContext.element);
        console.log(`UUID Resolver: Inferred entity type: ${entityType} from element context`);
      } else {
        // Try to infer from page context
        entityType = inferEntityTypeFromPageContext(uuid);
        console.log(`UUID Resolver: Inferred entity type: ${entityType} from page context`);
      }
      
      // Create a temporary UUID data object
      const uuidData = {
        uuid: uuid,
        element: elementContext?.element || document.body,
        entityType: entityType,
        context: 'manual-resolve',
        source: 'context-menu'
      };
      
      console.log('UUID Resolver: Created UUID data:', uuidData);
      
      // Resolve and display result
      await uiEnhancer.enhanceUI([uuidData]);
      
      // Also try to show a temporary notification
      showTemporaryNotification(uuid, entityType);
      
      console.log(`UUID Resolver: Successfully resolved UUID: ${uuid} as ${entityType}`);
      
    } catch (error) {
      console.error('UUID Resolver: Error resolving specific UUID:', error);
      showTemporaryNotification(uuid, null, error.message);
    }
  }

  /**
   * Find element containing the specified UUID
   */
  function findElementWithUUID(uuid) {
    // First check input elements
    const inputs = document.querySelectorAll('input, textarea, select');
    for (const input of inputs) {
      if (input.value && input.value.includes(uuid)) {
        return { element: input, location: 'input-value' };
      }
    }
    
    // Check data attributes
    const elementsWithDataAttrs = document.querySelectorAll('[data-uuid], [data-id], [id]');
    for (const element of elementsWithDataAttrs) {
      const dataUuid = element.getAttribute('data-uuid');
      const dataId = element.getAttribute('data-id');
      const id = element.getAttribute('id');
      
      if ((dataUuid && dataUuid.includes(uuid)) || 
          (dataId && dataId.includes(uuid)) || 
          (id && id.includes(uuid))) {
        return { element: element, location: 'data-attribute' };
      }
    }
    
    // Check text content
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.includes(uuid)) {
        return { element: node.parentElement, location: 'text-content' };
      }
    }
    
    return null;
  }

  /**
   * Infer entity type from page context when no specific element context is available
   */
  function inferEntityTypeFromPageContext(uuid) {
    const pageText = document.body.textContent.toLowerCase();
    const pageTitle = document.title.toLowerCase();
    const url = window.location.href.toLowerCase();
    
    // Check for entity type clues in the page
    if (pageText.includes('tag') || pageTitle.includes('tag') || url.includes('tag')) {
      return 'tag';
    }
    if (pageText.includes('profile') || pageTitle.includes('profile') || url.includes('profile')) {
      return 'profile';
    }
    if (pageText.includes('script') || pageTitle.includes('script') || url.includes('script') || url.includes('workflow')) {
      return 'script';
    }
    if (pageText.includes('product') || pageTitle.includes('product') || url.includes('product')) {
      return 'product';
    }
    if (pageText.includes('organization') || pageTitle.includes('organization') || url.includes('organization')) {
      return 'organization-group';
    }
    
    // Default to application
    return 'application';
  }

  /**
   * Show a temporary notification about the resolution result
   */
  function showTemporaryNotification(uuid, entityType, error = null) {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${error ? '#f44336' : '#4caf50'};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      max-width: 400px;
      word-break: break-all;
    `;
    
    if (error) {
      notification.textContent = `Failed to resolve UUID: ${uuid.substring(0, 8)}... - ${error}`;
    } else {
      notification.textContent = `Resolving UUID: ${uuid.substring(0, 8)}... as ${entityType}`;
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  /**
   * Get extension settings from storage
   */
  async function getExtensionSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({
        enabled: true,
        autoRefresh: true,
        cacheTimeout: 300000 // 5 minutes
      }, (result) => {
        resolve(result);
      });
    });
  }

  // Expose global functions for debugging
  window.uuidResolverDebug = {
    scanForUUIDs: () => {
      console.log('=== Manual UUID Scan ===');
      const results = uuidDetector.scanForUUIDs();
      console.log('Scan results:', results);
      return results;
    },
    getStatistics: () => uiEnhancer.getStatistics(),
    refresh: performRefresh,
    clearCache: () => apiClient.clearCache(),
    getSettings: getExtensionSettings,
    testApiClient: async () => {
      console.log('=== API Client Test ===');
      try {
        await apiClient.initialize();
        console.log('API Client initialized successfully');
        
        // Test with a sample UUID
        const testUuid = 'ff645018-de64-43cb-a80c-d63da9422c82';
        console.log(`Testing resolution of UUID: ${testUuid}`);
        const result = await apiClient.resolveUUID(testUuid, 'unknown');
        console.log('Resolution result:', result);
        return result;
      } catch (error) {
        console.error('API Client test failed:', error);
        return { error: error.message };
      }
    },
    findAngularInputs: () => {
      console.log('=== Angular Input Search ===');
      
      // Look for inputs with Angular-specific classes
      const angularInputs = document.querySelectorAll('input.clr-input, input[class*="ng-"], input[readonly]');
      console.log('Angular inputs found:', angularInputs.length);
      
      angularInputs.forEach((input, i) => {
        console.log(`Angular Input ${i}:`, {
          value: input.value,
          className: input.className,
          type: input.type,
          readonly: input.readonly,
          hasUuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value)
        });
      });
      
      // Specifically look for the pattern you mentioned
      const specificPattern = document.querySelectorAll('input.clr-input.ng-untouched.ng-pristine.ng-valid.ng-star-inserted[readonly]');
      console.log('Inputs matching specific pattern:', specificPattern.length);
      
      specificPattern.forEach((input, i) => {
        console.log(`Pattern Input ${i}:`, {
          value: input.value,
          parentClasses: input.parentElement?.className,
          hasUuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value)
        });
      });

      // Look for UUID labels
      console.log('=== UUID Label Search ===');
      const uuidLabels = document.querySelectorAll('label');
      const relevantLabels = Array.from(uuidLabels).filter(label => 
        label.textContent.toLowerCase().includes('uuid') || 
        label.textContent.toLowerCase().includes('tag') ||
        label.textContent.toLowerCase().includes('id')
      );
      console.log('UUID-related labels:', relevantLabels.length);
      
      relevantLabels.forEach((label, i) => {
        console.log(`UUID Label ${i}: "${label.textContent}"`);
        
        // Find inputs near this label
        let nextElement = label.nextElementSibling;
        let searchDepth = 0;
        
        while (nextElement && searchDepth < 5) {
          const inputs = nextElement.querySelectorAll('input');
          if (inputs.length > 0) {
            inputs.forEach(input => {
              console.log(`  -> Input near label: value="${input.value}", classes="${input.className}"`);
            });
            break;
          }
          nextElement = nextElement.nextElementSibling;
          searchDepth++;
        }
      });
      
      return {
        angularInputs: angularInputs.length,
        specificPattern: specificPattern.length,
        uuidLabels: relevantLabels.length,
        inputs: Array.from(angularInputs).map(input => ({
          value: input.value,
          hasUuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value)
        }))
      };
    },
    scanSidePanels: () => {
      console.log('=== Manual Side Panel Scan ===');
      const sidePanelUUIDs = uuidDetector.scanSidePanelContent();
      console.log('Side panel scan results:', sidePanelUUIDs);
      
      // Trigger UI enhancement for found UUIDs
      if (sidePanelUUIDs.length > 0) {
        uiEnhancer.enhanceUI(sidePanelUUIDs);
      }
      
      return sidePanelUUIDs;
    },
    forceRefreshScan: () => {
      console.log('=== Force Refresh Scan ===');
      // Clear detected UUIDs and perform fresh scan
      uuidDetector.clearDetectedUUIDs();
      const results = uuidDetector.scanForUUIDs();
      console.log('Force refresh results:', results);
      
      // Trigger UI enhancement for found UUIDs
      if (results.length > 0) {
        uiEnhancer.enhanceUI(results);
      }
      
      return results;
    },
    checkPageContent: () => {
      console.log('=== Page Content Check ===');
      console.log('Document body text (first 500 chars):', document.body?.textContent?.substring(0, 500));
      console.log('All text nodes count:', document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT).nextNode() ? 'Found text nodes' : 'No text nodes');
      const allText = document.body?.textContent || '';
      const uuidMatches = allText.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
      console.log('Raw UUID matches in page text:', uuidMatches);
      
      // Check for the specific UUID from the URL
      const urlUuid = 'ff645018-de64-43cb-a80c-d63da9422c82';
      console.log('URL UUID found in page text:', allText.includes(urlUuid));
      
      // Check input fields specifically
      console.log('=== Input Field Check ===');
      const inputElements = document.querySelectorAll('input, textarea, select');
      console.log('Total input elements:', inputElements.length);
      
      const inputsWithValues = Array.from(inputElements).filter(input => input.value && input.value.trim().length > 0);
      console.log('Inputs with values:', inputsWithValues.length);
      
      // Log first few inputs with values to debug
      inputsWithValues.slice(0, 10).forEach((input, i) => {
        console.log(`Input ${i}: value="${input.value}", class="${input.className}", type="${input.type}"`);
      });
      
      const inputsWithUUIDs = inputsWithValues.filter(input => {
        return /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value);
      });
      console.log('Inputs with UUID-like values:', inputsWithUUIDs.length, inputsWithUUIDs);
      
      // Check specifically for readonly inputs (as mentioned in the pattern)
      const readonlyInputs = document.querySelectorAll('input[readonly]');
      console.log('Readonly inputs:', readonlyInputs.length);
      
      // Log readonly inputs to debug
      Array.from(readonlyInputs).slice(0, 10).forEach((input, i) => {
        console.log(`Readonly Input ${i}: value="${input.value}", class="${input.className}"`);
      });
      
      const readonlyWithUUIDs = Array.from(readonlyInputs).filter(input => {
        return input.value && /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value);
      });
      console.log('Readonly inputs with UUIDs:', readonlyWithUUIDs.length, readonlyWithUUIDs);
      
      // Check if any input contains the URL UUID specifically
      const inputsWithUrlUuid = Array.from(inputElements).filter(input => input.value && input.value.includes(urlUuid));
      console.log('Inputs containing URL UUID:', inputsWithUrlUuid.length, inputsWithUrlUuid);
      
      // Check attributes
      console.log('=== Attribute Check ===');
      const elementsWithIds = document.querySelectorAll('[id*="ff645018"], [data-id*="ff645018"], [data-uuid*="ff645018"]');
      console.log('Elements with UUID-like attributes:', elementsWithIds);
      
      // Check for any UUID-like strings in attributes
      const allElements = Array.from(document.querySelectorAll('*'));
      const elementsWithUUIDs = allElements.filter(el => {
        const attrs = ['id', 'data-id', 'data-uuid', 'data-key', 'href', 'value'];
        return attrs.some(attr => {
          const value = el.getAttribute(attr);
          return value && /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(value);
        });
      });
      console.log('Elements with UUID-like attributes (any):', elementsWithUUIDs.length, elementsWithUUIDs.slice(0, 5));
      
      return { 
        hasBody: !!document.body, 
        textLength: allText.length, 
        uuidMatches: uuidMatches,
        urlUuidInText: allText.includes(urlUuid),
        inputElementsTotal: inputElements.length,
        inputsWithValues: inputsWithValues.length,
        inputsWithUUIDs: inputsWithUUIDs.length,
        readonlyInputs: readonlyInputs.length,
        readonlyWithUUIDs: readonlyWithUUIDs.length,
        inputsWithUrlUuid: inputsWithUrlUuid.length,
        elementsWithUUIDs: elementsWithUUIDs.length
      };
    },
    resolveUUID: async (uuid) => {
      console.log('=== Manual UUID Resolution ===');
      try {
        await resolveSpecificUUID(uuid);
        return 'Resolution attempted - check console and page for results';
      } catch (error) {
        console.error('Manual resolution error:', error);
        return 'Resolution failed: ' + error.message;
      }
    },
    resolveFocused: async () => {
      console.log('=== Focused Element Resolution ===');
      try {
        await resolveFocusedElementUUID();
        return 'Focused element resolution attempted - check console and page for results';
      } catch (error) {
        console.error('Focused resolution error:', error);
        return 'Focused resolution failed: ' + error.message;
      }
    },
    testContextMenu: () => {
      console.log('=== Testing Context Menu Functionality ===');
      // Simulate the context menu functionality
      const selection = window.getSelection().toString();
      if (selection) {
        console.log('Current selection:', selection);
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const match = selection.match(uuidRegex);
        if (match) {
          console.log('Found UUID in selection:', match[0]);
          resolveSpecificUUID(match[0]);
        } else {
          console.log('No UUID found in selection');
        }
      } else {
        console.log('No text selected');
        console.log('Active element:', document.activeElement);
        resolveFocusedElementUUID();
      }
    },
    showNotification: (message) => {
      showTemporaryNotification('test-uuid', 'tag', message);
    },
    forceScanPage: async () => {
      console.log('=== Force Scanning Entire Page ===');
      try {
        // Clear previous detections
        uuidDetector.clearDetectedUUIDs();
        
        // Force scan all elements
        const foundUUIDs = uuidDetector.forceScanAllElements();
        console.log('Force scan results:', foundUUIDs);
        
        // Enhance UI with found UUIDs
        if (foundUUIDs.length > 0) {
          await uiEnhancer.enhanceUI(foundUUIDs);
          return `Found and processed ${foundUUIDs.length} UUIDs`;
        } else {
          return 'No UUIDs found in force scan';
        }
      } catch (error) {
        console.error('Force scan error:', error);
        return 'Force scan failed: ' + error.message;
      }
    },
    bruteForceUUIDScan: () => {
      console.log('=== BRUTE FORCE UUID SCAN ===');
      console.log('This will find ALL UUIDs anywhere on the page');
      
      try {
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
        const results = [];
        
        // 1. Scan entire page text
        const pageText = document.body.textContent || '';
        const pageMatches = pageText.match(uuidRegex);
        if (pageMatches) {
          console.log(`Found ${pageMatches.length} UUIDs in page text:`, pageMatches);
          results.push(...pageMatches.map(uuid => ({ uuid, source: 'page-text' })));
        }
        
        // 2. Scan ALL elements
        const allElements = document.querySelectorAll('*');
        console.log(`Scanning ${allElements.length} elements...`);
        
        allElements.forEach((el, index) => {
          if (index % 1000 === 0) console.log(`Scanned ${index} elements...`);
          
          const sources = [
            { name: 'textContent', value: el.textContent },
            { name: 'innerText', value: el.innerText },
            { name: 'innerHTML', value: el.innerHTML },
            { name: 'value', value: el.value },
            { name: 'data-value', value: el.getAttribute('data-value') },
            { name: 'data-uuid', value: el.getAttribute('data-uuid') },
            { name: 'id', value: el.id },
            { name: 'title', value: el.title },
            { name: 'placeholder', value: el.placeholder }
          ];
          
          sources.forEach(source => {
            if (source.value) {
              const matches = source.value.match(uuidRegex);
              if (matches) {
                matches.forEach(uuid => {
                  if (!results.find(r => r.uuid === uuid)) {
                    console.log(`Found UUID: ${uuid} in element ${el.tagName} via ${source.name}`);
                    results.push({
                      uuid,
                      source: `element-${source.name}`,
                      element: el,
                      tagName: el.tagName,
                      className: el.className,
                      value: source.value.substring(0, 100)
                    });
                  }
                });
              }
            }
          });
        });
        
        console.log(`BRUTE FORCE SCAN COMPLETE: Found ${results.length} unique UUIDs`);
        console.table(results);
        
        // Try to resolve the first few UUIDs found
        if (results.length > 0) {
          console.log('Attempting to resolve first UUID found...');
          const firstUuid = results[0].uuid;
          uuidResolverDebug.resolveUUID(firstUuid);
        }
        
        return results;
      } catch (error) {
        console.error('Brute force scan error:', error);
        return [];
      }
    },
    testSpecificUUID: async () => {
      console.log('=== TESTING SPECIFIC UUID ===');
      const testUUID = '996f412d-230f-40b2-9775-a8e2bb9a05ca';
      
      try {
        console.log('Testing UUID resolution for:', testUUID);
        
        // Find the element containing this UUID
        const inputs = document.querySelectorAll('input');
        let targetElement = null;
        
        for (const input of inputs) {
          if (input.value === testUUID) {
            targetElement = input;
            console.log('Found target element:', input);
            break;
          }
        }
        
        if (!targetElement) {
          console.log('Target element not found, using body');
          targetElement = document.body;
        }
        
        // Create UUID data object
        const uuidData = {
          uuid: testUUID,
          element: targetElement,
          entityType: 'tag',
          context: 'manual-test',
          source: 'test-function'
        };
        
        console.log('Created UUID data:', uuidData);
        
        // Test UI enhancement directly
        console.log('Testing UI enhancement...');
        await uiEnhancer.enhanceUI([uuidData]);
        
        console.log('UI enhancement completed');
        return 'Test completed - check for resolution overlay';
        
      } catch (error) {
        console.error('Test error:', error);
        return 'Test failed: ' + error.message;
      }
    },
    testAngularInputs: () => {
      console.log('=== TESTING ANGULAR INPUTS ===');
      
      // Test specific Angular input pattern you mentioned
      const specificPattern = 'input.clr-input.ng-pristine.ng-valid.ng-star-inserted.ng-touched[readonly]';
      const specificInputs = document.querySelectorAll(specificPattern);
      console.log(`Found ${specificInputs.length} inputs matching your specific pattern`);
      
      specificInputs.forEach((input, i) => {
        console.log(`Angular Input ${i}:`, {
          value: input.value,
          className: input.className,
          readonly: input.readonly,
          hasUuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value)
        });
        
        if (input.value) {
          console.log(`Input ${i} full value: "${input.value}"`);
        }
      });
      
      // Test all readonly inputs
      const allReadonly = document.querySelectorAll('input[readonly]');
      console.log(`Found ${allReadonly.length} readonly inputs total`);
      
      allReadonly.forEach((input, i) => {
        if (input.value && input.value.trim()) {
          console.log(`Readonly Input ${i}: "${input.value}" (classes: ${input.className})`);
          
          const hasUuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value);
          if (hasUuid) {
            console.log(`🎯 FOUND UUID in readonly input ${i}:`, input.value);
          }
        }
      });
      
      // Force Angular scan
      console.log('Running Angular dynamic input scan...');
      const foundUUIDs = [];
      uuidDetector.scanAngularDynamicInputs(foundUUIDs);
      console.log('Angular scan results:', foundUUIDs);
      
      return {
        specificPattern: specificInputs.length,
        allReadonly: allReadonly.length,
        foundUUIDs: foundUUIDs.length
      };
    },
    forceAngularScan: async () => {
      console.log('=== FORCE ANGULAR SCAN ===');
      
      try {
        // Clear previous detections
        uuidDetector.clearDetectedUUIDs();
        
        // Force Angular-specific scanning
        const foundUUIDs = [];
        uuidDetector.scanAngularDynamicInputs(foundUUIDs);
        uuidDetector.scanReadonlyInputs(foundUUIDs);
        
        console.log('Force Angular scan results:', foundUUIDs);
        
        // Enhance UI with found UUIDs
        if (foundUUIDs.length > 0) {
          await uiEnhancer.enhanceUI(foundUUIDs);
          return `Found and processed ${foundUUIDs.length} UUIDs from Angular scan`;
        } else {
          return 'No UUIDs found in Angular scan';
        }
      } catch (error) {
        console.error('Force Angular scan error:', error);
        return 'Force Angular scan failed: ' + error.message;
      }
    },
    testLookupVariableInputs: () => {
      console.log('=== TESTING LOOKUP VARIABLE INPUTS ===');
      
      // Test specifically for lookup-variable-input pattern
      const lookupInputs = document.querySelectorAll('input.lookup-variable-input');
      console.log(`Found ${lookupInputs.length} lookup-variable-input elements`);
      
      lookupInputs.forEach((input, i) => {
        console.log(`Lookup Input ${i}:`, {
          id: input.id,
          value: input.value,
          className: input.className,
          placeholder: input.placeholder,
          name: input.name,
          readonly: input.readonly,
          hasUuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value)
        });
        
        if (input.value) {
          console.log(`Lookup Input ${i} full value: "${input.value}"`);
          
          // Test entity type inference
          const uuid = input.value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
          if (uuid) {
            const entityType = uuidDetector.inferEntityTypeFromAngularInput(input, uuid[0]);
            console.log(`Inferred entity type for ${uuid[0]}: ${entityType}`);
          }
        }
      });
      
      // Test inputs with UUID-related IDs
      const uuidIdInputs = document.querySelectorAll('input[id*="uuid"], input[id*="UUID"]');
      console.log(`Found ${uuidIdInputs.length} inputs with UUID-related IDs`);
      
      uuidIdInputs.forEach((input, i) => {
        console.log(`UUID ID Input ${i}:`, {
          id: input.id,
          value: input.value,
          className: input.className,
          placeholder: input.placeholder,
          hasUuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value)
        });
      });
      
      // NEW: Test clrinput inputs
      const clrInputs = document.querySelectorAll('input[clrinput]');
      console.log(`Found ${clrInputs.length} inputs with clrinput attribute`);
      
      clrInputs.forEach((input, i) => {
        console.log(`ClrInput ${i}:`, {
          id: input.id,
          value: input.value,
          className: input.className,
          placeholder: input.placeholder,
          hasClrInput: input.hasAttribute('clrinput'),
          hasUuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value)
        });
        
        if (input.value) {
          const uuid = input.value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
          if (uuid) {
            const entityType = uuidDetector.inferEntityTypeFromAngularInput(input, uuid[0]);
            console.log(`ClrInput ${i} entity type for ${uuid[0]}: ${entityType}`);
          }
        }
      });
      
      // NEW: Test resource_uuid specifically
      const resourceUuidInputs = document.querySelectorAll('input[id*="resource_uuid"]');
      console.log(`Found ${resourceUuidInputs.length} resource_uuid inputs`);
      
      resourceUuidInputs.forEach((input, i) => {
        console.log(`Resource UUID Input ${i}:`, {
          id: input.id,
          value: input.value,
          className: input.className,
          placeholder: input.placeholder,
          hasUuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value)
        });
      });
      
      // Force scan these specific types
      const foundUUIDs = [];
      uuidDetector.scanAngularDynamicInputs(foundUUIDs);
      
      return {
        lookupInputs: lookupInputs.length,
        uuidIdInputs: uuidIdInputs.length,
        clrInputs: clrInputs.length,
        resourceUuidInputs: resourceUuidInputs.length,
        foundUUIDs: foundUUIDs.length,
        foundDetails: foundUUIDs
      };
    },
    
    testUndefinedResourceInputs: () => {
      console.log('=== TESTING UNDEFINED-RESOURCE UUID INPUTS ===');
      
      // Test the exact pattern we're seeing
      const patterns = [
        'input[id^="undefined-resource_uuid"]',
        'input[id*="undefined-resource_uuid"]', 
        'input[clrinput][id*="resource_uuid"]',
        'input[placeholder*="The workflow UUID"]',
        'input[clrinput][placeholder*="workflow"]',
        // NEW: Angular component specific selectors
        'dpa-go-connector-action-card input[clrinput]',
        'dpa-automation-connector-action-settings-editor input[clrinput]',
        'dpa-default-form-field input[clrinput]',
        'clr-input-container input[clrinput]'
      ];
      
      patterns.forEach(pattern => {
        const inputs = document.querySelectorAll(pattern);
        console.log(`Pattern "${pattern}": Found ${inputs.length} inputs`);
        
        inputs.forEach((input, i) => {
          console.log(`🎯 UNDEFINED-RESOURCE Input ${i}:`, {
            id: input.id,
            value: input.value,
            placeholder: input.placeholder,
            className: input.className,
            clrinput: input.hasAttribute('clrinput'),
            type: input.type,
            hasUuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value),
            parentComponent: input.closest('dpa-go-connector-action-card') ? 'connector-action-card' : 'other'
          });
          
          // Check if input is in a radio button form
          const lookupForm = input.closest('dpa-lookup-form');
          if (lookupForm) {
            const radioButtons = lookupForm.querySelectorAll('input[type="radio"]');
            console.log(`🎯 Input ${input.id} is in lookup form with ${radioButtons.length} radio buttons:`);
            radioButtons.forEach((radio, radioIndex) => {
              console.log(`  Radio ${radioIndex}: id=${radio.id}, checked=${radio.checked}, label="${radio.nextElementSibling?.textContent?.trim()}"`);
            });
          }
          
          // Test if this input would be detected
          if (input.value) {
            const uuid = input.value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            if (uuid) {
              const entityType = uuidDetector.inferEntityTypeFromAngularInput(input, uuid[0]);
              console.log(`🎯 Would detect UUID ${uuid[0]} as type: ${entityType}`);
            }
          }
        });
      });
      
      // NEW: Test radio button interaction
      console.log('=== TESTING RADIO BUTTON INTERACTIONS ===');
      const lookupForms = document.querySelectorAll('dpa-lookup-form');
      console.log(`Found ${lookupForms.length} lookup forms`);
      
      lookupForms.forEach((form, formIndex) => {
        const radioButtons = form.querySelectorAll('input[type="radio"]');
        console.log(`Lookup form ${formIndex} has ${radioButtons.length} radio buttons`);
        
        // Try to activate "Enter custom value" mode (usually the second radio)
        const customValueRadio = Array.from(radioButtons).find(radio => radio.id.includes('lookup1'));
        if (customValueRadio) {
          console.log(`🎯 Found "Enter custom value" radio: ${customValueRadio.id}`);
          console.log(`Current state: checked=${customValueRadio.checked}`);
          
          // Simulate clicking the custom value radio if not already selected
          if (!customValueRadio.checked) {
            console.log(`🎯 Activating custom value mode...`);
            customValueRadio.click();
            
            setTimeout(() => {
              const associatedInput = form.querySelector('input[clrinput]');
              if (associatedInput) {
                console.log(`🎯 Custom value input now available: ${associatedInput.id}`);
                console.log(`Input state: disabled=${associatedInput.disabled}, readonly=${associatedInput.readonly}`);
              }
            }, 100);
          }
        }
      });
      
      // Force the undefined resource UUID scan
      const foundUUIDs = [];
      uuidDetector.scanUndefinedResourceUuidInputs(foundUUIDs);
      
      return {
        patterns: patterns.length,
        lookupForms: lookupForms.length,
        foundUUIDs: foundUUIDs.length,
        details: foundUUIDs
      };
    },
    
    testAdvancedAngularMonitoring: () => {
      console.log('=== TESTING ADVANCED ANGULAR MONITORING ===');
      
      // Set up advanced monitoring on specific input
      const targetInput = document.querySelector('input[id*="resource_uuid"]');
      if (targetInput) {
        console.log(`🎯 Found target input: ${targetInput.id}`);
        console.log(`Current value: "${targetInput.value}"`);
        
        // Set up advanced monitoring
        uuidDetector.setupAngularValueMonitoring(targetInput);
        
        // Test programmatic value setting
        console.log('🎯 Testing programmatic value setting...');
        
        // Simulate Angular setting a UUID value
        const testUuid = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
        
        setTimeout(() => {
          console.log(`🎯 Setting test UUID: ${testUuid}`);
          targetInput.value = testUuid;
          
          // Trigger various events to simulate Angular
          ['input', 'change', 'blur'].forEach(eventType => {
            const event = new Event(eventType, { bubbles: true });
            targetInput.dispatchEvent(event);
          });
          
          // Also set Angular-specific attributes
          targetInput.setAttribute('ng-reflect-model', testUuid);
          targetInput.setAttribute('data-value', testUuid);
          
        }, 1000);
        
        return `Advanced monitoring set up for ${targetInput.id}. Test UUID will be set in 1 second.`;
      } else {
        console.log('🎯 No target input found');
        
        // Still set up global monitoring
        uuidDetector.setupAdvancedAngularMonitoring();
        
        return 'No target input found, but global monitoring is active';
      }
    },
    
    forceSetUuidValue: (uuid = 'test-uuid-12345-67890-abcdef') => {
      console.log('=== FORCE SETTING UUID VALUE ===');
      
      const targetInput = document.querySelector('input[id*="resource_uuid"]');
      if (targetInput) {
        console.log(`🎯 Force setting UUID "${uuid}" in input: ${targetInput.id}`);
        
        // Multiple ways to set the value
        targetInput.value = uuid;
        targetInput.setAttribute('value', uuid);
        targetInput.setAttribute('ng-reflect-model', uuid);
        
        // Trigger events
        ['input', 'change', 'propertychange'].forEach(eventType => {
          const event = new Event(eventType, { bubbles: true });
          targetInput.dispatchEvent(event);
        });
        
        // Force a scan
        setTimeout(() => {
          console.log('🎯 Forcing scan after value set...');
          uuidDetector.scanForUUIDs();
        }, 500);
        
        return `UUID "${uuid}" set in ${targetInput.id}`;
      } else {
        return 'No target input found';
      }
    },
    
    testUuid0Monitoring: () => {
      console.log('=== TESTING ULTRA-AGGRESSIVE _uuid0 MONITORING ===');
      
      // Find all _uuid0 elements
      const uuid0Elements = document.querySelectorAll('*[id$="_uuid0"]');
      console.log(`🎯 Found ${uuid0Elements.length} _uuid0 elements total`);
      
      uuid0Elements.forEach((element, i) => {
        const isInActionCard = uuidDetector.isInActionCardOrPreview(element);
        const actionCardType = uuidDetector.getActionCardType(element);
        
        console.log(`🎯 _uuid0 Element ${i}:`, {
          id: element.id,
          tagName: element.tagName,
          value: element.value || element.textContent || '',
          isInActionCard: isInActionCard,
          actionCardType: actionCardType,
          className: element.className
        });
        
        if (isInActionCard) {
          console.log(`🎯 Setting up intensive monitoring for: ${element.id}`);
          uuidDetector.setupIntensiveElementMonitoring(element);
        }
      });
      
      // Test with the specific resource_uuid0 element
      const resourceUuidElement = document.querySelector('*[id*="resource_uuid0"]');
      if (resourceUuidElement) {
        console.log(`🎯 Found resource_uuid0 element: ${resourceUuidElement.id}`);
        
        // Test setting a UUID
        const testUuid = '12345678-1234-1234-1234-123456789abc';
        console.log(`🎯 Testing UUID setting: ${testUuid}`);
        
        setTimeout(() => {
          console.log('🎯 Setting UUID via multiple methods...');
          
          // Method 1: Direct value assignment
          if (resourceUuidElement.tagName === 'INPUT') {
            resourceUuidElement.value = testUuid;
          } else {
            resourceUuidElement.textContent = testUuid;
          }
          
          // Method 2: setAttribute
          resourceUuidElement.setAttribute('value', testUuid);
          resourceUuidElement.setAttribute('ng-reflect-model', testUuid);
          
          // Method 3: Trigger events
          ['input', 'change', 'blur'].forEach(eventType => {
            const event = new Event(eventType, { bubbles: true });
            resourceUuidElement.dispatchEvent(event);
          });
          
        }, 1000);
        
        return `Ultra-aggressive monitoring set up for ${uuid0Elements.length} _uuid0 elements. Test UUID will be set in 1 second.`;
      }
      
      return `Found ${uuid0Elements.length} _uuid0 elements, no resource_uuid0 found`;
    },
    
    forceUuid0Detection: () => {
      console.log('=== FORCE _uuid0 DETECTION ===');
      
      // Re-run the ultra-aggressive monitoring setup
      uuidDetector.setupUltraAggressiveUuid0Monitoring();
      
      // Force scan all _uuid0 elements
      const uuid0Elements = document.querySelectorAll('*[id$="_uuid0"]');
      
      uuid0Elements.forEach(element => {
        const currentValue = element.value || element.textContent || '';
        if (currentValue && currentValue.trim()) {
          console.log(`🎯 Force processing existing value in ${element.id}: "${currentValue}"`);
          uuidDetector.processUuid0ElementChange(element, currentValue);
        }
      });
      
      return `Force detection completed for ${uuid0Elements.length} _uuid0 elements`;
    },
    
    testReadonlyInputDetection: () => {
      console.log('=== TESTING READONLY ANGULAR INPUT DETECTION ===');
      
      // Find all readonly inputs
      const readonlyInputs = document.querySelectorAll('input[readonly]');
      console.log(`🎯 Found ${readonlyInputs.length} readonly inputs`);
      
      // Find all Angular inputs (with ng- classes)
      const angularInputs = document.querySelectorAll('input[class*="ng-"]');
      console.log(`🎯 Found ${angularInputs.length} Angular inputs`);
      
      // Combine and deduplicate
      const allInputs = new Set([...readonlyInputs, ...angularInputs]);
      console.log(`🎯 Total unique inputs to check: ${allInputs.size}`);
      
      allInputs.forEach((input, i) => {
        const parentContext = uuidDetector.getParentContext(input);
        
        console.log(`🎯 Readonly/Angular Input ${i}:`, {
          id: input.id || 'no-id',
          value: input.value || '',
          className: input.className,
          readonly: input.readonly,
          hasUuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value || ''),
          parentContext: parentContext,
          isInActionCard: uuidDetector.isInActionCardOrPreview(input)
        });
        
        // Test entity type inference if there's a value
        if (input.value && input.value.trim()) {
          const uuid = input.value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
          if (uuid) {
            const entityType = uuidDetector.inferEntityTypeFromReadonlyInput(input, uuid[0]);
            console.log(`🎯 Would classify UUID ${uuid[0]} as: ${entityType}`);
          }
        }
        
        // Set up monitoring for this input
        uuidDetector.setupReadonlyInputMonitoring(input);
      });
      
      // Test with the specific input mentioned by user
      const targetInput = document.querySelector('input.clr-input.ng-pristine.ng-valid.ng-star-inserted.ng-touched[readonly]');
      if (targetInput) {
        console.log(`🎯 Found target readonly input:`, {
          id: targetInput.id,
          value: targetInput.value,
          className: targetInput.className
        });
        
        // Force check this input
        uuidDetector.checkReadonlyInputForUUID(targetInput);
        
        // Test setting a UUID in it
        const testUuid = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
        setTimeout(() => {
          console.log(`🎯 Testing readonly input with UUID: ${testUuid}`);
          targetInput.value = testUuid;
          targetInput.setAttribute('value', testUuid);
          targetInput.setAttribute('ng-reflect-model', testUuid);
          
          // Trigger check
          uuidDetector.checkReadonlyInputForUUID(targetInput);
        }, 1000);
      }
      
      return {
        readonlyInputs: readonlyInputs.length,
        angularInputs: angularInputs.length,
        totalUnique: allInputs.size,
        targetFound: !!targetInput
      };
    },
    
    forceReadonlyInputScan: () => {
      console.log('=== FORCE READONLY INPUT SCAN ===');
      
      // Re-run the readonly detection setup
      uuidDetector.setupReadonlyAngularInputDetection();
      
      // Force check all readonly and Angular inputs
      const allInputs = document.querySelectorAll('input[readonly], input[class*="ng-"]');
      
      allInputs.forEach(input => {
        const currentValue = input.value || input.getAttribute('value') || '';
        if (currentValue && currentValue.trim()) {
          console.log(`🎯 Force checking readonly input value: "${currentValue}"`);
          uuidDetector.checkReadonlyInputForUUID(input);
        }
      });
      
      return `Force readonly scan completed for ${allInputs.length} inputs`;
    },
    
    testApplicationUuidDetection: () => {
      console.log('=== TESTING APPLICATION UUID DETECTION ===');
      
      // Look for the specific undefined-application_uuid0 pattern
      const applicationUuidInput = document.querySelector('input[id*="application_uuid0"]');
      if (applicationUuidInput) {
        console.log(`🎯 Found application UUID input:`, {
          id: applicationUuidInput.id,
          type: applicationUuidInput.type,
          value: applicationUuidInput.value,
          className: applicationUuidInput.className,
          clrinput: applicationUuidInput.hasAttribute('clrinput'),
          isInActionCard: uuidDetector.isInActionCardOrPreview(applicationUuidInput)
        });
        
        // Test entity type inference
        const testUuid = '12345678-1234-1234-1234-123456789abc';
        const entityType = uuidDetector.inferEntityTypeFromAngularInput(applicationUuidInput, testUuid);
        console.log(`🎯 Entity type inference result: ${entityType}`);
        
        // Set up intensive monitoring
        uuidDetector.setupIntensiveElementMonitoring(applicationUuidInput);
        
        // Test setting a UUID
        setTimeout(() => {
          console.log(`🎯 Setting test application UUID: ${testUuid}`);
          applicationUuidInput.value = testUuid;
          applicationUuidInput.setAttribute('value', testUuid);
          applicationUuidInput.setAttribute('ng-reflect-model', testUuid);
          
          // Trigger processing
          uuidDetector.processUuid0ElementChange(applicationUuidInput, testUuid);
          
          // Also trigger events
          ['input', 'change', 'blur'].forEach(eventType => {
            const event = new Event(eventType, { bubbles: true });
            applicationUuidInput.dispatchEvent(event);
          });
        }, 1000);
        
        return `Application UUID input found: ${applicationUuidInput.id}. Test UUID will be set in 1 second.`;
      } else {
        console.log('🎯 No application UUID input found. Checking all _uuid0 elements...');
        
        // Check all _uuid0 elements
        const allUuid0Elements = document.querySelectorAll('*[id$="_uuid0"]');
        console.log(`🎯 Found ${allUuid0Elements.length} _uuid0 elements total:`);
        
        allUuid0Elements.forEach((element, i) => {
          console.log(`🎯 _uuid0 Element ${i}:`, {
            id: element.id,
            tagName: element.tagName,
            type: element.type,
            value: element.value || element.textContent || '',
            className: element.className,
            hasApplicationInId: element.id && element.id.includes('application'),
            isInActionCard: uuidDetector.isInActionCardOrPreview(element)
          });
        });
        
        return `No application UUID input found. Total _uuid0 elements: ${allUuid0Elements.length}`;
      }
    },
    
    forceApplicationUuidDetection: () => {
      console.log('=== FORCE APPLICATION UUID DETECTION ===');
      
      // Force setup ultra-aggressive monitoring
      uuidDetector.setupUltraAggressiveUuid0Monitoring();
      
      // Look specifically for application_uuid patterns
      const applicationSelectors = [
        'input[id*="application_uuid"]',
        '*[id*="application_uuid0"]',
        'input[id^="undefined-application_uuid"]',
        'input[clrinput][id*="application"]'
      ];
      
      applicationSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(`🎯 Found ${elements.length} elements for application selector: ${selector}`);
        
        elements.forEach(element => {
          console.log(`🎯 Processing application element:`, {
            id: element.id,
            value: element.value || element.textContent || '',
            isInActionCard: uuidDetector.isInActionCardOrPreview(element)
          });
          
          // Set up monitoring
          if (uuidDetector.isInActionCardOrPreview(element)) {
            uuidDetector.setupIntensiveElementMonitoring(element);
          }
          
          // Check current value
          const currentValue = element.value || element.textContent || '';
          if (currentValue && currentValue.trim()) {
            uuidDetector.processUuid0ElementChange(element, currentValue);
          }
        });
      });
      
      return 'Force application UUID detection completed';
    },
    
    testJavaScriptValueDetection: () => {
      console.log('=== TESTING JAVASCRIPT VALUE DETECTION ===');
      
      // Test Angular globals
      console.log('🎯 Checking Angular globals:');
      console.log('window.ng:', !!window.ng);
      console.log('window.getAllAngularRootElements:', !!window.getAllAngularRootElements);
      console.log('window.ngDevMode:', !!window.ngDevMode);
      
      // Test Angular debugging utilities
      if (window.ng) {
        console.log('🎯 Angular debugging utilities available');
        
        // Try to get all Angular elements
        const angularElements = document.querySelectorAll('[ng-version], [_nghost-*], [_ngcontent-*]');
        console.log(`🎯 Found ${angularElements.length} Angular elements`);
        
        // Test component access on first few elements
        angularElements.slice(0, 5).forEach((element, i) => {
          try {
            if (window.ng.getComponent) {
              const component = window.ng.getComponent(element);
              console.log(`🎯 Component ${i}:`, component);
            }
            
            if (window.ng.getContext) {
              const context = window.ng.getContext(element);
              console.log(`🎯 Context ${i}:`, context);
            }
          } catch (error) {
            console.log(`🎯 Error accessing Angular data for element ${i}:`, error);
          }
        });
      }
      
      // Force setup JavaScript detection
      uuidDetector.setupAngularJavaScriptValueDetection();
      
      // Test scanning all form elements
      const formElements = document.querySelectorAll('[formcontrolname], [ng-model], [ngModel]');
      console.log(`🎯 Found ${formElements.length} Angular form elements`);
      
      formElements.forEach((element, i) => {
        console.log(`🎯 Form Element ${i}:`, {
          tagName: element.tagName,
          formControlName: element.getAttribute('formcontrolname'),
          ngModel: element.getAttribute('ng-model') || element.getAttribute('ngModel'),
          value: element.value,
          id: element.id
        });
      });
      
      // Test deep DOM scanning
      console.log('🎯 Testing deep DOM scanning...');
      uuidDetector.setupDeepDOMScanning();
      
      return {
        hasAngularGlobals: !!window.ng,
        angularElements: angularElements?.length || 0,
        formElements: formElements.length,
        jsDetectionActive: true
      };
    },
    
    testHiddenUUIDDetection: () => {
      console.log('=== TESTING HIDDEN UUID DETECTION ===');
      
      // Simulate hidden UUID scenarios
      const testScenarios = [
        {
          name: 'JSON.parse with UUID',
          test: () => {
            const testData = '{"uuid": "12345678-1234-5678-9abc-123456789def", "name": "test"}';
            JSON.parse(testData);
          }
        },
        {
          name: 'Object.defineProperty with UUID',
          test: () => {
            const testObj = {};
            Object.defineProperty(testObj, 'hiddenUuid', {
              value: '87654321-4321-8765-dcba-987654321fed'
            });
          }
        },
        {
          name: 'Element property with UUID',
          test: () => {
            const testElement = document.createElement('input');
            testElement.__ngContext__ = {
              value: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
            };
            document.body.appendChild(testElement);
            setTimeout(() => document.body.removeChild(testElement), 1000);
          }
        }
      ];
      
      console.log('🎯 Running test scenarios...');
      testScenarios.forEach((scenario, i) => {
        console.log(`🎯 Running scenario ${i + 1}: ${scenario.name}`);
        try {
          scenario.test();
        } catch (error) {
          console.log(`🎯 Scenario ${i + 1} error:`, error);
        }
      });
      
      // Test scanning current page for any hidden UUIDs
      console.log('🎯 Scanning page for hidden UUIDs...');
      const allElements = document.querySelectorAll('*');
      let hiddenUuidCount = 0;
      
      allElements.forEach(element => {
        try {
          uuidDetector.scanElementForHiddenUUIDs(element);
          
          // Check if element has any UUID-like data attributes
          if (element.dataset) {
            Object.values(element.dataset).forEach(value => {
              if (value && /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(value)) {
                hiddenUuidCount++;
                console.log(`🎯 Found hidden UUID in dataset:`, value);
              }
            });
          }
        } catch (error) {
          // Ignore errors
        }
      });
      
      return {
        testScenariosRun: testScenarios.length,
        elementsScanned: allElements.length,
        hiddenUuidCount: hiddenUuidCount
      };
    },
    
    forceJavaScriptUUIDScan: () => {
      console.log('=== FORCE JAVASCRIPT UUID SCAN ===');
      
      // Force all JavaScript detection methods
      uuidDetector.setupAngularJavaScriptValueDetection();
      
      // Scan all JavaScript accessible properties of elements
      const allElements = document.querySelectorAll('input, [id*="uuid"], [class*="ng-"]');
      
      allElements.forEach(element => {
        // Ultra-intensive monitoring
        uuidDetector.setupUltraIntensiveElementMonitoring(element);
        
        // Force scan for hidden UUIDs
        uuidDetector.scanElementForHiddenUUIDs(element);
      });
      
      // Force scan all Angular elements
      if (window.ng) {
        uuidDetector.monitorAngularElements();
      }
      
      return `Force JavaScript UUID scan completed for ${allElements.length} elements`;
    }
  };

})();
