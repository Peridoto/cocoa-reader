// Debug script to test AI processing buttons
// Run this script in the browser console

console.log('=== AI Button Debug Test ===');

// Test if the API endpoint is reachable
async function testAPIEndpoint() {
  console.log('1. Testing API endpoint directly...');
  try {
    const response = await fetch('/api/articles/process-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ articleId: 'test-id' }),
    });
    
    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);
  } catch (error) {
    console.error('API Test failed:', error);
  }
}

// Test if buttons exist in DOM
function testButtonsInDOM() {
  console.log('\n2. Testing buttons in DOM...');
  
  const aiButtons = document.querySelectorAll('[data-testid="ai-process-button"], button:contains("Generate AI Summary")');
  console.log('AI Process buttons found:', aiButtons.length);
  
  const batchButtons = document.querySelectorAll('button:contains("Process Unprocessed Articles")');
  console.log('Batch Process buttons found:', batchButtons.length);
  
  // Look for buttons by text content
  const allButtons = document.querySelectorAll('button');
  const aiButtonsByText = Array.from(allButtons).filter(btn => 
    btn.textContent?.includes('Generate AI Summary') || 
    btn.textContent?.includes('Process Unprocessed')
  );
  console.log('Buttons with AI text found:', aiButtonsByText.length);
  
  aiButtonsByText.forEach((btn, idx) => {
    console.log(`Button ${idx}:`, btn.textContent, btn.disabled);
  });
}

// Test button click handlers
function testButtonClickHandlers() {
  console.log('\n3. Testing button click handlers...');
  
  const allButtons = document.querySelectorAll('button');
  const aiButtons = Array.from(allButtons).filter(btn => 
    btn.textContent?.includes('Generate AI Summary')
  );
  
  if (aiButtons.length > 0) {
    console.log('Found AI buttons, testing click on first one...');
    const firstButton = aiButtons[0];
    
    // Add event listener to catch any errors
    firstButton.addEventListener('click', (e) => {
      console.log('Button clicked!', e);
    });
    
    // Simulate click
    firstButton.click();
  } else {
    console.log('No AI buttons found to test');
  }
}

// Check for console errors
function checkConsoleErrors() {
  console.log('\n4. Check for React/JS errors...');
  console.log('Look for any error messages in the console above');
}

// Run all tests
async function runAllTests() {
  await testAPIEndpoint();
  testButtonsInDOM();
  testButtonClickHandlers();
  checkConsoleErrors();
  console.log('\n=== Debug test complete ===');
}

// Export function to run manually
window.debugAIButtons = runAllTests;

console.log('Run window.debugAIButtons() to test AI processing buttons');
