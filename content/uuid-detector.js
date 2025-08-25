/**
 * UUID Detector - Scans DOM for UUIDs in Workspace ONE UEM workflows
 */

class UUIDDetector {
  constructor() {
    this.uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
    this.detectedUUIDs = new Set();
    // Entity type mapping based on context keywords (order matters!)
    this.entityTypeMapping = {
      'organization-group': ['organization group uuid', 'organization_group_uuid', 'location_group', 'location group', 'location_group_uuid', 'org-group', 'organization', 'org group', 'organization group', 'organizationgroup'],
      'product': ['product', 'product uuid', 'product_uuid', 'deployment', 'install package', 'manifest'],
      'script': ['script', 'script uuid', 'script_uuid', 'powershell', 'bash', 'python'],
      'tag': ['tag', 'device-tag', 'add-tag', 'tag uuid', 'tag_uuid'],
      'application': ['app', 'application', 'install-app', 'app uuid', 'app_uuid', 'application uuid', 'application_uuid'],
      'profile': ['profile', 'configuration-profile', 'install-profile', 'profile uuid', 'profile_uuid', 'configuration profile']
    };
  }

  /**
   * Simple check if element should be completely skipped
   */
  shouldSkipElement(element) {
    if (!element) return true;
    
    // Skip any element that's part of automation list items or navigation
    return element.closest('.automation-list-item') ||
           element.closest('dpa-automation-list-item') ||
           element.closest('.list-item') ||
           element.closest('a[href]') ||
           element.closest('.nav-link') ||
           element.closest('.dropdown-item') ||
           element.closest('.title') ||
           element.closest('h1, h2, h3, h4, h5, h6') ||
           element.closest('[href*="/workflow/"]') ||
           element.closest('[href*="/automation/"]');
  }

  /**
   * Check if element is in a valid action configuration context
   */
  isInValidActionContext(element) {
    return element.closest('.clr-input-wrapper') ||
           element.closest('.lookup-variable-input') ||
           element.closest('.clr-form-control') ||
           element.closest('dpa-form-field') ||
           element.closest('dpa-read-only-form-field') ||
           element.closest('dpa-dynamic-form-node') ||
           element.closest('dpa-dynamic-form') ||
           element.closest('.form-container') ||
           element.closest('.panel-body') ||
           element.closest('dpa-go-workflow-actions-preview') ||
           element.closest('dpa-go-connector-action-card') ||
           element.closest('dpa-automation-connector-action-settings-editor') ||
           element.closest('.trigger-action-summary') ||
           element.closest('.rule-summary');
  }

  /**
   * Scan the current page for UUIDs - in form fields and action contexts
   */
  scanForUUIDs() {
    console.log('UUID Detector: Starting enhanced scan...');
    const foundUUIDs = [];

    // 0. SPECIAL: Scan for undefined-resource_uuid inputs first
    this.scanUndefinedResourceUuidInputs(foundUUIDs);

    // 1. FIRST: Angular-specific scanning for dynamically populated inputs
    this.scanAngularDynamicInputs(foundUUIDs);
    
    // 2. Aggressive scan for action previews and connector cards
    this.aggressiveScanActionComponents(foundUUIDs);
    
    // 3. Scan input fields and form elements
    this.scanInputElements(foundUUIDs);
    
    // 4. Scan text content in valid action contexts
    this.scanActionContexts(foundUUIDs);
    
    // 5. Special scan for workflow action previews with detailed logging
    this.scanWorkflowActionPreviews(foundUUIDs);
    
    // 6. Force scan all readonly inputs (Angular often uses these)
    this.scanReadonlyInputs(foundUUIDs);

    console.log(`UUID Detector: Total UUIDs found: ${foundUUIDs.length}`);
    return foundUUIDs;
  }

  /**
   * Aggressive scan specifically for dpa-go-workflow-actions-preview and dpa-go-connector-action-card
   */
  aggressiveScanActionComponents(foundUUIDs) {
    console.log('UUID Detector: Starting aggressive action component scan...');
    
    const actionComponents = document.querySelectorAll('dpa-go-workflow-actions-preview, dpa-go-connector-action-card');
    console.log(`UUID Detector: Found ${actionComponents.length} action components for aggressive scan`);
    
    actionComponents.forEach((component, componentIndex) => {
      console.log(`UUID Detector: Aggressively scanning component ${componentIndex}:`, component.tagName);
      
      // FIRST: Scan ALL visible text in the component for UUIDs
      this.scanAllVisibleText(component, `component-${componentIndex}`, foundUUIDs);
      
      // SECOND: Scan ALL input elements within this component, regardless of context restrictions
      const allInputs = component.querySelectorAll('input, textarea, select');
      console.log(`UUID Detector: Found ${allInputs.length} inputs in component ${componentIndex}`);
      
      allInputs.forEach((input, inputIndex) => {
        this.aggressiveScanElement(input, `component-${componentIndex}-input-${inputIndex}`, foundUUIDs);
      });
      
      // THIRD: Scan all form fields
      const formFields = component.querySelectorAll('dpa-form-field, dpa-read-only-form-field, dpa-dynamic-form-node, .clr-form-control');
      console.log(`UUID Detector: Found ${formFields.length} form fields in component ${componentIndex}`);
      
      formFields.forEach((field, fieldIndex) => {
        this.aggressiveScanFormField(field, `component-${componentIndex}-field-${fieldIndex}`, foundUUIDs);
      });
      
      // FOURTH: Scan all text content that might contain UUIDs
      this.aggressiveScanTextContent(component, `component-${componentIndex}`, foundUUIDs);
      
      // FIFTH: Set up watchers for dynamic content
      this.setupDynamicContentWatcher(component, componentIndex, foundUUIDs);
    });
  }

