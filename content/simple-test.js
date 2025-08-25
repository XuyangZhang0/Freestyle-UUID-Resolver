// Minimal content script for debugging
(function() {
    'use strict';
    
    console.log('� UUID Resolver: Content script starting...');
    console.log('🌐 URL:', window.location.href);
    console.log('� Title:', document.title);
    
    // Create test functions immediately
    window.simpleTest = function() {
        console.log('✅ simpleTest called!');
        return 'Extension is working!';
    };
    
    window.uuidResolverDebug = {
        version: '1.0.0',
        loaded: new Date().toISOString(),
        url: window.location.href,
        testFunction: function() {
            console.log('✅ Debug function called!');
            return 'Debug object working!';
        }
    };
    
    // Send message to background script to confirm loading
    try {
        chrome.runtime.sendMessage({
            action: 'contentScriptLoaded',
            url: window.location.href,
            timestamp: new Date().toISOString()
        }, function(response) {
            if (chrome.runtime.lastError) {
                console.log('📡 Background script not responding:', chrome.runtime.lastError.message);
            } else {
                console.log('📡 Background script responded:', response);
            }
        });
    } catch (error) {
        console.log('📡 Error contacting background script:', error);
    }
    
    console.log('✅ UUID Resolver: Content script loaded successfully');
    
})();
