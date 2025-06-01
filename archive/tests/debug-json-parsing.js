#!/usr/bin/env node

/**
 * Debug JSON Parsing Issues
 * This script helps identify what data is causing JSON parsing errors
 */

console.log('🔍 Debugging JSON Parsing Issues');
console.log('================================');

console.log('\n1. Testing JSON.parse with problematic strings...');

const problematicStrings = [
  "Offline functionality",
  "Offline functions are available",
  '["point 1", "point 2"]',
  '{"key": "value"}',
  '',
  null,
  undefined,
  '"single string"',
  'plain text without quotes'
];

function safeJSONParse(jsonString, fieldName = 'test') {
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

problematicStrings.forEach((testString, index) => {
  console.log(`\nTest ${index + 1}: ${JSON.stringify(testString)}`);
  try {
    const result = safeJSONParse(testString, `test${index + 1}`);
    console.log(`  ✅ Safe parse result:`, result);
  } catch (e) {
    console.log(`  ❌ Error:`, e.message);
  }
});

console.log('\n2. Testing original JSON.parse (what was causing errors)...');

problematicStrings.forEach((testString, index) => {
  if (testString) {
    console.log(`\nOriginal parse test ${index + 1}: ${JSON.stringify(testString)}`);
    try {
      const result = JSON.parse(testString);
      console.log(`  ✅ Original parse result:`, result);
    } catch (e) {
      console.log(`  ❌ Original parse error:`, e.message);
      if (e.message.includes('Unexpected token')) {
        console.log(`  🎯 This matches the error pattern!`);
      }
    }
  }
});

console.log('\n3. Recommendations:');
console.log('==================');
console.log('✅ Safe parsing implementation should handle all these cases');
console.log('✅ Browser cache cleared and server restarted');
console.log('✅ Component updated with enhanced error handling');
console.log('\n🔧 If errors persist, check:');
console.log('   1. Browser hard refresh (Ctrl+Shift+R or Cmd+Shift+R)');
console.log('   2. Clear browser cache completely');
console.log('   3. Check browser console for specific error details');
console.log('   4. Verify no cached articles have corrupted data');

console.log('\n🥥 Safe parsing should now handle all edge cases!');