  /**
   * Scan ALL visible text within a component for UUIDs
   */
  scanAllVisibleText(container, containerId, foundUUIDs) {
    console.log(`UUID Detector: Scanning all visible text in ${containerId}`);
    
    // Get ALL elements within the container
    const allElements = container.querySelectorAll('*');
    
    allElements.forEach((element, elementIndex) => {
      // Check if element is visible
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return;
      }
      
      // Get all possible text sources
      const textSources = [
        { name: 'textContent', value: element.textContent },
        { name: 'innerText', value: element.innerText },
        { name: 'innerHTML', value: element.innerHTML },
        { name: 'value', value: element.value },
        { name: 'placeholder', value: element.placeholder },
        { name: 'title', value: element.title },
        { name: 'alt', value: element.alt }
      ];
      
      textSources.forEach(source => {
        if (source.value && source.value.trim()) {
          const matches = source.value.match(this.uuidRegex);
          if (matches) {
            console.log(`UUID Detector: Found UUID in ${containerId}-element-${elementIndex} via ${source.name}:`, source.value.substring(0, 100));
            
            matches.forEach(uuid => {
              if (!this.detectedUUIDs.has(uuid)) {
                this.detectedUUIDs.add(uuid);
                
                // Try to determine entity type from surrounding context
                const entityType = this.inferEntityTypeFromSurroundingElements(element, uuid);
                
                const uuidData = {
                  uuid: uuid,
                  element: element,
                  entityType: entityType,
                  context: 'visible-text-scan',
                  source: `${containerId}-${source.name}`
                };
                console.log('UUID Detector: Adding UUID from visible text scan:', uuidData);
                foundUUIDs.push(uuidData);
              }
            });
          }
        }
      });
    });
  }

  /**
   * Infer entity type from surrounding elements and labels
   */
  inferEntityTypeFromSurroundingElements(element, uuid) {
    console.log(`UUID Detector: Inferring entity type for UUID ${uuid} from surrounding elements`);
    
    // Look for labels in the same container hierarchy
    let currentElement = element;
    let depth = 0;
    
    while (currentElement && depth < 10) {
      // Check for labels within the current element
      const labels = currentElement.querySelectorAll('label');
      for (const label of labels) {
        const labelText = label.textContent.toLowerCase().trim();
        console.log(`UUID Detector: Found label at depth ${depth}: "${labelText}"`);
        
        if (labelText.includes('tag')) return 'tag';
        if (labelText.includes('profile')) return 'profile';
        if (labelText.includes('script')) return 'script';
        if (labelText.includes('product')) return 'product';
        if (labelText.includes('organization') || labelText.includes('org group')) return 'organization-group';
        if (labelText.includes('application') || labelText.includes('app')) return 'application';
      }
      
      // Check the element's own text for clues
      const elementText = currentElement.textContent.toLowerCase();
      const textSnippet = elementText.substring(Math.max(0, elementText.indexOf(uuid.toLowerCase()) - 50), 
                                                 elementText.indexOf(uuid.toLowerCase()) + 100);
      console.log(`UUID Detector: Context text snippet: "${textSnippet}"`);
      
      if (textSnippet.includes('tag')) return 'tag';
      if (textSnippet.includes('profile')) return 'profile';
      if (textSnippet.includes('script')) return 'script';
      if (textSnippet.includes('product')) return 'product';
      if (textSnippet.includes('organization') || textSnippet.includes('org group')) return 'organization-group';
      
      // Move up the DOM tree
      currentElement = currentElement.parentElement;
      depth++;
    }
    
    // Fallback to page context
    const pageEntityType = this.inferEntityTypeFromPageContext(uuid);
    console.log(`UUID Detector: Using page context fallback: ${pageEntityType}`);
    return pageEntityType;
  }

  /**
   * Aggressively scan a single element for UUIDs with multiple fallback methods
   */
  aggressiveScanElement(element, elementId, foundUUIDs) {
    const sources = [
      { name: 'value', value: element.value },
      { name: 'getAttribute-value', value: element.getAttribute('value') },
      { name: 'dataset-value', value: element.dataset.value },
      { name: 'data-value', value: element.getAttribute('data-value') },
      { name: 'textContent', value: element.textContent },
      { name: 'innerText', value: element.innerText },
      { name: 'innerHTML', value: element.innerHTML },
      { name: 'getAttribute-ng-model', value: element.getAttribute('ng-model') },
      { name: 'getAttribute-ng-value', value: element.getAttribute('ng-value') },
      { name: 'placeholder', value: element.placeholder },
      { name: 'title', value: element.title }
    ];
    
    sources.forEach(source => {
      if (source.value && source.value.trim()) {
        const matches = source.value.match(this.uuidRegex);
        if (matches) {
          console.log(`UUID Detector: Found UUID in ${elementId} via ${source.name}:`, source.value);
          
          matches.forEach(uuid => {
            if (!this.detectedUUIDs.has(uuid)) {
              this.detectedUUIDs.add(uuid);
              const entityType = this.inferEntityTypeFromElement(element);
              const uuidData = {
                uuid: uuid,
                element: element,
                entityType: entityType,
                context: 'aggressive-scan',
                source: `${elementId}-${source.name}`
              };
              console.log('UUID Detector: Adding UUID from aggressive scan:', uuidData);
              foundUUIDs.push(uuidData);
            }
          });
        }
      }
    });
  }

  /**
   * Aggressively scan form fields for UUIDs
   */
  aggressiveScanFormField(field, fieldId, foundUUIDs) {
    // Get label for entity type detection
    const label = field.querySelector('label');
    const labelText = label ? label.textContent.trim() : '';
    console.log(`UUID Detector: Aggressively scanning form field ${fieldId} with label: "${labelText}"`);
    
    // Scan all child elements
    const allElements = field.querySelectorAll('*');
    allElements.forEach((element, elementIndex) => {
      this.aggressiveScanElement(element, `${fieldId}-child-${elementIndex}`, foundUUIDs);
    });
    
    // Also scan the field itself
    this.aggressiveScanElement(field, fieldId, foundUUIDs);
  }

  /**
   * Aggressively scan text content for UUIDs
   */
  aggressiveScanTextContent(container, containerId, foundUUIDs) {
    // Get all text content
    const allText = container.textContent || '';
    const matches = allText.match(this.uuidRegex);
    
    if (matches) {
      console.log(`UUID Detector: Found ${matches.length} UUIDs in text content of ${containerId}`);
      
      matches.forEach(uuid => {
        if (!this.detectedUUIDs.has(uuid)) {
          this.detectedUUIDs.add(uuid);
          // Try to find the specific element containing this UUID
          const specificElement = this.findElementContainingUUID(container, uuid);
          const entityType = specificElement ? 
            this.inferEntityTypeFromElement(specificElement) : 
            this.inferEntityTypeFromPageContext(uuid);
          
          const uuidData = {
            uuid: uuid,
            element: specificElement || container,
            entityType: entityType,
            context: 'aggressive-text-scan',
            source: `${containerId}-text`
          };
          console.log('UUID Detector: Adding UUID from aggressive text scan:', uuidData);
          foundUUIDs.push(uuidData);
        }
      });
    }
  }

  /**
   * Find the specific element containing a UUID within a container
   */
  findElementContainingUUID(container, uuid) {
    const allElements = container.querySelectorAll('*');
    for (const element of allElements) {
      const sources = [
        element.value,
        element.textContent,
        element.innerText,
        element.getAttribute('value'),
        element.getAttribute('data-value'),
        element.dataset.value
      ];
      
      for (const source of sources) {
        if (source && source.includes(uuid)) {
          return element;
        }
      }
    }
    return null;
  }

  /**
   * Setup watchers for dynamic content that loads after initial page load
   */
  setupDynamicContentWatcher(component, componentIndex, foundUUIDs) {
    console.log(`UUID Detector: Setting up dynamic content watcher for component ${componentIndex}`);
    
    // Multiple delay intervals to catch different loading patterns
    const delays = [500, 1000, 2000, 3000, 5000];
    
    delays.forEach(delay => {
      setTimeout(() => {
        console.log(`UUID Detector: Dynamic scan at ${delay}ms for component ${componentIndex}`);
        this.performDelayedScan(component, componentIndex, foundUUIDs, delay);
      }, delay);
    });
    
    // Also set up a MutationObserver for real-time changes
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' || mutation.type === 'attributes' || mutation.type === 'characterData') {
          shouldScan = true;
        }
      });
      
      if (shouldScan) {
        console.log(`UUID Detector: Mutation detected in component ${componentIndex}, performing scan`);
        this.performDelayedScan(component, componentIndex, foundUUIDs, 'mutation');
      }
    });
    
    observer.observe(component, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['value', 'data-value', 'ng-model', 'ng-value'],
      characterData: true
    });
    
    // Store observer for cleanup
    if (!this.componentObservers) {
      this.componentObservers = [];
    }
    this.componentObservers.push(observer);
  }

  /**
   * Perform delayed scan for dynamic content
   */
  performDelayedScan(component, componentIndex, foundUUIDs, delay) {
    const tempFoundUUIDs = [];
    
    // Re-scan the component aggressively
    const allInputs = component.querySelectorAll('input, textarea, select');
    allInputs.forEach((input, inputIndex) => {
      this.aggressiveScanElement(input, `delayed-${delay}-component-${componentIndex}-input-${inputIndex}`, tempFoundUUIDs);
    });
    
    // If we found new UUIDs, add them and trigger UI enhancement
    if (tempFoundUUIDs.length > 0) {
      console.log(`UUID Detector: Found ${tempFoundUUIDs.length} new UUIDs in delayed scan at ${delay}ms`);
      foundUUIDs.push(...tempFoundUUIDs);
      
      // Trigger immediate UI enhancement for new UUIDs
      if (window.uiEnhancer) {
        console.log('UUID Detector: Triggering UI enhancement for new UUIDs:', tempFoundUUIDs);
        try {
          window.uiEnhancer.enhanceUI(tempFoundUUIDs);
        } catch (error) {
          console.error('UUID Detector: Error during UI enhancement:', error);
        }
      } else {
        console.warn('UUID Detector: uiEnhancer not available, cannot enhance UI');
      }
      
      // Dispatch event for any listeners
      window.dispatchEvent(new CustomEvent('uuidsDetected', { detail: tempFoundUUIDs }));
    }
  }

  /**
   * Infer entity type from page context when no specific element context is available
   */
  inferEntityTypeFromPageContext(uuid) {
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
   * Scan input elements for UUIDs
   */
  scanInputElements(foundUUIDs) {
    const inputElements = document.querySelectorAll('input, textarea, select');
    console.log(`UUID Detector: Found ${inputElements.length} input elements to scan`);
    
    inputElements.forEach((element, index) => {
      // Skip any element in navigation/list context
      if (this.shouldSkipElement(element)) {
        return;
      }
      
      // Only scan elements in valid action contexts
      if (!this.isInValidActionContext(element)) {
        return;
      }
      
      // Check input value (including readonly inputs)
      let value = element.value;
      
      // For readonly inputs that might be empty, also check various attributes and properties
      if (!value && element.hasAttribute('readonly')) {
        value = element.getAttribute('value') || 
                element.getAttribute('data-value') ||
                element.dataset.value ||
                element.textContent ||
                element.innerText;
                
        // Also check if the value might be set by Angular or other frameworks
        if (!value) {
          // Check Angular binding attributes
          const ngModel = element.getAttribute('ng-model');
          const ngValue = element.getAttribute('ng-value');
          if (ngModel || ngValue) {
            console.log(`UUID Detector: Found Angular-bound input ${index}, checking for dynamic value...`);
            // For Angular inputs, the value might be set after initial load
            // Check again in a moment
            setTimeout(() => {
              if (element.value && element.value.trim()) {
                console.log(`UUID Detector: Found delayed value in Angular input: ${element.value}`);
                this.scanSingleElement(element, 'delayed-angular');
              }
            }, 100);
          }
        }
      }
      
      if (value && value.trim()) {
        const matches = value.match(this.uuidRegex);
        if (matches) {
          console.log(`UUID Detector: Found UUID in input ${index}:`, element.tagName, element.className, value);
          
          matches.forEach(uuid => {
            if (!this.detectedUUIDs.has(uuid)) {
              this.detectedUUIDs.add(uuid);
              const entityType = this.inferEntityTypeFromElement(element);
              console.log(`UUID Detector: Element tag: ${element.tagName}, class: ${element.className}`);
              console.log(`UUID Detector: Inferred entity type: "${entityType}" for UUID: ${uuid}`);
              const uuidData = {
                uuid: uuid,
                element: element,
                entityType: entityType,
                context: 'input-field',
                source: 'input-value'
              };
              console.log('UUID Detector: Adding UUID from input:', uuidData);
              foundUUIDs.push(uuidData);
            }
          });
        }
      }
    });
  }

  /**
   * Special scan for workflow action previews with detailed logging
   */
  scanWorkflowActionPreviews(foundUUIDs) {
    const workflowPreviews = document.querySelectorAll('dpa-go-workflow-actions-preview');
    console.log(`UUID Detector: Found ${workflowPreviews.length} workflow action previews`);
    
    workflowPreviews.forEach((preview, previewIndex) => {
      console.log(`UUID Detector: Scanning workflow preview ${previewIndex}`);
      
      // Look for all form fields within this preview
      const formFields = preview.querySelectorAll('dpa-read-only-form-field, dpa-form-field');
      console.log(`UUID Detector: Found ${formFields.length} form fields in preview ${previewIndex}`);
      
      formFields.forEach((field, fieldIndex) => {
        // Get the label to understand the field type
        const label = field.querySelector('label');
        const labelText = label ? label.textContent.trim() : '';
        console.log(`UUID Detector: Scanning field ${fieldIndex} with label: "${labelText}"`);
        
        // Look for input elements within this field
        const inputs = field.querySelectorAll('input');
        inputs.forEach((input, inputIndex) => {
          const value = input.value || input.getAttribute('value') || input.textContent;
          console.log(`UUID Detector: Input ${inputIndex} value: "${value}"`);
          
          if (value && value.trim()) {
            const matches = value.match(this.uuidRegex);
            if (matches) {
              console.log(`UUID Detector: Found UUID in workflow preview field ${previewIndex}-${fieldIndex}-${inputIndex}:`, value);
              
              matches.forEach(uuid => {
                if (!this.detectedUUIDs.has(uuid)) {
                  this.detectedUUIDs.add(uuid);
                  const entityType = this.inferEntityTypeFromLabel(labelText);
                  console.log(`UUID Detector: Label "${labelText}" inferred as entity type: "${entityType}"`);
                  const uuidData = {
                    uuid: uuid,
                    element: input,
                    entityType: entityType,
                    context: 'workflow-preview',
                    source: 'preview-field'
                  };
                  console.log('UUID Detector: Adding UUID from workflow preview:', uuidData);
                  foundUUIDs.push(uuidData);
                }
              });
            }
          }
        });
        
        // Also scan text content of the field for any UUIDs that might be in display text
        const fieldText = field.textContent;
        if (fieldText) {
          const matches = fieldText.match(this.uuidRegex);
          if (matches) {
            console.log(`UUID Detector: Found UUID in workflow preview field text ${previewIndex}-${fieldIndex}:`, fieldText.substring(0, 100));
            
            matches.forEach(uuid => {
              if (!this.detectedUUIDs.has(uuid)) {
                this.detectedUUIDs.add(uuid);
                const entityType = this.inferEntityTypeFromLabel(labelText);
                const uuidData = {
                  uuid: uuid,
                  element: field,
                  entityType: entityType,
                  context: 'workflow-preview',
                  source: 'preview-text'
                };
                console.log('UUID Detector: Adding UUID from workflow preview text:', uuidData);
                foundUUIDs.push(uuidData);
              }
            });
          }
        }
      });
    });
  }

  /**
   * Scan text content in valid action configuration contexts
   */
  scanActionContexts(foundUUIDs) {
    // Look for specific action context containers
    const actionContexts = document.querySelectorAll([
      'dpa-go-workflow-actions-preview',
      'dpa-go-connector-action-card',
      'dpa-automation-connector-action-settings-editor',
      '.trigger-action-summary',
      '.rule-summary',
      '.panel-body'
    ].join(','));
    
    console.log(`UUID Detector: Found ${actionContexts.length} action contexts to scan`);
    
    actionContexts.forEach((context, contextIndex) => {
      // Skip if this context is in a list item (navigation)
      if (this.shouldSkipElement(context)) {
        return;
      }
      
      // First, scan for any input fields within this context that might have been missed
      const contextInputs = context.querySelectorAll('input[readonly], input.clr-input');
      contextInputs.forEach((input, inputIndex) => {
        let value = input.value || input.getAttribute('value') || input.textContent;
        if (value && value.trim()) {
          const matches = value.match(this.uuidRegex);
          if (matches) {
            console.log(`UUID Detector: Found UUID in context input ${contextIndex}-${inputIndex}:`, value);
            
            matches.forEach(uuid => {
              if (!this.detectedUUIDs.has(uuid)) {
                this.detectedUUIDs.add(uuid);
                const entityType = this.inferEntityTypeFromElement(input);
                const uuidData = {
                  uuid: uuid,
                  element: input,
                  entityType: entityType,
                  context: 'action-input',
                  source: 'context-input-value'
                };
                console.log('UUID Detector: Adding UUID from action context input:', uuidData);
                foundUUIDs.push(uuidData);
              }
            });
          }
        }
      });
      
      // Then scan text nodes within this context
      const textNodes = this.getTextNodesInContext(context);
      
      textNodes.forEach((node, nodeIndex) => {
        const text = node.textContent;
        if (text && text.trim().length > 0) {
          const matches = text.match(this.uuidRegex);
          if (matches) {
            console.log(`UUID Detector: Found UUID in action context ${contextIndex}, node ${nodeIndex}:`, text.substring(0, 100));
            
            matches.forEach(uuid => {
              if (!this.detectedUUIDs.has(uuid)) {
                this.detectedUUIDs.add(uuid);
                const entityType = this.inferEntityTypeFromContext(node);
                const uuidData = {
                  uuid: uuid,
                  element: node,
                  entityType: entityType,
                  context: 'action-context',
                  source: 'text-content'
                };
                console.log('UUID Detector: Adding UUID from action context:', uuidData);
                foundUUIDs.push(uuidData);
              }
            });
          }
        }
      });
    });
  }

  /**
   * Get text nodes within a specific context
   */
  getTextNodesInContext(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          const parent = node.parentElement;
          if (!parent || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip if parent is a link or navigation element
          if (parent.tagName === 'A' || parent.hasAttribute('href')) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Only include nodes with meaningful text
          if (node.textContent.trim().length > 0) {
            return NodeFilter.FILTER_ACCEPT;
          }
          
          return NodeFilter.FILTER_REJECT;
        }
      },
      false
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    return textNodes;
  }

  /**
   * Infer entity type from context
   */
  inferEntityTypeFromContext(textNode) {
    // Look for nearby labels or context clues
    const parent = textNode.parentElement;
    if (!parent) return 'application';
    
    // Look for labels in the same container
    const container = parent.closest('.clr-form-control') || 
                     parent.closest('dpa-form-field') ||
                     parent.closest('.rule-summary') ||
                     parent;
    
    const label = container.querySelector('label');
    if (label) {
      return this.inferEntityTypeFromLabel(label.textContent);
    }
    
    // Look for context clues in surrounding text
    const surroundingText = container.textContent.toLowerCase();
    if (surroundingText.includes('tag')) return 'tag';
    if (surroundingText.includes('product')) return 'product';
    if (surroundingText.includes('script')) return 'script';
    if (surroundingText.includes('profile')) return 'profile';
    if (surroundingText.includes('organization') || surroundingText.includes('org group')) return 'organization-group';
    
    return 'application';
  }

  /**
   * Infer entity type from form element
   */
  inferEntityTypeFromElement(element) {
    // Look for associated label
    const label = this.findAssociatedLabel(element);
    console.log(`UUID Detector: Found label for element:`, label ? label.textContent : 'NO LABEL FOUND');
    
    if (label) {
      const labelType = this.inferEntityTypeFromLabel(label.textContent);
      console.log(`UUID Detector: Label "${label.textContent}" inferred as: "${labelType}"`);
      if (labelType !== 'application') {
        return labelType;
      }
    }
    
    console.log('UUID Detector: No specific label found, defaulting to application');
    // Default fallback
    return 'application';
  }

  /**
   * Find associated label for form element
   */
  findAssociatedLabel(element) {
    // Try to find label by 'for' attribute
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label;
    }
    
    // Try to find label as parent or sibling
    let label = element.closest('label') || 
                element.parentElement?.querySelector('label') ||
                element.parentElement?.previousElementSibling?.querySelector('label');
    
    if (label) return label;
    
    // For Angular components, look in the broader form control structure
    const formControl = element.closest('.clr-form-control') || 
                       element.closest('dpa-form-field') ||
                       element.closest('dpa-read-only-form-field');
    
    if (formControl) {
      label = formControl.querySelector('label');
      if (label) return label;
    }
    
    // Look in the closest form field container
    const fieldContainer = element.closest('.field-container') || 
                          element.closest('.form-group');
    
    if (fieldContainer) {
      label = fieldContainer.querySelector('label');
      if (label) return label;
    }
    
    return null;
  }

  /**
   * Infer entity type from label text
   */
  inferEntityTypeFromLabel(labelText) {
    const text = labelText.toLowerCase().trim();
    
    // Direct matches first
    const directMatches = {
      'organization group uuid': 'organization-group',
      'product uuid': 'product',
      'script uuid': 'script',
      'profile uuid': 'profile',
      'tag uuid': 'tag',
      'app uuid': 'application',
      'application uuid': 'application'
    };
    
    for (const [pattern, entityType] of Object.entries(directMatches)) {
      if (text.includes(pattern)) {
        return entityType;
      }
    }
    
    // Fallback pattern matching
    if (text.includes('organization') || text.includes('org group')) return 'organization-group';
    if (text.includes('product')) return 'product';
    if (text.includes('script')) return 'script';
    if (text.includes('profile')) return 'profile';
    if (text.includes('tag')) return 'tag';
    
    return 'application';
  }

  /**
   * Clear detected UUIDs (for cleanup)
   */
  clearDetectedUUIDs() {
    this.detectedUUIDs.clear();
    console.log('UUID Detector: Cleared detected UUIDs');
    
    // Also cleanup any mutation observers
    if (this.componentObservers) {
      this.componentObservers.forEach(observer => {
        observer.disconnect();
      });
      this.componentObservers = [];
      console.log('UUID Detector: Cleaned up mutation observers');
    }
  }

  /**
   * Scan a single element for UUIDs (used for delayed scanning)
   */
  scanSingleElement(element, source = 'single-element') {
    if (this.shouldSkipElement(element) || !this.isInValidActionContext(element)) {
      return [];
    }

    const foundUUIDs = [];
    const value = element.value || element.textContent || element.innerText || '';
    
    if (value && value.trim()) {
      const matches = value.match(this.uuidRegex);
      if (matches) {
        console.log(`UUID Detector: Found UUID in single element scan:`, value);
        
        matches.forEach(uuid => {
          if (!this.detectedUUIDs.has(uuid)) {
            this.detectedUUIDs.add(uuid);
            const entityType = this.inferEntityTypeFromElement(element);
            const uuidData = {
              uuid: uuid,
              element: element,
              entityType: entityType,
              context: source,
              source: 'delayed-scan'
            };
            console.log('UUID Detector: Adding UUID from single element scan:', uuidData);
            foundUUIDs.push(uuidData);
            
            // Trigger UI enhancement immediately
            if (window.uiEnhancer) {
              window.uiEnhancer.enhanceUI([uuidData]);
            }
          }
        });
      }
    }
    
    return foundUUIDs;
  }

  /**
   * Force scan all elements on the page (for manual triggering)
   */
  forceScanAllElements() {
    console.log('UUID Detector: Force scanning ALL elements...');
    const foundUUIDs = [];
    
    // First, do the aggressive action component scan
    this.aggressiveScanActionComponents(foundUUIDs);
    
    // Then scan ALL input elements, regardless of context
    const allInputs = document.querySelectorAll('input, textarea, select');
    console.log(`UUID Detector: Force scanning ${allInputs.length} input elements`);
    
    allInputs.forEach((element, index) => {
      this.aggressiveScanElement(element, `force-scan-input-${index}`, foundUUIDs);
    });
    
    // Scan all elements with potential data attributes
    const elementsWithData = document.querySelectorAll('[data-value], [data-uuid], [data-id], [ng-model], [ng-value]');
    console.log(`UUID Detector: Force scanning ${elementsWithData.length} elements with data attributes`);
    
    elementsWithData.forEach((element, index) => {
      this.aggressiveScanElement(element, `force-scan-data-${index}`, foundUUIDs);
    });
    
    // Also scan the page text for any UUIDs
    const allText = document.body.textContent || '';
    const textMatches = allText.match(this.uuidRegex);
    if (textMatches) {
      console.log(`UUID Detector: Force scan found ${textMatches.length} UUIDs in page text`);
      textMatches.forEach(uuid => {
        if (!this.detectedUUIDs.has(uuid)) {
          this.detectedUUIDs.add(uuid);
          const specificElement = this.findElementContainingUUID(document.body, uuid);
          const uuidData = {
            uuid: uuid,
            element: specificElement || document.body,
            entityType: this.inferEntityTypeFromPageContext(uuid),
            context: 'force-scan',
            source: 'page-text'
          };
          foundUUIDs.push(uuidData);
        }
      });
    }
    
    console.log(`UUID Detector: Force scan found ${foundUUIDs.length} total UUIDs`);
    return foundUUIDs;
  }

  /**
   * Angular-specific scanning for dynamically populated inputs
   */
  scanAngularDynamicInputs(foundUUIDs) {
    console.log('UUID Detector: Starting Angular dynamic input scan...');
    
    // Target Angular inputs that are commonly used for UUIDs
    const angularInputSelectors = [
      'input.clr-input[readonly]',
      'input.ng-pristine[readonly]', 
      'input.ng-valid[readonly]',
      'input.ng-star-inserted[readonly]',
      'input.ng-touched[readonly]',
      'input[class*="ng-"][readonly]',
      'input.clr-input.ng-pristine.ng-valid.ng-star-inserted[readonly]',
      'input[readonly][type="text"]',
      // Variable lookup inputs (for script UUIDs, etc.)
      'input.lookup-variable-input',
      'input.clr-input.lookup-variable-input',
      'input[class*="lookup-variable"]',
      // Inputs with UUID-related IDs
      'input[id*="uuid"]',
      'input[id*="UUID"]',
      'input[id*="_uuid"]',
      'input[id*="product_uuid"]',
      'input[id*="script_uuid"]',
      'input[id*="tag_uuid"]',
      'input[id*="app_uuid"]',
      'input[id*="profile_uuid"]',
      'input[id*="resource_uuid"]', // NEW: For script/workflow UUIDs
      'input[id^="undefined-resource_uuid"]', // SPECIFIC: Angular undefined pattern
      // Angular inputs that might not be readonly but contain UUIDs
      'input.clr-input.ng-pristine.ng-valid.ng-star-inserted.ng-touched',
      'input[class*="ng-pristine"][class*="ng-valid"]',
      // NEW: Clarity inputs with clrinput attribute
      'input[clrinput]',
      'input.clr-input[clrinput]',
      'input[clrinput][type="text"]',
      'input[clrinput].ng-pristine.ng-valid.ng-touched', // SPECIFIC: Angular state classes
      // NEW: Workflow-related inputs
      'input[placeholder*="workflow"]',
      'input[placeholder*="script"]',
      'input[placeholder*="The workflow UUID"]', // EXACT: The placeholder text we saw
      'input[placeholder*="UUID"]',
      'input[placeholder*="uuid"]',
      // NEW: Comprehensive Angular input patterns
      'input.clr-input.ng-pristine.ng-valid.ng-touched',
      'input.ng-pristine.ng-valid.ng-touched'
    ];
    
    angularInputSelectors.forEach(selector => {
      const inputs = document.querySelectorAll(selector);
      console.log(`UUID Detector: Found ${inputs.length} Angular inputs for selector: ${selector}`);
      
      inputs.forEach((input, index) => {
        console.log(`UUID Detector: Checking Angular input ${index} (${selector}):`, {
          value: input.value,
          className: input.className,
          id: input.id,
          placeholder: input.placeholder,
          readonly: input.readonly,
          type: input.type
        });
        
        // Try multiple ways to get the value
        const valueSources = [
          { name: 'value', val: input.value },
          { name: 'getAttribute-value', val: input.getAttribute('value') },
          { name: 'defaultValue', val: input.defaultValue },
          { name: 'textContent', val: input.textContent },
          { name: 'innerText', val: input.innerText },
          { name: 'placeholder', val: input.placeholder },
          { name: 'title', val: input.title },
          { name: 'data-value', val: input.getAttribute('data-value') },
          { name: 'ng-model', val: input.getAttribute('ng-model') },
          { name: 'ng-value', val: input.getAttribute('ng-value') }
        ];
        
        valueSources.forEach(source => {
          if (source.val && source.val.trim()) {
            const matches = source.val.match(this.uuidRegex);
            if (matches) {
              console.log(`🎯 UUID Detector: FOUND UUID in Angular input via ${source.name}:`, source.val);
              
              matches.forEach(uuid => {
                if (!this.detectedUUIDs.has(uuid)) {
                  this.detectedUUIDs.add(uuid);
                  
                  // Infer entity type from ID and classes
                  const entityType = this.inferEntityTypeFromAngularInput(input, uuid);
                  
                  const uuidData = {
                    uuid: uuid,
                    element: input,
                    entityType: entityType,
                    context: 'angular-dynamic-input',
                    source: `angular-${selector}-${source.name}`,
                    inputInfo: {
                      id: input.id,
                      classes: input.className,
                      selector: selector
                    }
                  };
                  console.log('✅ UUID Detector: Adding Angular UUID:', uuidData);
                  foundUUIDs.push(uuidData);
                }
              });
            }
          }
        });
      });
    });
  }

  /**
   * Special method to detect Angular inputs with undefined-resource_uuid pattern
   */
  scanUndefinedResourceUuidInputs(foundUUIDs) {
    console.log('UUID Detector: Scanning for undefined-resource_uuid inputs...');
    
    // Multiple selectors to catch this specific pattern
    const undefinedResourceSelectors = [
      'input[id^="undefined-resource_uuid"]',
      'input[id*="undefined-resource_uuid"]',
      'input[clrinput][id*="resource_uuid"]',
      'input[placeholder*="The workflow UUID"]',
      // NEW: Target the specific Angular component structure
      'dpa-go-connector-action-card input[clrinput]',
      'dpa-automation-connector-action-settings-editor input[clrinput]',
      'dpa-default-form-field input[clrinput]',
      'clr-input-container input[clrinput]',
      // NEW: Target radio button form structure
      'dpa-lookup-form-field input[clrinput]',
      'dpa-form-field input[id*="resource_uuid"]'
    ];
    
    undefinedResourceSelectors.forEach(selector => {
      const inputs = document.querySelectorAll(selector);
      console.log(`UUID Detector: Found ${inputs.length} inputs for undefined-resource pattern: ${selector}`);
      
      inputs.forEach((input, i) => {
        console.log(`🎯 UNDEFINED-RESOURCE INPUT ${i}:`, {
          id: input.id,
          value: input.value,
          placeholder: input.placeholder,
          className: input.className,
          clrinput: input.hasAttribute('clrinput'),
          type: input.type,
          readonly: input.readonly,
          parentComponent: input.closest('dpa-go-connector-action-card') ? 'connector-action-card' : 'other'
        });
        
        // Check if this input is within a radio button form
        const isInRadioForm = input.closest('dpa-lookup-form');
        if (isInRadioForm) {
          console.log(`🎯 Input ${input.id} is within a radio button lookup form`);
          
          // Check which radio button is selected
          const radioButtons = isInRadioForm.querySelectorAll('input[type="radio"]');
          radioButtons.forEach((radio, radioIndex) => {
            console.log(`Radio ${radioIndex}: checked=${radio.checked}, id=${radio.id}`);
          });
        }
        
        // Set up intensive monitoring for this input
        this.setupIntensiveMonitoring(input, foundUUIDs);
        
        // Check current value
        if (input.value && input.value.trim()) {
          const uuidMatches = input.value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
          if (uuidMatches) {
            uuidMatches.forEach(uuid => {
              console.log(`🎯 FOUND UUID in undefined-resource input: ${uuid}`);
              
              const uuidInfo = {
                uuid: uuid.toLowerCase(),
                element: input,
                context: 'undefined-resource-uuid',
                entityType: 'script', // Default to script for resource_uuid
                source: 'angular-undefined-resource',
                inputId: input.id,
                inputPlaceholder: input.placeholder
              };
              
              foundUUIDs.push(uuidInfo);
            });
          }
        }
      });
    });
    
    // NEW: Also monitor radio button changes to detect when custom value mode is enabled
    this.monitorRadioButtonChanges();
  }

  /**
   * Set up intensive monitoring for specific inputs
   */
  setupIntensiveMonitoring(input, foundUUIDs) {
    console.log(`🔍 Setting up intensive monitoring for input: ${input.id}`);
    
    // Multiple event listeners
    ['input', 'change', 'blur', 'focus', 'keyup', 'paste'].forEach(eventType => {
      input.addEventListener(eventType, () => {
        console.log(`🔍 ${eventType} event on ${input.id}, current value: "${input.value}"`);
        setTimeout(() => {
          if (input.value && /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value)) {
            console.log(`🎯 UUID detected after ${eventType} event: ${input.value}`);
            this.scanForUUIDs(); // Re-scan when UUID is detected
          }
        }, 100);
      });
    });
    
    // MutationObserver for attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
          console.log(`🔍 Attribute ${mutation.attributeName} changed on ${input.id}`);
          if (mutation.attributeName === 'value' || mutation.attributeName === 'ng-reflect-model') {
            setTimeout(() => {
              console.log(`🔍 Checking value after attribute change: "${input.value}"`);
              if (input.value && /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value)) {
                this.scanForUUIDs();
              }
            }, 200);
          }
        }
      });
    });
    
    observer.observe(input, {
      attributes: true,
      attributeFilter: ['value', 'ng-reflect-model', 'ng-model', 'data-value']
    });
    
    // Periodic checking for this specific input
    let checkCount = 0;
    const periodicCheck = setInterval(() => {
      checkCount++;
      console.log(`🔍 Periodic check ${checkCount} for ${input.id}: "${input.value}"`);
      
      if (input.value && /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(input.value)) {
        console.log(`🎯 UUID found in periodic check: ${input.value}`);
        this.scanForUUIDs();
        clearInterval(periodicCheck); // Stop checking once we find a UUID
      }
      
      if (checkCount >= 60) { // Stop after 60 seconds
        clearInterval(periodicCheck);
      }
    }, 1000);
  }

  /**
   * Monitor radio button changes in lookup forms
   */
  monitorRadioButtonChanges() {
    console.log('🔍 Setting up radio button monitoring for lookup forms...');
    
    // Find all lookup forms with radio buttons
    const lookupForms = document.querySelectorAll('dpa-lookup-form');
    console.log(`🔍 Found ${lookupForms.length} lookup forms`);
    
    lookupForms.forEach((form, formIndex) => {
      const radioButtons = form.querySelectorAll('input[type="radio"]');
      console.log(`🔍 Lookup form ${formIndex} has ${radioButtons.length} radio buttons`);
      
      radioButtons.forEach((radio, radioIndex) => {
        console.log(`🔍 Radio ${radioIndex}: id=${radio.id}, checked=${radio.checked}`);
        
        radio.addEventListener('change', () => {
          console.log(`🔍 Radio button changed: ${radio.id}, checked=${radio.checked}`);
          
          // Check if this is the "Enter custom value" option (usually the second radio)
          if (radio.checked && radio.id.includes('lookup1')) {
            console.log(`🎯 "Enter custom value" mode activated for ${radio.id}`);
            
            // Look for the associated input field
            setTimeout(() => {
              const associatedInput = form.querySelector('input[clrinput]');
              if (associatedInput) {
                console.log(`🎯 Found associated input: ${associatedInput.id}`);
                this.setupIntensiveMonitoring(associatedInput, []);
                
                // Focus on the input to make it active
                associatedInput.focus();
              }
            }, 500);
          }
        });
      });
    });
  }

  /**
   * Infer entity type specifically from Angular input attributes and IDs
   */
  inferEntityTypeFromAngularInput(input, uuid) {
    console.log(`UUID Detector: Inferring entity type from Angular input for UUID ${uuid}`);
    
    // Check input ID for entity type clues
    const inputId = input.id || '';
    console.log(`UUID Detector: Input ID: "${inputId}"`);
    
    if (inputId.includes('product_uuid') || inputId.includes('product-uuid')) {
      console.log('UUID Detector: Detected PRODUCT from input ID');
      return 'product';
    }
    if (inputId.includes('script_uuid') || inputId.includes('script-uuid')) {
      console.log('UUID Detector: Detected SCRIPT from input ID');
      return 'script';
    }
    if (inputId.includes('resource_uuid') || inputId.includes('resource-uuid')) {
      console.log('UUID Detector: Detected SCRIPT (resource) from input ID');
      return 'script'; // resource_uuid typically refers to scripts/workflows
    }
    if (inputId.includes('tag_uuid') || inputId.includes('tag-uuid')) {
      console.log('UUID Detector: Detected TAG from input ID');
      return 'tag';
    }
    // ENHANCED: More comprehensive application UUID detection
    if (inputId.includes('app_uuid') || inputId.includes('app-uuid') || 
        inputId.includes('application_uuid') || inputId.includes('application-uuid') ||
        inputId.includes('undefined-application_uuid')) {
      console.log('UUID Detector: Detected APPLICATION from input ID');
      return 'application';
    }
    if (inputId.includes('profile_uuid') || inputId.includes('profile-uuid')) {
      console.log('UUID Detector: Detected PROFILE from input ID');
      return 'profile';
    }
    if (inputId.includes('org_uuid') || inputId.includes('organization_uuid')) {
      console.log('UUID Detector: Detected ORGANIZATION-GROUP from input ID');
      return 'organization-group';
    }
    
    // Check placeholder for entity type clues
    const placeholder = input.placeholder || '';
    console.log(`UUID Detector: Input placeholder: "${placeholder}"`);
    
    if (placeholder.toLowerCase().includes('workflow')) {
      console.log('UUID Detector: Detected SCRIPT from workflow placeholder');
      return 'script';
    }
    if (placeholder.toLowerCase().includes('script')) {
      console.log('UUID Detector: Detected SCRIPT from script placeholder');
      return 'script';
    }
    if (placeholder.toLowerCase().includes('product')) {
      console.log('UUID Detector: Detected PRODUCT from placeholder');
      return 'product';
    }
    if (placeholder.toLowerCase().includes('tag')) {
      console.log('UUID Detector: Detected TAG from placeholder');
      return 'tag';
    }
    if (placeholder.toLowerCase().includes('app') || placeholder.toLowerCase().includes('application')) {
      console.log('UUID Detector: Detected APPLICATION from placeholder');
      return 'application';
    }
    if (placeholder.toLowerCase().includes('profile')) {
      console.log('UUID Detector: Detected PROFILE from placeholder');
      return 'profile';
    }
    
    // Check input classes for clues
    const inputClasses = input.className || '';
    console.log(`UUID Detector: Input classes: "${inputClasses}"`);
    
    if (inputClasses.includes('lookup-variable-input')) {
      console.log('UUID Detector: Detected lookup-variable-input, checking context...');
      
      // For lookup variable inputs, check the surrounding context more aggressively
      let contextElement = input.parentElement;
      let depth = 0;
      
      while (contextElement && depth < 5) {
        const contextText = contextElement.textContent || '';
        console.log(`UUID Detector: Context text at depth ${depth}: "${contextText.substring(0, 200)}"`);
        
        if (contextText.toLowerCase().includes('workflow')) return 'script';
        if (contextText.toLowerCase().includes('script')) return 'script';
        if (contextText.toLowerCase().includes('product')) return 'product';
        if (contextText.toLowerCase().includes('tag')) return 'tag';
        if (contextText.toLowerCase().includes('application') || contextText.toLowerCase().includes('app')) return 'application';
        if (contextText.toLowerCase().includes('profile')) return 'profile';
        if (contextText.toLowerCase().includes('organization') || contextText.toLowerCase().includes('org group')) return 'organization-group';
        
        contextElement = contextElement.parentElement;
        depth++;
      }
    }
    
    // Check name attribute
    const inputName = input.name || '';
    if (inputName.includes('workflow') || inputName.includes('script')) return 'script';
    if (inputName.includes('product')) return 'product';
    if (inputName.includes('tag')) return 'tag';
    if (inputName.includes('app') || inputName.includes('application')) return 'application';
    if (inputName.includes('profile')) return 'profile';
    if (inputName.includes('org') || inputName.includes('organization')) return 'organization-group';
    
    // Check for clrinput attribute and workflow context
    if (input.hasAttribute('clrinput')) {
      console.log('UUID Detector: Found clrinput attribute, checking workflow context...');
      
      // Check nearby labels for context
      const labelFor = document.querySelector(`label[for="${input.id}"]`);
      if (labelFor) {
        const labelText = labelFor.textContent.toLowerCase();
        console.log(`UUID Detector: Found label: "${labelText}"`);
        
        if (labelText.includes('workflow') || labelText.includes('script')) return 'script';
        if (labelText.includes('product')) return 'product';
        if (labelText.includes('tag')) return 'tag';
        if (labelText.includes('app') || labelText.includes('application')) return 'application';
        if (labelText.includes('profile')) return 'profile';
      }
    }
    
    // Default fallback to surrounding elements method
    const surroundingType = this.inferEntityTypeFromSurroundingElements(input, uuid);
    console.log(`UUID Detector: Using surrounding elements fallback: ${surroundingType}`);
    return surroundingType;
  }
  
  /**
   * Advanced Angular monitoring for programmatic value changes
   */
  setupAdvancedAngularMonitoring() {
    console.log('🔍 Setting up advanced Angular monitoring for programmatic value changes...');
    
    // Target the specific input pattern we're dealing with
    const targetSelectors = [
      'input[id*="resource_uuid"]',
      'input[clrinput]',
      'input[placeholder*="workflow"]',
      'dpa-go-connector-action-card input',
      'dpa-automation-connector-action-settings-editor input'
    ];
    
    targetSelectors.forEach(selector => {
      const inputs = document.querySelectorAll(selector);
      console.log(`🔍 Setting up advanced monitoring for ${inputs.length} inputs matching: ${selector}`);
      
      inputs.forEach((input, i) => {
        console.log(`🔍 Advanced monitoring setup for input ${i}:`, {
          id: input.id,
          value: input.value,
          placeholder: input.placeholder
        });
        
        this.setupAngularValueMonitoring(input);
      });
    });
    
    // Also set up a global mutation observer for Angular changes
    this.setupGlobalAngularObserver();
  }

  /**
   * Set up comprehensive monitoring for Angular value changes
   */
  setupAngularValueMonitoring(input) {
    const inputId = input.id || 'unknown';
    console.log(`🔍 Setting up Angular value monitoring for: ${inputId}`);
    
    // Store original value for comparison
    let lastKnownValue = input.value || '';
    
    // Method 1: MutationObserver for all attribute changes
    const attributeObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
          const currentValue = input.value || '';
          if (currentValue !== lastKnownValue && currentValue.trim()) {
            console.log(`🎯 Angular attribute change detected in ${inputId}: "${lastKnownValue}" → "${currentValue}"`);
            this.handleAngularValueChange(input, currentValue);
            lastKnownValue = currentValue;
          }
        }
      });
    });
    
    attributeObserver.observe(input, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['value', 'ng-reflect-model', 'data-value', 'ng-model']
    });
    
    // Method 2: Property monitoring using Object.defineProperty
    try {
      const originalValueDescriptor = Object.getOwnPropertyDescriptor(input, 'value') || 
                                     Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      
      Object.defineProperty(input, 'value', {
        get: function() {
          return originalValueDescriptor.get.call(this);
        },
        set: function(newValue) {
          const oldValue = originalValueDescriptor.get.call(this);
          originalValueDescriptor.set.call(this, newValue);
          
          if (newValue !== oldValue && newValue && newValue.trim()) {
            console.log(`🎯 Angular property change detected in ${inputId}: "${oldValue}" → "${newValue}"`);
            setTimeout(() => {
              uuidDetector.handleAngularValueChange(this, newValue);
            }, 100);
          }
        },
        configurable: true,
        enumerable: true
      });
    } catch (error) {
      console.log(`🔍 Could not set up property monitoring for ${inputId}:`, error);
    }
    
    // Method 3: Periodic polling for value changes
    let pollCount = 0;
    const pollInterval = setInterval(() => {
      const currentValue = input.value || '';
      if (currentValue !== lastKnownValue && currentValue.trim()) {
        console.log(`🎯 Polling detected value change in ${inputId}: "${lastKnownValue}" → "${currentValue}"`);
        this.handleAngularValueChange(input, currentValue);
        lastKnownValue = currentValue;
      }
      
      pollCount++;
      if (pollCount >= 300) { // Stop after 5 minutes of polling
        clearInterval(pollInterval);
      }
    }, 1000);
    
    // Method 4: Event listeners for all possible input events
    const events = ['input', 'change', 'blur', 'focus', 'keyup', 'paste', 'propertychange', 'DOMSubtreeModified'];
    events.forEach(eventType => {
      input.addEventListener(eventType, () => {
        const currentValue = input.value || '';
        if (currentValue !== lastKnownValue && currentValue.trim()) {
          console.log(`🎯 Event "${eventType}" detected value change in ${inputId}: "${lastKnownValue}" → "${currentValue}"`);
          this.handleAngularValueChange(input, currentValue);
          lastKnownValue = currentValue;
        }
      }, true);
    });
    
    // Method 5: Check for Angular-specific attributes
    const angularCheck = setInterval(() => {
      const ngReflectModel = input.getAttribute('ng-reflect-model');
      const ngModel = input.getAttribute('ng-model');
      const dataValue = input.getAttribute('data-value');
      
      [ngReflectModel, ngModel, dataValue].forEach(attrValue => {
        if (attrValue && attrValue !== lastKnownValue && attrValue.trim()) {
          console.log(`🎯 Angular attribute detected value in ${inputId}: "${attrValue}"`);
          this.handleAngularValueChange(input, attrValue);
          lastKnownValue = attrValue;
        }
      });
    }, 500);
    
    // Stop angular checking after 5 minutes
    setTimeout(() => clearInterval(angularCheck), 300000);
  }

  /**
   * Handle detected Angular value changes
   */
  handleAngularValueChange(input, value) {
    console.log(`🎯 Processing Angular value change: "${value}" in input ${input.id}`);
    
    // Check if the value contains a UUID
    const uuidMatches = value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
    if (uuidMatches) {
      uuidMatches.forEach(uuid => {
        console.log(`🎯 UUID DETECTED via Angular monitoring: ${uuid}`);
        
        // Determine entity type
        const entityType = this.inferEntityTypeFromAngularInput(input, uuid);
        
        const uuidInfo = {
          uuid: uuid.toLowerCase(),
          element: input,
          context: 'angular-programmatic-change',
          entityType: entityType,
          source: 'angular-value-monitoring',
          inputId: input.id,
          inputPlaceholder: input.placeholder
        };
        
        // Add to detected UUIDs if not already detected
        if (!this.detectedUUIDs.has(uuid.toLowerCase())) {
          this.detectedUUIDs.add(uuid.toLowerCase());
          console.log(`🎯 Adding newly detected UUID: ${uuid}`);
          
          // Trigger immediate UI enhancement
          setTimeout(() => {
            if (window.uiEnhancer) {
              uiEnhancer.enhanceUI([uuidInfo]);
            }
          }, 200);
        }
      });
    }
  }

  /**
   * Ultra-aggressive Angular JavaScript value detection
   */
  setupAngularJavaScriptValueDetection() {
    console.log('🎯 Setting up ultra-aggressive Angular JavaScript value detection...');
    
    // Hook into Angular's change detection cycle
    this.hookIntoAngularChangeDetection();
    
    // Monitor JavaScript property assignments
    this.interceptJavaScriptPropertyAssignments();
    
    // Hook into Angular form controls and data binding
    this.hookIntoAngularFormControls();
    
    // Monitor for Angular component state changes
    this.monitorAngularComponentState();
    
    // Set up deep DOM scanning for hidden values
    this.setupDeepDOMScanning();
  }

  /**
   * Hook into Angular's change detection mechanism
   */
  hookIntoAngularChangeDetection() {
    console.log('🎯 Hooking into Angular change detection...');
    
    // Try to access Angular's global reference
    const checkAngularGlobals = () => {
      // Check for Angular debugging utilities
      if (window.ng) {
        console.log('🎯 Found Angular debugging utilities');
        this.monitorAngularElements();
      }
      
      // Check for Angular in development mode
      if (window.getAllAngularRootElements) {
        console.log('🎯 Found Angular root elements function');
        try {
          const rootElements = window.getAllAngularRootElements();
          rootElements.forEach(element => {
            this.monitorAngularElementTree(element);
          });
        } catch (error) {
          console.log('🎯 Error accessing Angular root elements:', error);
        }
      }
      
      // Check for Angular DevTools
      if (window.ngDevMode) {
        console.log('🎯 Angular development mode detected');
      }
    };
    
    checkAngularGlobals();
    
    // Also check periodically as Angular might load later
    setTimeout(checkAngularGlobals, 2000);
    setTimeout(checkAngularGlobals, 5000);
  }

  /**
   * Monitor Angular elements for component data
   */
  monitorAngularElements() {
    console.log('🎯 Monitoring Angular elements for component data...');
    
    // Find all Angular components
    const angularElements = document.querySelectorAll('[ng-version], [_nghost-*], [_ngcontent-*]');
    console.log(`🎯 Found ${angularElements.length} Angular elements`);
    
    angularElements.forEach((element, i) => {
      try {
        // Try to access Angular component data
        if (window.ng && window.ng.getComponent) {
          const component = window.ng.getComponent(element);
          if (component) {
            console.log(`🎯 Angular Component ${i}:`, component);
            this.scanComponentForUUIDs(component, element);
          }
        }
        
        // Try to access Angular context
        if (window.ng && window.ng.getContext) {
          const context = window.ng.getContext(element);
          if (context) {
            console.log(`🎯 Angular Context ${i}:`, context);
            this.scanContextForUUIDs(context, element);
          }
        }
        
        // Try to access the element's Angular properties
        const ngProperties = Object.getOwnPropertyNames(element).filter(prop => prop.startsWith('__ng'));
        ngProperties.forEach(prop => {
          try {
            const value = element[prop];
            if (value && typeof value === 'object') {
              this.scanObjectForUUIDs(value, element, `angular-property-${prop}`);
            }
          } catch (error) {
            // Ignore property access errors
          }
        });
        
      } catch (error) {
        console.log(`🎯 Error accessing Angular element ${i}:`, error);
      }
    });
  }

  /**
   * Monitor Angular element tree recursively
   */
  monitorAngularElementTree(rootElement) {
    console.log('🎯 Monitoring Angular element tree...');
    
    const walker = document.createTreeWalker(
      rootElement,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          // Accept elements that might contain UUIDs or Angular data
          return (node.tagName === 'INPUT' || 
                  node.hasAttribute('_ngcontent-ng-c') ||
                  node.className.includes('ng-') ||
                  node.id.includes('uuid')) ? 
                  NodeFilter.FILTER_ACCEPT : 
                  NodeFilter.FILTER_SKIP;
        }
      }
    );
    
    let node;
    while (node = walker.nextNode()) {
      this.scanElementForHiddenUUIDs(node);
    }
  }

  /**
   * Scan Angular component for UUIDs
   */
  scanComponentForUUIDs(component, element) {
    console.log('🎯 Scanning Angular component for UUIDs...');
    
    try {
      // Convert component to JSON to scan all properties
      const componentStr = JSON.stringify(component, null, 2);
      const uuidMatches = componentStr.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
      
      if (uuidMatches) {
        console.log(`🎯 Found UUIDs in Angular component:`, uuidMatches);
        
        uuidMatches.forEach(uuid => {
          this.processHiddenUUID(uuid, element, 'angular-component');
        });
      }
      
      // Also scan specific properties that commonly contain UUIDs
      const uuidProperties = ['value', 'model', 'data', 'formValue', 'initialValue', 'currentValue'];
      uuidProperties.forEach(prop => {
        if (component[prop]) {
          this.scanValueForUUIDs(component[prop], element, `component-${prop}`);
        }
      });
      
    } catch (error) {
      console.log('🎯 Error scanning component:', error);
    }
  }

  /**
   * Scan Angular context for UUIDs
   */
  scanContextForUUIDs(context, element) {
    console.log('🎯 Scanning Angular context for UUIDs...');
    
    try {
      // Scan the context object
      this.scanObjectForUUIDs(context, element, 'angular-context');
      
      // Look for form controls
      if (context.$implicit) {
        this.scanObjectForUUIDs(context.$implicit, element, 'angular-implicit');
      }
      
      if (context.ngModel) {
        this.scanValueForUUIDs(context.ngModel, element, 'angular-ngModel');
      }
      
    } catch (error) {
      console.log('🎯 Error scanning context:', error);
    }
  }

  /**
   * Intercept JavaScript property assignments
   */
  interceptJavaScriptPropertyAssignments() {
    console.log('🎯 Intercepting JavaScript property assignments...');
    
    // Override Object.defineProperty to catch Angular property definitions
    const originalDefineProperty = Object.defineProperty;
    Object.defineProperty = function(obj, prop, descriptor) {
      const result = originalDefineProperty.call(this, obj, prop, descriptor);
      
      // Check if this is setting a value that might contain a UUID
      if (descriptor.value && typeof descriptor.value === 'string' && 
          /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(descriptor.value)) {
        console.log(`🎯 defineProperty intercepted UUID: ${descriptor.value}`);
        setTimeout(() => {
          uuidDetector.processHiddenUUID(descriptor.value, obj, 'defineProperty');
        }, 100);
      }
      
      return result;
    };
    
    // Override JSON.parse to catch UUID data
    const originalJSONParse = JSON.parse;
    JSON.parse = function(text) {
      const result = originalJSONParse.call(this, text);
      
      // Check if parsed data contains UUIDs
      if (typeof text === 'string' && 
          /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(text)) {
        console.log(`🎯 JSON.parse intercepted UUID data:`, text);
        const uuidMatches = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
        if (uuidMatches) {
          uuidMatches.forEach(uuid => {
            setTimeout(() => {
              uuidDetector.processHiddenUUID(uuid, null, 'json-parse');
            }, 100);
          });
        }
      }
      
      return result;
    };
  }

  /**
   * Hook into Angular form controls
   */
  hookIntoAngularFormControls() {
    console.log('🎯 Hooking into Angular form controls...');
    
    // Set up interval to scan for Angular form controls
    setInterval(() => {
      // Look for Angular form elements
      const formElements = document.querySelectorAll('[formcontrolname], [ng-model], [ngModel]');
      
      formElements.forEach(element => {
        try {
          // Try to access the form control value
          if (window.ng && window.ng.getComponent) {
            const component = window.ng.getComponent(element);
            if (component && component.form) {
              this.scanFormForUUIDs(component.form, element);
            }
          }
          
          // Check element attributes for Angular bindings
          const ngModel = element.getAttribute('ng-model') || element.getAttribute('ngModel');
          const formControlName = element.getAttribute('formcontrolname');
          
          if (ngModel || formControlName) {
            console.log(`🎯 Found Angular form control:`, {
              ngModel,
              formControlName,
              value: element.value
            });
            
            // Monitor this element more intensively
            this.setupUltraIntensiveElementMonitoring(element);
          }
          
        } catch (error) {
          console.log('🎯 Error accessing form control:', error);
        }
      });
    }, 3000);
  }

  /**
   * Scan Angular form for UUIDs
   */
  scanFormForUUIDs(form, element) {
    console.log('🎯 Scanning Angular form for UUIDs...');
    
    try {
      // Get form value
      if (form.value) {
        this.scanObjectForUUIDs(form.value, element, 'angular-form-value');
      }
      
      // Get raw value
      if (form.getRawValue) {
        const rawValue = form.getRawValue();
        this.scanObjectForUUIDs(rawValue, element, 'angular-form-raw');
      }
      
      // Scan individual controls
      if (form.controls) {
        Object.keys(form.controls).forEach(key => {
          const control = form.controls[key];
          if (control.value) {
            this.scanValueForUUIDs(control.value, element, `angular-control-${key}`);
          }
        });
      }
      
    } catch (error) {
      console.log('🎯 Error scanning form:', error);
    }
  }

  /**
   * Monitor Angular component state changes
   */
  monitorAngularComponentState() {
    console.log('🎯 Monitoring Angular component state changes...');
    
    // Hook into common Angular lifecycle methods
    const lifecycleMethods = ['ngOnInit', 'ngOnChanges', 'ngAfterViewInit', 'ngAfterViewChecked'];
    
    // Try to monkey patch Angular lifecycle (risky but comprehensive)
    if (window.ng && window.ng.core) {
      try {
        // This is very advanced and might not work in all cases
        console.log('🎯 Attempting to hook into Angular core...');
      } catch (error) {
        console.log('🎯 Could not hook into Angular core:', error);
      }
    }
  }

  /**
   * Set up deep DOM scanning for hidden values
   */
  setupDeepDOMScanning() {
    console.log('🎯 Setting up deep DOM scanning for hidden values...');
    
    // Scan all text nodes for UUIDs
    const scanAllTextNodes = () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let textNode;
      while (textNode = walker.nextNode()) {
        const text = textNode.textContent;
        if (text && text.trim()) {
          const uuidMatches = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
          if (uuidMatches) {
            console.log(`🎯 Found UUIDs in text node:`, uuidMatches);
            uuidMatches.forEach(uuid => {
              this.processHiddenUUID(uuid, textNode.parentElement, 'text-node');
            });
          }
        }
      }
    };
    
    // Scan immediately and then periodically
    scanAllTextNodes();
    setInterval(scanAllTextNodes, 10000); // Every 10 seconds
    
    // Scan all element attributes
    setInterval(() => {
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        Array.from(element.attributes).forEach(attr => {
          if (attr.value && /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(attr.value)) {
            console.log(`🎯 Found UUID in attribute ${attr.name}:`, attr.value);
            const uuidMatches = attr.value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
            if (uuidMatches) {
              uuidMatches.forEach(uuid => {
                this.processHiddenUUID(uuid, element, `attribute-${attr.name}`);
              });
            }
          }
        });
      });
    }, 15000); // Every 15 seconds
  }

  /**
   * Scan an object recursively for UUIDs
   */
  scanObjectForUUIDs(obj, element, source) {
    try {
      const objStr = JSON.stringify(obj);
      const uuidMatches = objStr.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
      
      if (uuidMatches) {
        console.log(`🎯 Found UUIDs in ${source}:`, uuidMatches);
        uuidMatches.forEach(uuid => {
          this.processHiddenUUID(uuid, element, source);
        });
      }
    } catch (error) {
      // Ignore circular reference errors
    }
  }

  /**
   * Scan a value for UUIDs
   */
  scanValueForUUIDs(value, element, source) {
    if (typeof value === 'string' && value.trim()) {
      const uuidMatches = value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
      if (uuidMatches) {
        console.log(`🎯 Found UUIDs in ${source}:`, uuidMatches);
        uuidMatches.forEach(uuid => {
          this.processHiddenUUID(uuid, element, source);
        });
      }
    }
  }

  /**
   * Process hidden UUIDs found via JavaScript
   */
  processHiddenUUID(uuid, element, source) {
    console.log(`🎯 Processing hidden UUID: ${uuid} from ${source}`);
    
    if (!this.detectedUUIDs.has(uuid.toLowerCase())) {
      this.detectedUUIDs.add(uuid.toLowerCase());
      
      // Try to determine entity type from context
      let entityType = 'unknown';
      
      if (element) {
        // Use existing entity type inference methods
        if (element.tagName === 'INPUT') {
          entityType = this.inferEntityTypeFromAngularInput(element, uuid);
        } else {
          entityType = this.inferEntityTypeFromElement(element);
        }
        
        // If still unknown, try to infer from source
        if (entityType === 'unknown') {
          if (source.includes('application') || source.includes('app')) {
            entityType = 'application';
          } else if (source.includes('script') || source.includes('resource')) {
            entityType = 'script';
          } else if (source.includes('tag')) {
            entityType = 'tag';
          } else if (source.includes('product')) {
            entityType = 'product';
          } else if (source.includes('profile')) {
            entityType = 'profile';
          }
        }
      }
      
      const uuidInfo = {
        uuid: uuid.toLowerCase(),
        element: element,
        context: `hidden-javascript-${source}`,
        entityType: entityType,
        source: 'javascript-hidden-value',
        detectionMethod: source
      };
      
      console.log(`🎯 Adding hidden UUID: ${uuid} as ${entityType} from ${source}`);
      
      // Trigger immediate UI enhancement
      setTimeout(() => {
        if (window.uiEnhancer) {
          uiEnhancer.enhanceUI([uuidInfo]);
        }
      }, 200);
    }
  }

  /**
   * Scan element for hidden UUIDs (beyond visible properties)
   */
  scanElementForHiddenUUIDs(element) {
    try {
      // Check all properties of the element
      const elementKeys = Object.getOwnPropertyNames(element);
      elementKeys.forEach(key => {
        try {
          const value = element[key];
          if (typeof value === 'string' && value.trim()) {
            this.scanValueForUUIDs(value, element, `element-property-${key}`);
          }
        } catch (error) {
          // Ignore property access errors
        }
      });
      
      // Check data attributes
      if (element.dataset) {
        Object.keys(element.dataset).forEach(key => {
          const value = element.dataset[key];
          if (value && value.trim()) {
            this.scanValueForUUIDs(value, element, `data-${key}`);
          }
        });
      }
      
      // Check for Angular-specific properties
      ['__ngContext__', '__ng_component__', '__ng_bound__'].forEach(prop => {
        try {
          if (element[prop]) {
            this.scanObjectForUUIDs(element[prop], element, prop);
          }
        } catch (error) {
          // Ignore
        }
      });
      
    } catch (error) {
      console.log('🎯 Error scanning element for hidden UUIDs:', error);
    }
  }

  /**
   * Ultra-intensive element monitoring (more aggressive than previous versions)
   */
  setupUltraIntensiveElementMonitoring(element) {
    console.log(`🎯 Setting up ULTRA-INTENSIVE monitoring for element: ${element.id || element.tagName}`);
    
    // All the previous monitoring methods plus:
    this.setupIntensiveElementMonitoring(element);
    
    // Additional JavaScript-focused monitoring
    
    // Monitor for property descriptor changes
    const properties = ['value', 'textContent', 'innerHTML', 'innerText'];
    properties.forEach(prop => {
      try {
        const originalDescriptor = Object.getOwnPropertyDescriptor(element, prop) ||
                                  Object.getOwnPropertyDescriptor(element.constructor.prototype, prop);
        
        if (originalDescriptor) {
          Object.defineProperty(element, prop, {
            get: originalDescriptor.get,
            set: function(newValue) {
              const oldValue = originalDescriptor.get ? originalDescriptor.get.call(this) : '';
              if (originalDescriptor.set) {
                originalDescriptor.set.call(this, newValue);
              }
              
              if (newValue && newValue !== oldValue && typeof newValue === 'string') {
                console.log(`🎯 ULTRA-INTENSIVE: ${prop} changed to "${newValue}"`);
                uuidDetector.scanValueForUUIDs(newValue, this, `ultra-intensive-${prop}`);
              }
            },
            configurable: true,
            enumerable: originalDescriptor.enumerable
          });
        }
      } catch (error) {
        console.log(`🎯 Could not set up ultra-intensive monitoring for ${prop}:`, error);
      }
    });
    
    // Set up very frequent scanning of this specific element
    let scanCount = 0;
    const ultraFrequentScan = setInterval(() => {
      this.scanElementForHiddenUUIDs(element);
      scanCount++;
      
      if (scanCount >= 300) { // Stop after 5 minutes
        clearInterval(ultraFrequentScan);
      }
    }, 1000); // Every second
  }
}

// Export for use in other modules
window.UUIDDetector = UUIDDetector;
