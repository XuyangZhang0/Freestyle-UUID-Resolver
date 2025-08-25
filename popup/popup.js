/**
 * Popup JavaScript for UUID Resolver Extension
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('UUID Resolver Popup: DOM loaded, starting initialization...');
  
  try {
    await initializePopup();
    setupEventListeners();
    await loadSettings();
    await loadStatistics();
    
    // Set up auto-save on popup close
    setupAutoSaveOnClose();
    
    console.log('UUID Resolver Popup: All initialization complete');
  } catch (error) {
    console.error('UUID Resolver Popup: Initialization failed:', error);
    showLoadingIndicator(false); // Ensure loading screen is hidden
    showToast('Failed to initialize popup: ' + error.message, 'error');
  }
});

let currentSettings = {};
let autoSaveTimer = null;
let hasUnsavedChanges = false;

/**
 * Initialize popup
 */
async function initializePopup() {
  console.log('UUID Resolver Popup: Initializing...');
  
  // Set version number
  const manifest = chrome.runtime.getManifest();
  document.getElementById('versionNumber').textContent = manifest.version;
  
  // Check if current tab is a UEM page
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isUEMPage = tab && (tab.url.includes('.awmdm.com') || tab.url.includes('workspaceone'));
    
    if (!isUEMPage) {
      showToast('This extension works on Workspace ONE UEM pages', 'warning');
      updateStatus('Not on UEM page', 'warning');
    } else {
      updateStatus('Ready', 'active');
    }
  } catch (error) {
    console.error('Failed to check current tab:', error);
    updateStatus('Ready', 'active');
  }
  
  console.log('UUID Resolver Popup: Initialization complete');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Quick actions
  document.getElementById('refreshBtn').addEventListener('click', handleRefresh);
  document.getElementById('clearCacheBtn').addEventListener('click', handleClearCache);
  
  // Settings
  document.getElementById('enabledToggle').addEventListener('change', handleEnabledToggle);
  document.getElementById('saveBtn').addEventListener('click', handleSaveSettings);
  
  // Authentication type change
  document.getElementById('authType').addEventListener('change', handleAuthTypeChange);
  
  // Connection test
  document.getElementById('testConnectionBtn').addEventListener('click', handleTestConnection);
  
  // Token visibility toggles
  document.getElementById('toggleTokenVisibility').addEventListener('click', () => {
    toggleFieldVisibility('authToken', 'toggleTokenVisibility');
  });
  document.getElementById('togglePasswordVisibility').addEventListener('click', () => {
    toggleFieldVisibility('password', 'togglePasswordVisibility');
  });
  document.getElementById('toggleClientSecretVisibility').addEventListener('click', () => {
    toggleFieldVisibility('clientSecret', 'toggleClientSecretVisibility');
  });
  
  // Footer links
  document.getElementById('helpLink').addEventListener('click', () => openHelpPage());
  document.getElementById('feedbackLink').addEventListener('click', () => openFeedbackPage());
  document.getElementById('aboutLink').addEventListener('click', () => openAboutPage());
  
  // Auto-save on input changes (immediate for form persistence)
  const inputs = document.querySelectorAll('input[type="text"], input[type="url"], input[type="password"], input[type="number"], select');
  console.log('UUID Resolver: Setting up auto-save for', inputs.length, 'input fields');
  
  inputs.forEach((input, index) => {
    if (input.id !== 'authToken') { // Don't auto-save readonly OAuth token
      console.log(`UUID Resolver: Adding listeners to input ${index}: ${input.id || input.name || 'unnamed'}`);
      input.addEventListener('input', handleInputChange);
      input.addEventListener('change', handleInputChange);
      input.addEventListener('blur', handleInputBlur);
    }
  });
  
  // Checkbox changes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  console.log('UUID Resolver: Setting up auto-save for', checkboxes.length, 'checkboxes');
  
  checkboxes.forEach((checkbox, index) => {
    console.log(`UUID Resolver: Adding listeners to checkbox ${index}: ${checkbox.id || checkbox.name || 'unnamed'}`);
    checkbox.addEventListener('change', handleInputChange);
  });
}

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    showLoadingIndicator(true, 'Loading saved settings...');
    
    // Add timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Settings loading timeout')), 5000);
    });
    
    const settingsPromise = chrome.runtime.sendMessage({ action: 'getSettings' });
    
    const response = await Promise.race([settingsPromise, timeoutPromise]);
    
    if (response && response.success) {
      currentSettings = response.data;
      populateSettings(currentSettings);
      hasUnsavedChanges = false;
      
      // Show restored data indicator if there are settings
      if (Object.keys(currentSettings).length > 1) { // More than just defaults
        showToast('Settings restored from previous session', 'success');
      }
    } else {
      // Fallback: try to load directly from storage
      console.warn('Background script not responding, trying direct storage access');
      await loadSettingsDirectly();
    }
  } catch (error) {
    console.error('Failed to load settings via background script:', error);
    
    // Fallback: load directly from storage
    try {
      await loadSettingsDirectly();
      showToast('Settings loaded (fallback mode)', 'warning');
    } catch (fallbackError) {
      console.error('Fallback settings loading also failed:', fallbackError);
      showToast('Using default settings', 'warning');
      // Use empty settings (defaults will be applied)
      currentSettings = {};
      populateSettings(currentSettings);
    }
  } finally {
    showLoadingIndicator(false);
  }
}

