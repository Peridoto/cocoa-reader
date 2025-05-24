// AI Processing Debug Component
// This can be copy-pasted into the browser console when the app is running

(function() {
  console.log('🔍 AI Processing Debug Tool Loaded');
  
  // Function to find and test AI buttons
  function findAIButtons() {
    console.log('\n=== Finding AI Buttons ===');
    
    // Find buttons by text content
    const allButtons = document.querySelectorAll('button');
    const aiButtons = Array.from(allButtons).filter(btn => {
      const text = btn.textContent || '';
      return text.includes('Generate AI Summary') || 
             text.includes('Process Unprocessed') ||
             text.includes('AI Summary');
    });
    
    console.log(`Found ${aiButtons.length} AI-related buttons`);
    
    aiButtons.forEach((btn, idx) => {
      console.log(`Button ${idx + 1}:`);
      console.log('  Text:', btn.textContent);
      console.log('  Disabled:', btn.disabled);
      console.log('  Classes:', btn.className);
      console.log('  Data attributes:', Object.keys(btn.dataset));
      console.log('  Has click listener:', btn.onclick !== null);
      console.log('  Element:', btn);
      console.log('');
    });
    
    return aiButtons;
  }
  
  // Function to test API endpoints
  async function testAPIEndpoints() {
    console.log('\n=== Testing API Endpoints ===');
    
    try {
      // Test health endpoint
      console.log('Testing /api/test-ai...');
      const healthResp = await fetch('/api/test-ai');
      console.log('Health response:', healthResp.status, await healthResp.json());
      
      // Test articles endpoint
      console.log('Testing /api/articles...');
      const articlesResp = await fetch('/api/articles');
      const articlesData = await articlesResp.json();
      console.log('Articles response:', articlesResp.status, 'Count:', articlesData.articles?.length);
      
      // Find an unprocessed article to test with
      const unprocessed = articlesData.articles?.filter(a => !a.aiProcessed) || [];
      console.log('Unprocessed articles:', unprocessed.length);
      
      if (unprocessed.length > 0) {
        const testId = unprocessed[0].id;
        console.log('Testing processing with article ID:', testId);
        
        // Test single processing
        const processResp = await fetch('/api/articles/process-v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId: testId })
        });
        
        console.log('Process response:', processResp.status, await processResp.json());
      }
      
    } catch (error) {
      console.error('API test error:', error);
    }
  }
  
  // Function to add click listeners for debugging
  function addDebugListeners() {
    console.log('\n=== Adding Debug Listeners ===');
    
    const aiButtons = findAIButtons();
    
    aiButtons.forEach((btn, idx) => {
      const originalHandler = btn.onclick;
      
      btn.addEventListener('click', function(e) {
        console.log(`🖱️ AI Button ${idx + 1} clicked!`);
        console.log('Event:', e);
        console.log('Button:', this);
        console.log('Article ID:', this.dataset.articleId);
        
        // Let the original handler run
        if (originalHandler) {
          console.log('Calling original handler...');
          originalHandler.call(this, e);
        }
      }, true); // Use capture to catch early
    });
    
    console.log(`Added debug listeners to ${aiButtons.length} buttons`);
  }
  
  // Function to simulate click on first AI button
  function simulateClick() {
    console.log('\n=== Simulating Click ===');
    
    const aiButtons = findAIButtons();
    if (aiButtons.length > 0) {
      const firstButton = aiButtons[0];
      console.log('Simulating click on first AI button...');
      firstButton.click();
    } else {
      console.log('No AI buttons found to click');
    }
  }
  
  // Main debug function
  function debugAI() {
    console.log('🚀 Starting AI Debug Session');
    findAIButtons();
    addDebugListeners();
    return {
      findButtons: findAIButtons,
      testAPI: testAPIEndpoints,
      simulateClick: simulateClick,
      addListeners: addDebugListeners
    };
  }
  
  // Expose to global scope
  window.debugAI = debugAI;
  window.aiDebugTools = {
    findButtons: findAIButtons,
    testAPI: testAPIEndpoints,
    simulateClick: simulateClick,
    addListeners: addDebugListeners
  };
  
  console.log('💡 Use debugAI() to start debugging, or aiDebugTools.* for individual functions');
  
})();
