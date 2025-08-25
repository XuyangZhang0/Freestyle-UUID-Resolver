/**
 * UI Enhancer - Injects resolved entity names into the DOM
 */

class UIEnhancer {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.processedElements = new WeakSet();
    this.resolvedUUIDs = new Map();
  }

  /**
   * Enhance UI by adding resolved names for detected UUIDs
   */
  async enhanceUI(detectedUUIDs) {
    for (const uuidData of detectedUUIDs) {
      try {
        // Skip if already processed (only for DOM elements, not URL UUIDs)
        if (uuidData.element && this.processedElements.has(uuidData.element)) {
          continue;
        }

        // Skip URL UUIDs if already resolved
        if (!uuidData.element && this.resolvedUUIDs.has(uuidData.uuid)) {
          continue;
        }

        // Show loading indicator (only for DOM elements)
        if (uuidData.element) {
          this.showLoadingIndicator(uuidData);
        }

        // Resolve UUID
        const resolvedData = await this.apiClient.resolveUUID(
          uuidData.uuid, 
          uuidData.entityType
        );

        // Update UI with resolved data
        if (uuidData.element) {
          this.injectResolvedName(uuidData, resolvedData);
          this.processedElements.add(uuidData.element);
        } else {
          // Handle URL-based UUIDs by showing in console or notification
          this.handleURLBasedUUID(uuidData, resolvedData);
        }
        
        this.resolvedUUIDs.set(uuidData.uuid, resolvedData);

      } catch (error) {
        console.error(`Failed to enhance UI for UUID ${uuidData.uuid}:`, error);
        if (uuidData.element) {
          this.showErrorIndicator(uuidData, error);
        }
      }
    }
  }

  /**
   * Show loading indicator while resolving UUID
   */
  showLoadingIndicator(uuidData) {
    const loadingElement = this.createLoadingElement();
    this.insertAfterTextNode(uuidData.element, loadingElement);
  }

  /**
   * Create loading indicator element
   */
  createLoadingElement() {
    const loading = document.createElement('span');
    loading.className = 'uuid-resolver-loading';
    loading.innerHTML = ' <span class="loading-spinner">⟳</span> Resolving...';
    return loading;
  }

  /**
   * Inject resolved name into the DOM
   */
  injectResolvedName(uuidData, resolvedData) {
    // Remove any existing loading indicators
    this.removeLoadingIndicators(uuidData.element);
    
    // Check for existing resolution for this UUID in the same container
    const existingResolution = this.findExistingResolution(uuidData.element, uuidData.uuid);
    if (existingResolution) {
      console.log('UUID Resolver: Resolution already exists for', uuidData.uuid);
      return;
    }

    // Create resolved name element with container awareness
    const nameElement = this.createResolvedNameElement(resolvedData, uuidData.element);
    
    // Insert after the UUID text
    this.insertAfterTextNode(uuidData.element, nameElement);
  }

  /**
   * Create element displaying resolved entity information
   */
  createResolvedNameElement(resolvedData, contextElement) {
    const container = document.createElement('span');
    container.className = 'uuid-resolver-info';
    
    // Analyze container context for responsive behavior
    this.applyContainerAwareness(container, contextElement);
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'uuid-resolver-name';
    nameSpan.textContent = resolvedData.name;
    nameSpan.title = resolvedData.name; // Full name on hover for truncated text
    
    const typeSpan = document.createElement('span');
    typeSpan.className = 'uuid-resolver-type';
    typeSpan.textContent = resolvedData.type;

    // Create tooltip with additional info
    const tooltip = this.createTooltip(resolvedData);
    
    container.appendChild(document.createTextNode(' → '));
    container.appendChild(nameSpan);
    container.appendChild(document.createTextNode(' '));
    container.appendChild(typeSpan);
    container.appendChild(tooltip);

    // Add hover handlers for smart tooltip positioning
    this.addSmartTooltipHandlers(container, tooltip);

    return container;
  }

  /**
   * Create tooltip with detailed entity information
   */
  createTooltip(resolvedData) {
    const tooltip = document.createElement('div');
    tooltip.className = 'uuid-resolver-tooltip';
    
    // Use subType if available (for categorized apps), otherwise use type
    const displayType = resolvedData.subType || resolvedData.type;
    
    let tooltipContent = `
      <div class="tooltip-header">
        <strong>${resolvedData.name}</strong>
        <span class="entity-type ${resolvedData.category || ''}">${displayType}</span>
      </div>
    `;

    if (resolvedData.description) {
      tooltipContent += `<div class="tooltip-description">${resolvedData.description}</div>`;
    }

    // Add type-specific information
    switch (resolvedData.type) {
      case 'application':
        if (resolvedData.version || resolvedData.appVersion) {
          tooltipContent += `<div class="tooltip-version">Version: ${resolvedData.version || resolvedData.appVersion}</div>`;
        }
        if (resolvedData.platform) {
          tooltipContent += `<div class="tooltip-platform">Platform: ${resolvedData.platform}</div>`;
        }
        if (resolvedData.bundleId) {
          tooltipContent += `<div class="tooltip-bundle">Bundle ID: ${resolvedData.bundleId}</div>`;
        }
        if (resolvedData.category) {
          tooltipContent += `<div class="tooltip-category">Category: ${resolvedData.category}</div>`;
        }
        break;
      case 'profile':
        if (resolvedData.platform) {
          tooltipContent += `<div class="tooltip-platform">Platform: ${resolvedData.platform}</div>`;
        }
        if (resolvedData.managedBy) {
          tooltipContent += `<div class="tooltip-managed">Managed by: ${resolvedData.managedBy}</div>`;
        }
        if (resolvedData.isActive !== undefined) {
          tooltipContent += `<div class="tooltip-status">Status: ${resolvedData.isActive ? 'Active' : 'Inactive'}</div>`;
        }
        if (resolvedData.isActionable !== undefined) {
          tooltipContent += `<div class="tooltip-actionable">Actionable: ${resolvedData.isActionable ? 'Yes' : 'No'}</div>`;
        }
        break;
      case 'script':
        if (resolvedData.deviceType) {
          tooltipContent += `<div class="tooltip-device-type">Device Type: ${resolvedData.deviceType}</div>`;
        }
        if (resolvedData.description) {
          tooltipContent += `<div class="tooltip-description">Description: ${resolvedData.description}</div>`;
        }
        break;
      case 'product':
        if (resolvedData.platform) {
          tooltipContent += `<div class="tooltip-platform">Platform: ${resolvedData.platform}</div>`;
        }
        if (resolvedData.productType) {
          tooltipContent += `<div class="tooltip-product-type">Type: ${resolvedData.productType}</div>`;
        }
        if (resolvedData.description) {
          tooltipContent += `<div class="tooltip-description">Description: ${resolvedData.description}</div>`;
        }
        if (resolvedData.isActive !== undefined) {
          tooltipContent += `<div class="tooltip-status">Status: ${resolvedData.isActive ? 'Active' : 'Inactive'}</div>`;
        }
        break;
      case 'tag':
        if (resolvedData.color) {
          tooltipContent += `<div class="tooltip-color">Color ID: ${resolvedData.color}</div>`;
        }
        break;
    }

    tooltipContent += `<div class="tooltip-uuid">UUID: ${resolvedData.uuid}</div>`;

    tooltip.innerHTML = tooltipContent;
    return tooltip;
  }

  /**
   * Show error indicator when resolution fails
   */
  showErrorIndicator(uuidData, error) {
    // Remove loading indicators
    this.removeLoadingIndicators(uuidData.element);

    // Create error element
    const errorElement = document.createElement('span');
    errorElement.className = 'uuid-resolver-error';
    errorElement.innerHTML = ` <span class="error-icon">⚠</span> Resolution failed`;
    errorElement.title = error.message;

    this.insertAfterTextNode(uuidData.element, errorElement);
  }

  /**
   * Insert element after a text node
   */
  insertAfterTextNode(textNode, elementToInsert) {
    const parent = textNode.parentNode;
    if (!parent) return;

    // Check if we're inside an input field or input wrapper - enhanced for Angular
    const inputElement = textNode.closest('input');
    const angularInputWrapper = textNode.closest('.clr-input-wrapper, .lookup-variable-input, dpa-lookup-variable-input');
    const formFieldContainer = textNode.closest('dpa-form-field, .clr-form-control, .field-container');
    const connectorCard = textNode.closest('dpa-go-connector-action-card');
    
    if (inputElement && elementToInsert.classList.contains('in-input-field')) {
      console.log('UUID Resolver: Handling input field insertion for complex Angular structure');
      
      // Find the best container for the overlay
      let targetContainer = angularInputWrapper || formFieldContainer || connectorCard || inputElement.parentElement;
      
      console.log('UUID Resolver: Target container found:', {
        tagName: targetContainer.tagName,
        className: targetContainer.className,
        id: targetContainer.id
      });
      
      // Make the container relative positioned if not already
      const containerStyle = window.getComputedStyle(targetContainer);
      if (containerStyle.position === 'static') {
        targetContainer.style.position = 'relative';
      }
      
      // For Angular lookup inputs, create a floating overlay positioned absolute
      if (angularInputWrapper || inputElement.classList.contains('lookup-variable-input')) {
        console.log('UUID Resolver: Creating floating overlay for Angular lookup input');
        
        // Create a positioned overlay container
        const overlayContainer = document.createElement('div');
        overlayContainer.className = 'uuid-resolver-angular-overlay';
        overlayContainer.style.cssText = `
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 9999;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 8px 12px;
          margin-top: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          font-size: 13px;
          line-height: 1.4;
          backdrop-filter: blur(2px);
          max-width: 400px;
        `;
        
        // Move the element content into the overlay
        overlayContainer.appendChild(elementToInsert);
        
        // Insert the overlay into the target container
        targetContainer.appendChild(overlayContainer);
        
        console.log('UUID Resolver: Angular overlay created and positioned');
        
        // For the tooltip, append to body for proper z-index handling
        const tooltip = elementToInsert.querySelector('.uuid-resolver-tooltip');
        if (tooltip) {
          document.body.appendChild(tooltip);
          console.log('UUID Resolver: Tooltip moved to body for proper positioning');
        }
        
        return; // Early return for Angular handling
      }
      
      // Standard input field handling
      targetContainer.appendChild(elementToInsert);
      
      // For tooltips, append to document body for proper positioning
      const tooltip = elementToInsert.querySelector('.uuid-resolver-tooltip');
      if (tooltip) {
        document.body.appendChild(tooltip);
      }
    } else {
      // Standard insertion after text node
      parent.insertBefore(elementToInsert, textNode.nextSibling);
    }
  }

  /**
   * Remove loading indicators from around an element
   */
  removeLoadingIndicators(textNode) {
    const parent = textNode.parentNode;
    if (parent) {
      const loadingElements = parent.querySelectorAll('.uuid-resolver-loading');
      loadingElements.forEach(element => element.remove());
    }
  }

  /**
   * Find existing resolution for a UUID near the given element
   */
  findExistingResolution(textNode, uuid) {
    const parent = textNode.parentNode;
    if (!parent) return null;

    // Look for existing resolution in the same container
    const container = textNode.closest('.field-container, .clr-input-wrapper, .lookup-variable-input') || parent;
    const existingResolutions = container.querySelectorAll('.uuid-resolver-info');
    
    for (const resolution of existingResolutions) {
      const tooltipUuid = resolution.querySelector('.tooltip-uuid');
      if (tooltipUuid && tooltipUuid.textContent.includes(uuid)) {
        return resolution;
      }
    }
    
    return null;
  }

  /**
   * Remove all UUID resolver elements (for cleanup)
   */
  removeAllEnhancements() {
    const elements = document.querySelectorAll([
      '.uuid-resolver-info',
      '.uuid-resolver-loading',
      '.uuid-resolver-error'
    ].join(','));
    
    elements.forEach(element => element.remove());
    
    // Clear processed elements tracking
    this.processedElements = new WeakSet();
  }

  /**
   * Get statistics about resolved UUIDs
   */
  getStatistics() {
    const stats = {
      total: this.resolvedUUIDs.size,
      byType: {}
    };

    for (const [uuid, data] of this.resolvedUUIDs) {
      const type = data.type;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    }

    return stats;
  }

  /**
   * Apply container-aware styling based on context
   */
  applyContainerAwareness(container, contextElement) {
    if (!contextElement || !contextElement.parentElement) return;

    const parentElement = contextElement.parentElement;
    const parentRect = parentElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // Check if we're inside an input field or input wrapper - enhanced for Angular
    const inputContainer = contextElement.closest('input, .clr-input-wrapper, .clr-control-container, .lookup-variable-input, dpa-lookup-variable-input');
    const isInInputField = inputContainer !== null;

    // Check for Angular lookup variable inputs specifically
    const isAngularLookupInput = contextElement.closest('dpa-lookup-variable-input, .lookup-variable-input') !== null;
    
    // Check for product UUID specific fields (often wider than other inputs)
    const isProductField = contextElement.textContent && contextElement.textContent.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i) &&
                          (contextElement.closest('input[id*="product"]') || 
                           contextElement.closest('[class*="product"]') ||
                           contextElement.closest('label[for*="product"]') ||
                           document.querySelector('label[for*="product"]'));

    // Check if we're in a connector action card
    const isInConnectorCard = contextElement.closest('dpa-go-connector-action-card') !== null;

    // Always use positioned overlay for input fields to prevent overflow
    if (isInInputField) {
      container.classList.add('in-input-field');
      
      // Special handling for Angular lookup inputs
      if (isAngularLookupInput) {
        container.classList.add('in-angular-lookup-input');
        console.log('UUID Resolver: Applied Angular lookup input styling');
      }
      
      // For product fields or wide input fields, ensure proper positioning
      if (isProductField || parentRect.width > 400) {
        container.classList.add('in-wide-input-field');
      }
      
      // Special handling for connector action cards
      if (isInConnectorCard) {
        container.classList.add('in-connector-card');
        console.log('UUID Resolver: Applied connector card styling');
      }
    }
    // Check if we're in a narrow container (but not an input field)
    else if (parentRect.width < 300 || viewportWidth < 768) {
      container.classList.add('in-narrow-container');
    }
    // Check if we're in a wide container
    else if (parentRect.width > 800) {
      container.classList.add('in-wide-container');
    }

    // Check if the parent container has limited horizontal space
    const containerStyle = window.getComputedStyle(parentElement);
    if (containerStyle.overflow === 'hidden' || containerStyle.overflowX === 'hidden') {
      container.classList.add('in-overflow-container');
    }

    // Check for specific UEM UI components that need special handling
    if (contextElement.closest('.field-container, dpa-form-field, .clr-form-control')) {
      container.classList.add('in-form-field');
    }

    // Special handling for product UUID fields
    if (isProductField) {
      container.classList.add('in-product-field');
    }
    
    console.log('UUID Resolver: Applied container awareness classes:', container.className);
  }

  /**
   * Add smart tooltip positioning handlers
   */
  addSmartTooltipHandlers(container, tooltip) {
    let hoverTimeout;

    // Ensure tooltip is interactive for better UX
    tooltip.style.pointerEvents = 'none';

    container.addEventListener('mouseenter', (e) => {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        this.positionTooltipSmart(container, tooltip);
        tooltip.style.display = 'block';
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(-2px)';
        
        // Smooth animation
        setTimeout(() => {
          tooltip.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
          tooltip.style.opacity = '1';
          tooltip.style.transform = 'translateY(0)';
        }, 10);
      }, 300); // Small delay to prevent tooltips on quick mouse movement
    });

    container.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      tooltip.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translateY(-2px)';
      
      setTimeout(() => {
        tooltip.style.display = 'none';
      }, 150);
    });

    container.addEventListener('mousemove', (e) => {
      if (tooltip.style.display === 'block') {
        this.positionTooltipSmart(container, tooltip, e);
      }
    });

    // Handle tooltip cleanup when container is removed
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node === container || (node.contains && node.contains(container))) {
            if (tooltip && tooltip.parentNode) {
              tooltip.remove();
            }
            observer.disconnect();
          }
        });
      });
    });

    if (container.parentNode) {
      observer.observe(container.parentNode, { childList: true, subtree: true });
    }
  }

  /**
   * Position tooltip intelligently based on viewport and container constraints
   */
  positionTooltipSmart(container, tooltip, mouseEvent = null) {
    const containerRect = container.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipRect = tooltip.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let left, top;

    if (mouseEvent) {
      // Position near mouse cursor
      left = mouseEvent.clientX + scrollX + 10;
      top = mouseEvent.clientY + scrollY + 10;
    } else {
      // Position relative to container
      left = containerRect.left + scrollX;
      top = containerRect.bottom + scrollY + 5;
    }

    // Adjust for viewport boundaries
    if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - 10;
      tooltip.classList.add('tooltip-right');
    } else {
      tooltip.classList.remove('tooltip-right');
    }

    if (left < 10) {
      left = 10;
      tooltip.classList.add('tooltip-left');
    } else {
      tooltip.classList.remove('tooltip-left');
    }

    if (top + tooltipRect.height > viewportHeight + scrollY) {
      top = containerRect.top + scrollY - tooltipRect.height - 5;
      tooltip.classList.add('tooltip-top');
    } else {
      tooltip.classList.remove('tooltip-top');
      tooltip.classList.add('tooltip-bottom');
    }

    if (top < scrollY + 10) {
      top = scrollY + 10;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }
}

// Export for use in other modules
window.UIEnhancer = UIEnhancer;