/**
 * Load settings directly from Chrome storage (fallback)
 */
async function loadSettingsDirectly() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        currentSettings = result;
        populateSettings(currentSettings);
        hasUnsavedChanges = false;
        resolve(result);
      }
    });
  });
}

/**
 * Populate UI with settings
 */
function populateSettings(settings) {
  console.log('UUID Resolver Popup: Populating settings:', settings);
  
  try {
    // Basic settings
    document.getElementById('enabledToggle').checked = settings.enabled ?? true;
    document.getElementById('serverUrl').value = settings.serverUrl || '';
    
    // Authentication type
    document.getElementById('authType').value = settings.authType || 'basic';
    handleAuthTypeChange(); // Show/hide appropriate fields
    
    // Basic auth fields
    document.getElementById('username').value = settings.username || '';
    document.getElementById('password').value = settings.password || '';
    document.getElementById('apiKey').value = settings.apiKey || '';
    
    // OAuth fields
    document.getElementById('clientId').value = settings.clientId || '';
    document.getElementById('clientSecret').value = settings.clientSecret || '';
    document.getElementById('tokenUrl').value = settings.tokenUrl || '';
    document.getElementById('authToken').value = settings.authToken || '';
    
    // Entity types
    document.getElementById('resolveTags').checked = settings.entityTypes?.tag ?? true;
    document.getElementById('resolveApplications').checked = settings.entityTypes?.application ?? true;
    document.getElementById('resolveProfiles').checked = settings.entityTypes?.profile ?? true;
    document.getElementById('resolveScripts').checked = settings.entityTypes?.script ?? true;
    document.getElementById('resolveProducts').checked = settings.entityTypes?.product ?? true;
    document.getElementById('resolveOrgGroups').checked = settings.entityTypes?.organizationGroup ?? true;
    
    // Advanced settings
    document.getElementById('cacheTimeout').value = (settings.cacheTimeout || 300000) / 60000; // Convert to minutes
    document.getElementById('showTooltips').checked = settings.showTooltips ?? true;
    document.getElementById('autoRefresh').checked = settings.autoRefresh ?? true;
    
    console.log('UUID Resolver Popup: Settings populated successfully');
  } catch (error) {
    console.error('UUID Resolver Popup: Error populating settings:', error);
    showToast('Error loading settings UI', 'error');
  }
}

/**
 * Load and display statistics
 */
async function loadStatistics() {
  try {
    // Get current page statistics
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStatistics' });
        if (response && response.success) {
          document.getElementById('currentPageUUIDs').textContent = response.data.total || 0;
        }
      } catch (error) {
        // Content script might not be loaded
        document.getElementById('currentPageUUIDs').textContent = '-';
      }
    }
    
    // Get global statistics from background
    const statsResponse = await chrome.runtime.sendMessage({ action: 'getStatistics' });
    if (statsResponse && statsResponse.success) {
      const stats = statsResponse.data;
      document.getElementById('totalResolved').textContent = stats.totalResolved || 0;
      document.getElementById('cacheSize').textContent = stats.cacheSize || 0;
    }
  } catch (error) {
    console.error('Failed to load statistics:', error);
  }
}

/**
 * Handle refresh button click
 */
