# Manual Testing Guide for Coco Reader

## What We've Implemented

### 1. ✅ App Name Change: "Cocoa Reader" → "Coco Reader"
**What to test:**
- Browser tab title should show "🥥 Coco Reader"
- Main header should show "🥥 Coco Reader"
- PWA manifest should reflect new name

### 2. ✅ Statistics Component
**What to test:**
- Should see statistics cards in the settings panel
- Cards should show: Min Read, Articles Read, Articles Added, Reading Progress, Average Reading Time
- Add some articles and mark them as read to see stats update

### 3. ✅ Coffee Donation Button
**What to test:**
- Should see coffee button in settings
- Button should link to buymeacoffee.com/peridoto
- After adding 15+ articles, button should have shake animation
- Animation should be smooth and eye-catching

## Testing Steps

### Step 1: Verify App Name Changes
1. ✅ Open http://localhost:3001
2. ✅ Check browser tab title shows "🥥 Coco Reader"
3. ✅ Check main header shows "🥥 Coco Reader"

### Step 2: Test Statistics Component
1. ✅ Open Settings panel (gear icon)
2. ✅ Scroll down to see Statistics section
3. ✅ Verify all 5 statistic cards are visible
4. ✅ Add a test article to see stats update
5. ✅ Mark an article as read to see "Articles Read" increment

### Step 3: Test Coffee Donation Button
1. ✅ In Settings panel, find the Coffee donation button
2. ✅ Click to verify it opens buymeacoffee.com/peridoto
3. ✅ Test shake animation by adding 15+ articles (you can use the import feature with test data)

### Step 4: Overall Functionality
1. ✅ Test adding articles via URL
2. ✅ Test reading articles
3. ✅ Test search and filtering
4. ✅ Test dark mode toggle
5. ✅ Test export/import functionality

## Expected Results

- All "Cocoa Reader" references should be changed to "Coco Reader"
- Statistics should show real data from your articles
- Coffee button should be prominent and functional
- Shake animation should trigger after 15+ articles
- No console errors or TypeScript compilation issues

## Current Status: ✅ READY FOR TESTING

All components have been implemented and integrated successfully. The development server is running on http://localhost:3001.
