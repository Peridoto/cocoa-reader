// Simple UI Test Script - Copy and paste this into the browser console
// to test if AI processing buttons are working

(function testAIButtons() {
  console.log('🧪 Testing AI Processing UI Buttons');
  
  // Wait for the page to fully load
  if (document.readyState !== 'complete') {
    window.addEventListener('load', testAIButtons);
    return;
  }
  
  // Find AI processing buttons
  const findAIButtons = () => {
    const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent?.includes('Generate AI Summary') ||
      btn.textContent?.includes('Processing...') ||
      btn.textContent?.includes('AI Processed')
    );
    return buttons;
  };
  
  // Find batch processing buttons
  const findBatchButtons = () => {
    const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent?.includes('Process Unprocessed Articles')
    );
    return buttons;
  };
  
  // Test individual AI button
  const testIndividualButton = () => {
    const aiButtons = findAIButtons();
    console.log(`Found ${aiButtons.length} AI processing buttons`);
    
    aiButtons.forEach((btn, idx) => {
      console.log(`Button ${idx + 1}: "${btn.textContent}" - Disabled: ${btn.disabled}`);
      
      if (!btn.disabled && btn.textContent?.includes('Generate AI Summary')) {
        console.log(`Clicking button ${idx + 1}...`);
        btn.click();
        
        // Check if button state changes after click
        setTimeout(() => {
          console.log(`After click - Button text: "${btn.textContent}" - Disabled: ${btn.disabled}`);
        }, 100);
      }
    });
  };
  
  // Test batch processing button
  const testBatchButton = () => {
    const batchButtons = findBatchButtons();
    console.log(`Found ${batchButtons.length} batch processing buttons`);
    
    if (batchButtons.length > 0) {
      const batchBtn = batchButtons[0];
      console.log(`Batch button: "${batchBtn.textContent}" - Disabled: ${batchBtn.disabled}`);
      
      if (!batchBtn.disabled) {
        console.log('Clicking batch processing button...');
        batchBtn.click();
        
        setTimeout(() => {
          console.log(`After click - Batch button text: "${batchBtn.textContent}" - Disabled: ${batchBtn.disabled}`);
        }, 100);
      }
    }
  };
  
  // Test API endpoints directly
  const testAPIDirectly = async () => {
    console.log('\n🔗 Testing API endpoints directly...');
    
    try {
      // Test articles endpoint
      const articlesResponse = await fetch('/api/articles');
      const articlesData = await articlesResponse.json();
      console.log(`Articles API: ${articlesResponse.status} - Found ${articlesData.articles?.length || 0} articles`);
      
      if (articlesData.articles && articlesData.articles.length > 0) {
        const firstArticle = articlesData.articles[0];
        console.log(`First article: "${firstArticle.title}" - AI Processed: ${firstArticle.aiProcessed}`);
        
        // Test processing if not processed
        if (!firstArticle.aiProcessed) {
          console.log('Testing AI processing API...');
          const processResponse = await fetch('/api/articles/process-v2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId: firstArticle.id })
          });
          
          const processData = await processResponse.json();
          console.log(`Processing API: ${processResponse.status} - Success: ${processData.success}`);
        }
      }
      
    } catch (error) {
      console.error('API test failed:', error);
    }
  };
  
  // Run all tests
  console.log('\n1️⃣ Testing individual AI buttons...');
  testIndividualButton();
  
  console.log('\n2️⃣ Testing batch processing button...');
  testBatchButton();
  
  console.log('\n3️⃣ Testing API endpoints...');
  testAPIDirectly();
  
  // Add refresh function to rerun tests
  window.refreshAITest = () => {
    console.clear();
    testAIButtons();
  };
  
  console.log('\n✅ Test complete! Run window.refreshAITest() to test again.');
})();