async function handleRefresh() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await chrome.tabs.sendMessage(tab.id, { action: 'refreshResolution' });
      showToast('Page refreshed successfully', 'success');
      await loadStatistics();
    }
  } catch (error) {
    console.error('Failed to refresh:', error);
    showToast('Failed to refresh page', 'error');
  }
}

/**
 * Handle clear cache button click
 */
async function handleClearCache() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await chrome.tabs.sendMessage(tab.id, { action: 'clearCache' });
    }
    await chrome.runtime.sendMessage({ action: 'clearGlobalCache' });
    showToast('Cache cleared successfully', 'success');
    await loadStatistics();
  } catch (error) {
    console.error('Failed to clear cache:', error);
    showToast('Failed to clear cache', 'error');
  }
}

/**
 * Handle enabled toggle change
 */
async function handleEnabledToggle() {
  const enabled = document.getElementById('enabledToggle').checked;
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await chrome.tabs.sendMessage(tab.id, { 
        action: 'toggleExtension', 
        enabled: enabled 
      });
    }
    
    updateStatus(enabled ? 'Active' : 'Disabled', enabled ? 'active' : 'error');
    showToast(`Extension ${enabled ? 'enabled' : 'disabled'}`, 'success');
  } catch (error) {
    console.error('Failed to toggle extension:', error);
    showToast('Failed to toggle extension', 'error');
  }
}

/**
 * Handle save settings button click
 */
async function handleSaveSettings() {
  const saveBtn = document.getElementById('saveBtn');
  const originalText = saveBtn.innerHTML;
  
  try {
    saveBtn.innerHTML = '<span class="btn-icon">⏳</span> Saving...';
    saveBtn.disabled = true;
    
    const settings = collectSettings();
    let success = false;
    
    // Try background script first
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'saveSettings', 
        settings: settings 
      });
      success = response && response.success;
    } catch (bgError) {
      console.warn('Background script not responding, using direct storage');
      success = false;
    }
    
    // Fallback to direct storage if background script failed
    if (!success) {
      await saveSettingsDirectly(settings);
      success = true;
    }
    
    if (success) {
      currentSettings = settings;
      hasUnsavedChanges = false;
      showUnsavedIndicator(false);
      saveBtn.innerHTML = '<span class="btn-icon">✅</span> Saved!';
      saveBtn.classList.add('saved');
      showToast('Settings saved successfully', 'success');
      
      setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.classList.remove('saved');
        saveBtn.disabled = false;
      }, 2000);
    } else {
      throw new Error('Failed to save settings');
    }
  } catch (error) {
    console.error('Failed to save settings:', error);
    saveBtn.innerHTML = '<span class="btn-icon">❌</span> Failed';
    saveBtn.classList.add('error');
    showToast('Failed to save settings: ' + error.message, 'error');
    
    setTimeout(() => {
      saveBtn.innerHTML = originalText;
      saveBtn.classList.remove('error');
      saveBtn.disabled = false;
    }, 3000);
  }
}

/**
 * Collect settings from UI
 */
function collectSettings() {
  const authType = document.getElementById('authType').value;
  
  const settings = {
    enabled: document.getElementById('enabledToggle').checked,
    serverUrl: document.getElementById('serverUrl').value.trim(),
    authType: authType,
    entityTypes: {
      tag: document.getElementById('resolveTags').checked,
      application: document.getElementById('resolveApplications').checked,
      profile: document.getElementById('resolveProfiles').checked,
      script: document.getElementById('resolveScripts').checked,
      product: document.getElementById('resolveProducts').checked,
      organizationGroup: document.getElementById('resolveOrgGroups').checked
    },
    cacheTimeout: parseInt(document.getElementById('cacheTimeout').value) * 60000, // Convert to milliseconds
    showTooltips: document.getElementById('showTooltips').checked,
    autoRefresh: document.getElementById('autoRefresh').checked
  };

  // Add authentication-specific fields
  if (authType === 'basic') {
    settings.username = document.getElementById('username').value.trim();
    settings.password = document.getElementById('password').value.trim();
    settings.apiKey = document.getElementById('apiKey').value.trim();
  } else if (authType === 'oauth') {
    settings.clientId = document.getElementById('clientId').value.trim();
    settings.clientSecret = document.getElementById('clientSecret').value.trim();
    settings.tokenUrl = document.getElementById('tokenUrl').value.trim();
    settings.authToken = document.getElementById('authToken').value.trim();
  }

  return settings;
}

