// Simple test script for UUID resolver
console.log('UUID Resolver Test: Script loaded');

// Test UUID detection
const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

function testUUIDDetection() {
  console.log('=== UUID Detection Test ===');
  
  // Check if the test UUID is anywhere on the page
  const pageText = document.body.textContent;
  const testUUID = '6e98e555-090b-41a8-8562-d205f83414bc';
  
  console.log('Page contains test UUID:', pageText.includes(testUUID));
  
  // Find all UUIDs on the page
  const allUUIDs = pageText.match(uuidRegex);
  console.log('All UUIDs found on page:', allUUIDs);
  
  // Check all input values
  const inputs = document.querySelectorAll('input, textarea');
  console.log('Total inputs found:', inputs.length);
  
  let inputsWithUUIDs = [];
  inputs.forEach((input, i) => {
    const value = input.value || input.getAttribute('value') || '';
    if (value && uuidRegex.test(value)) {
      inputsWithUUIDs.push({
        index: i,
        value: value,
        element: input,
        readOnly: input.hasAttribute('readonly'),
        classes: input.className
      });
    }
  });
  
  console.log('Inputs with UUIDs:', inputsWithUUIDs);
  
  // Check specifically for your test UUID
  const inputsWithTestUUID = Array.from(inputs).filter(input => {
    const value = input.value || input.getAttribute('value') || '';
    return value.includes(testUUID);
  });
  
  console.log('Inputs with test UUID:', inputsWithTestUUID);
  
  return {
    pageHasUUID: pageText.includes(testUUID),
    allUUIDs: allUUIDs,
    totalInputs: inputs.length,
    inputsWithUUIDs: inputsWithUUIDs,
    inputsWithTestUUID: inputsWithTestUUID
  };
}

// Make it globally available
window.testUUIDDetection = testUUIDDetection;

// Auto-run the test
setTimeout(() => {
  console.log('Running automatic UUID detection test...');
  testUUIDDetection();
}, 1000);
