// Test the ArticleAISummary component with various JSON scenarios
const testData = [
  {
    id: 'test1',
    keyPoints: '["Point 1", "Point 2", "Point 3"]', // Valid JSON array
    categories: '["Tech", "AI"]', // Valid JSON array
    tags: '["javascript", "react"]', // Valid JSON array
  },
  {
    id: 'test2', 
    keyPoints: 'Offline functionality, PWA features', // Plain string
    categories: 'Technology', // Plain string
    tags: 'web, pwa, offline', // Comma-separated
  },
  {
    id: 'test3',
    keyPoints: null, // Null value
    categories: '', // Empty string
    tags: undefined, // Undefined
  },
  {
    id: 'test4',
    keyPoints: '[Invalid JSON', // Invalid JSON
    categories: '{"type": "object"}', // Object instead of array
    tags: '[]', // Empty array
  }
];

// Safe JSON parse function (same as in component)
const safeJSONParse = (jsonString, fieldName = 'unknown') => {
  if (!jsonString) return []
  
  try {
    if (Array.isArray(jsonString)) return jsonString
    
    if (typeof jsonString !== 'string') {
      console.warn(`Field ${fieldName} is not a string:`, typeof jsonString, jsonString)
      return []
    }
    
    const trimmed = jsonString.trim()
    if (!trimmed) return []
    
    if (trimmed.startsWith('[')) {
      return JSON.parse(trimmed)
    }
    
    if (trimmed.startsWith('{')) {
      console.warn(`Field ${fieldName} contains object, expected array:`, trimmed.substring(0, 50))
      return []
    }
    
    return [trimmed]
    
  } catch (e) {
    console.warn(`Failed to parse JSON field ${fieldName}:`, jsonString?.substring(0, 50), e)
    return typeof jsonString === 'string' && jsonString.trim() ? [jsonString.trim()] : []
  }
}

console.log('🧪 Testing JSON parsing scenarios...');
console.log('');

testData.forEach((data, index) => {
  console.log(`Test ${index + 1} - ID: ${data.id}`);
  console.log(`  keyPoints: ${JSON.stringify(data.keyPoints)} → ${JSON.stringify(safeJSONParse(data.keyPoints, 'keyPoints'))}`);
  console.log(`  categories: ${JSON.stringify(data.categories)} → ${JSON.stringify(safeJSONParse(data.categories, 'categories'))}`);
  console.log(`  tags: ${JSON.stringify(data.tags)} → ${JSON.stringify(safeJSONParse(data.tags, 'tags'))}`);
  console.log('');
});

console.log('✅ JSON parsing test complete!');