/**
 * Auto-save settings
 */
async function autoSave() {
  console.log('UUID Resolver: Auto-save starting...');
  try {
    const settings = collectSettings();
    
    // Try background script first
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'saveSettings', 
        settings: settings 
      });
      
      if (response && response.success) {
        currentSettings = settings;
        hasUnsavedChanges = false;
        showUnsavedIndicator(false);
        showSaveIndicator('saved');
        console.log('UUID Resolver: Auto-save successful via background script');
        return;
      }
    } catch (bgError) {
      console.warn('UUID Resolver: Background script not responding for save, using direct storage');
    }
    
    // Fallback: save directly to storage
    await saveSettingsDirectly(settings);
    currentSettings = settings;
    hasUnsavedChanges = false;
    showUnsavedIndicator(false);
    showSaveIndicator('saved');
    console.log('UUID Resolver: Auto-save successful via direct storage');
    
  } catch (error) {
    console.error('UUID Resolver: Auto-save failed:', error);
    showSaveIndicator('error');
  }
}

/**
 * Save settings directly to Chrome storage (fallback)
 */
async function saveSettingsDirectly(settings) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(settings, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Handle input changes with immediate visual feedback
 */
function handleInputChange() {
  console.log('UUID Resolver: Input changed, setting up auto-save');
  hasUnsavedChanges = true;
  showUnsavedIndicator(true);
  showSaveIndicator('saving');
  
  // Clear existing timer and set new one
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    console.log('UUID Resolver: Auto-save timer triggered');
    autoSave();
  }, 1500); // 1.5 second delay
}

/**
 * Handle input blur (when user leaves field)
 */
function handleInputBlur() {
  if (hasUnsavedChanges) {
    // Save immediately when user leaves a field
    clearTimeout(autoSaveTimer);
    autoSave();
  }
}

/**
 * Show/hide unsaved changes indicator
 */
function showUnsavedIndicator(show) {
  const indicator = document.getElementById('unsavedIndicator');
  indicator.style.display = show ? 'inline' : 'none';
}

/**
 * Set up auto-save when popup is about to close
 */
function setupAutoSaveOnClose() {
  // Save when popup loses focus or is about to close
  window.addEventListener('beforeunload', () => {
    if (hasUnsavedChanges) {
      const settings = collectSettings();
      chrome.runtime.sendMessage({ 
        action: 'saveSettings', 
        settings: settings 
      });
    }
  });
  
  // Save when window loses focus (user clicks outside popup)
  window.addEventListener('blur', () => {
    if (hasUnsavedChanges) {
      clearTimeout(autoSaveTimer);
      autoSave();
    }
  });
  
  // Save when visibility changes (tab switch, etc.)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && hasUnsavedChanges) {
      clearTimeout(autoSaveTimer);
      autoSave();
    }
  });
}

/**
 * Show save status indicator
 */
function showSaveIndicator(status) {
  const saveBtn = document.getElementById('saveBtn');
  const autoSaveIndicator = document.getElementById('autoSaveIndicator');
  const indicatorIcon = autoSaveIndicator.querySelector('.indicator-icon');
  const indicatorText = autoSaveIndicator.querySelector('.indicator-text');
  
  // Reset classes
  autoSaveIndicator.className = 'auto-save-indicator';
  
  switch (status) {
    case 'saving':
      autoSaveIndicator.style.display = 'flex';
      autoSaveIndicator.classList.add('saving');
      indicatorIcon.textContent = '⏳';
      indicatorText.textContent = 'Auto-saving...';
      break;
    case 'saved':
      autoSaveIndicator.classList.add('saved');
      indicatorIcon.textContent = '✅';
      indicatorText.textContent = 'Saved automatically';
      setTimeout(() => {
        autoSaveIndicator.style.display = 'none';
      }, 2000);
      break;
    case 'error':
      autoSaveIndicator.classList.add('error');
      indicatorIcon.textContent = '❌';
      indicatorText.textContent = 'Auto-save failed';
      setTimeout(() => {
        autoSaveIndicator.style.display = 'none';
      }, 3000);
      break;
  }
}

/**
 * Handle test connection button click
 */
