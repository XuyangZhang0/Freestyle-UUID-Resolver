// Absolutely minimal test - should show an alert if loading
console.log('🔥 CONTENT SCRIPT LOADING - CHECK CONSOLE!');
alert('UUID Resolver: Content script loaded! Check console for more info.');

// Log everything we can
console.log('URL:', window.location.href);
console.log('Domain:', window.location.hostname);
console.log('Protocol:', window.location.protocol);
console.log('Pathname:', window.location.pathname);
console.log('Document readyState:', document.readyState);
console.log('Document title:', document.title);

// Create the test function
window.simpleTest = function() {
    console.log('✅ simpleTest function works!');
    alert('simpleTest function works!');
    return 'SUCCESS: Extension content script is working!';
};

console.log('🎯 simpleTest function created');
