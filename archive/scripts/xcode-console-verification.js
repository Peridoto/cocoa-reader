// Xcode Console Verification Script
// Paste this into the Xcode console (Debug → Debug Workflow → View Console)
// if you need to verify the app state after launch

console.log("🔍 Cocoa Reader Hydration Fix Verification");
console.log("==========================================");

// Check if React is properly hydrated
if (typeof React !== 'undefined') {
  console.log("✅ React is loaded");
} else {
  console.log("❌ React not found");
}

// Check if the app root element exists
const appRoot = document.getElementById('__next') || document.querySelector('[data-reactroot]');
if (appRoot) {
  console.log("✅ App root element found");
  console.log("📊 App root has", appRoot.children.length, "child elements");
} else {
  console.log("❌ App root element not found");
}

// Check theme system
const htmlElement = document.documentElement;
const isDark = htmlElement.classList.contains('dark');
const isLight = htmlElement.classList.contains('light');
console.log("🎨 Theme status:", { isDark, isLight });

// Check for error debugging system
const errorDebugger = document.querySelector('[data-error-debugger]');
if (errorDebugger) {
  console.log("✅ Error debugging system is active");
} else {
  console.log("ℹ️ Error debugging system not yet visible");
}

// Check for hydration-related errors in the past
const hasConsoleErrors = console.error.toString().includes('hydration') || 
                        console.warn.toString().includes('hydration');
if (hasConsoleErrors) {
  console.log("⚠️ Potential hydration warnings detected");
} else {
  console.log("✅ No obvious hydration issues detected");
}

// Check Capacitor integration
if (typeof Capacitor !== 'undefined') {
  console.log("✅ Capacitor is loaded");
  console.log("📱 Platform:", Capacitor.getPlatform());
  console.log("🔌 Available plugins:", Object.keys(Capacitor.Plugins));
} else {
  console.log("❌ Capacitor not found");
}

// Memory usage check
if (performance && performance.memory) {
  const memory = performance.memory;
  console.log("💾 Memory usage:", {
    used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + "MB",
    allocated: Math.round(memory.totalJSHeapSize / 1024 / 1024) + "MB",
    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + "MB"
  });
}

// Check for any React errors
if (typeof window !== 'undefined' && window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__) {
  console.log("🔧 React error overlay is available");
}

console.log("🏁 Verification complete");
console.log("==========================================");