async function handleTestConnection() {
  const testBtn = document.getElementById('testConnectionBtn');
  const originalText = testBtn.innerHTML;
  
  try {
    testBtn.innerHTML = '<span class="btn-icon">⏳</span> Testing...';
    testBtn.disabled = true;
    
    const settings = collectSettings();
    
    if (!settings.serverUrl) {
      throw new Error('Please enter the server URL');
    }

    // Validate authentication fields based on type
    if (settings.authType === 'basic') {
      if (!settings.username || !settings.password) {
        throw new Error('Please enter both username and password for Basic authentication');
      }
    } else if (settings.authType === 'oauth') {
      if (!settings.clientId || !settings.clientSecret || !settings.tokenUrl) {
        throw new Error('Please enter Client ID, Client Secret, and Token URL for OAuth authentication');
      }
    }
    
    const response = await chrome.runtime.sendMessage({ 
      action: 'testConnection', 
      settings: settings 
    });
    
    if (response.success) {
      const info = response.data.serverInfo;
      showToast(`Connection successful! Server: ${info.version || 'Unknown'} (${info.build || 'Unknown'})`, 'success');
      
      // If OAuth, update the token field with the new token
      if (settings.authType === 'oauth' && response.data.token) {
        document.getElementById('authToken').value = response.data.token;
        showToast('OAuth token refreshed', 'success');
      }
    } else {
      throw new Error(response.error || 'Connection test failed');
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    showToast(error.message, 'error');
  } finally {
    testBtn.innerHTML = originalText;
    testBtn.disabled = false;
  }
}

/**
 * Toggle token visibility
 */
function toggleTokenVisibility() {
  const tokenInput = document.getElementById('authToken');
  const toggleBtn = document.getElementById('toggleTokenVisibility');
  
  if (tokenInput.type === 'password') {
    tokenInput.type = 'text';
    toggleBtn.textContent = '🙈';
  } else {
    tokenInput.type = 'password';
    toggleBtn.textContent = '👁️';
  }
}

/**
 * Handle authentication type change
 */
function handleAuthTypeChange() {
  const authType = document.getElementById('authType').value;
  const basicFields = document.getElementById('basicAuthFields');
  const oauthFields = document.getElementById('oauthFields');
  
  if (authType === 'basic') {
    basicFields.style.display = 'block';
    oauthFields.style.display = 'none';
  } else if (authType === 'oauth') {
    basicFields.style.display = 'none';
    oauthFields.style.display = 'block';
  }
}

/**
 * Toggle field visibility (generic function)
 */
function toggleFieldVisibility(fieldId, buttonId) {
  const field = document.getElementById(fieldId);
  const button = document.getElementById(buttonId);
  
  if (field.type === 'password') {
    field.type = 'text';
    button.textContent = '🙈';
  } else {
    field.type = 'password';
    button.textContent = '👁️';
  }
}

/**
 * Update status indicator
 */
function updateStatus(text, type = 'ready') {
  const statusText = document.querySelector('.status-text');
  const statusDot = document.querySelector('.status-dot');
  
  statusText.textContent = text;
  statusDot.className = `status-dot ${type}`;
}

/**
 * Show loading overlay
 */
function showLoading(show) {
  const overlay = document.getElementById('loadingOverlay');
  overlay.style.display = show ? 'flex' : 'none';
}

/**
 * Show loading indicator with custom message
 */
function showLoadingIndicator(show, message = 'Loading...') {
  const overlay = document.getElementById('loadingOverlay');
  const loadingText = overlay.querySelector('.loading-text');
  
  if (loadingText) {
    loadingText.textContent = message;
  }
  
  overlay.style.display = show ? 'flex' : 'none';
  
  // Auto-hide after 10 seconds as a safety measure
  if (show) {
    setTimeout(() => {
      if (overlay.style.display === 'flex') {
        console.warn('UUID Resolver: Loading indicator auto-hidden after timeout');
        overlay.style.display = 'none';
        showToast('Loading took too long, using defaults', 'warning');
      }
    }, 10000);
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Open help page
 */
function openHelpPage() {
  chrome.tabs.create({
    url: 'https://github.com/your-repo/uuid-resolver/wiki'
  });
}

/**
 * Open feedback page
 */
function openFeedbackPage() {
  chrome.tabs.create({
    url: 'https://github.com/your-repo/uuid-resolver/issues'
  });
}

/**
 * Open about page
 */
function openAboutPage() {
  chrome.tabs.create({
    url: chrome.runtime.getURL('about/about.html')
  });
}
