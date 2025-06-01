# Manual UI Testing Checklist for AI Processing

## Pre-Test Setup ✅
- [x] Development server running on http://localhost:3000
- [x] Database contains articles with AI processing data 
- [x] API endpoints verified working (articles API returns aiProcessed field)

## UI Test Steps

### 1. Basic Article Loading
- [ ] Open http://localhost:3000 in browser
- [ ] Verify articles are displayed in the main list
- [ ] Check that article cards show properly

### 2. AI Processing Button Visibility
- [ ] Look for "Generate AI Summary" or similar buttons on article cards
- [ ] Verify buttons are enabled for unprocessed articles
- [ ] Check that processed articles show different button state or summary

### 3. Individual AI Processing Test
- [ ] Find an unprocessed article (aiProcessed: false)
- [ ] Click the "Generate AI Summary" button
- [ ] Button should show loading state
- [ ] After processing, article should show AI summary
- [ ] Button should change state to indicate processing complete

### 4. Batch Processing Test
- [ ] Look for settings icon or menu
- [ ] Open settings panel
- [ ] Find "Process All Articles" or batch processing option
- [ ] Click batch processing button
- [ ] Verify progress indicator appears
- [ ] Check that multiple articles get processed

### 5. AI Summary Display Test
- [ ] Find an article that has been processed (aiProcessed: true)
- [ ] Verify AI summary is displayed
- [ ] Check for key points, categories, tags
- [ ] Verify reading time estimate is shown

### 6. Error Handling Test
- [ ] Try processing an invalid URL (if available)
- [ ] Verify appropriate error messages are shown
- [ ] Check that failed processing doesn't break the UI

## Browser Console Testing

Run the following in browser console:
```javascript
// Load and run the UI test script
fetch('/ui-functionality-test.js').then(r => r.text()).then(eval);
```

## Expected Results

### Working AI Processing Should Show:
1. ✅ AI processing buttons visible on article cards
2. ✅ Buttons respond to clicks (change state, show loading)
3. ✅ Network requests to `/api/articles/process-v2` when buttons clicked
4. ✅ Articles update with AI summaries after processing
5. ✅ Batch processing interface available in settings
6. ✅ Processed articles display AI-generated content

### If Buttons Still Don't Work:
- Check browser console for JavaScript errors
- Verify React components are receiving correct props
- Check network tab for failed API requests
- Ensure articles data includes `aiProcessed` field

## Debug Commands

If issues persist, run these in browser console:

```javascript
// Check if articles have aiProcessed field
console.log('Articles data:', window.articlesData);

// Find AI processing buttons
console.log('AI buttons:', document.querySelectorAll('button[aria-label*="AI"]'));

// Check React components state
console.log('React fiber:', document.querySelector('[data-reactroot]')._reactInternalFiber);
```

## API Verification Commands

Run these in terminal to verify backend:

```bash
# Check articles API
curl http://localhost:3000/api/articles | jq '.articles[] | {id, title, aiProcessed}'

# Test AI processing endpoint
curl -X POST http://localhost:3000/api/articles/process-v2 \
  -H "Content-Type: application/json" \
  -d '{"articleId": "ARTICLE_ID_HERE"}'
```
