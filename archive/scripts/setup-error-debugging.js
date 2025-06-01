#!/usr/bin/env node

/**
 * Error Simulation & Debug Script
 * Simulates various error conditions to test the comprehensive error debugger
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Error Simulation & Debug Script');
console.log('==================================');

// Create client-side error simulation script
function createErrorSimulationScript() {
  console.log('\n📝 Creating client-side error simulation script...');
  
  const simulationScript = `
// Error Simulation Test Script
// This script simulates various types of errors that might occur in the iOS app

console.log('🧪 Starting Error Simulation Tests...');

// Global error debugger reference
let errorDebugger;

// Wait for error debugger to be available
const waitForErrorDebugger = () => {
  return new Promise((resolve) => {
    const checkDebugger = () => {
      if (window.__errorDebugger) {
        errorDebugger = window.__errorDebugger;
        console.log('✅ Error debugger found and connected');
        resolve(true);
      } else {
        console.log('⏳ Waiting for error debugger...');
        setTimeout(checkDebugger, 1000);
      }
    };
    checkDebugger();
  });
};

// Test 1: Simulate sandbox extension error
const testSandboxError = () => {
  console.log('🧪 Test 1: Simulating sandbox extension error...');
  
  const sandboxError = new Error('Could not create a sandbox extension for file at /var/mobile/Containers/Data/Application/test.html');
  sandboxError.name = 'SandboxError';
  
  setTimeout(() => {
    window.dispatchEvent(new ErrorEvent('error', {
      message: sandboxError.message,
      filename: 'capacitor://localhost/main.js',
      lineno: 42,
      colno: 10,
      error: sandboxError
    }));
  }, 1000);
};

// Test 2: Simulate SplashScreen undefined error
const testSplashScreenError = () => {
  console.log('🧪 Test 2: Simulating SplashScreen undefined error...');
  
  setTimeout(() => {
    window.dispatchEvent(new ErrorEvent('error', {
      message: 'SplashScreen plugin TO JS undefined',
      filename: 'capacitor://localhost/capacitor.js',
      lineno: 125,
      colno: 5,
      error: new ReferenceError('SplashScreen plugin TO JS undefined')
    }));
  }, 2000);
};

// Test 3: Simulate Capacitor plugin error
const testCapacitorPluginError = () => {
  console.log('🧪 Test 3: Simulating Capacitor plugin error...');
  
  setTimeout(() => {
    if (window.Capacitor && window.Capacitor.Plugins) {
      // Try to call a non-existent method
      try {
        window.Capacitor.Plugins.NonExistentPlugin.nonExistentMethod();
      } catch (error) {
        console.error('Simulated plugin error:', error);
      }
    } else {
      // Simulate plugin not available
      console.error('Capacitor plugins not available - simulated error');
    }
  }, 3000);
};

// Test 4: Simulate network error
const testNetworkError = () => {
  console.log('🧪 Test 4: Simulating network error...');
  
  setTimeout(async () => {
    try {
      await fetch('https://nonexistent-domain-12345.com/api/test');
    } catch (error) {
      console.log('Expected network error simulated:', error.message);
    }
  }, 4000);
};

// Test 5: Simulate promise rejection
const testPromiseRejection = () => {
  console.log('🧪 Test 5: Simulating unhandled promise rejection...');
  
  setTimeout(() => {
    Promise.reject(new Error('Simulated unhandled promise rejection'));
  }, 5000);
};

// Test 6: Simulate console errors
const testConsoleErrors = () => {
  console.log('🧪 Test 6: Simulating console errors...');
  
  setTimeout(() => {
    console.error('Simulated console error with Capacitor context');
    console.warn('Simulated warning about plugin undefined');
    console.error('TypeError: Cannot read property of undefined in sandbox');
  }, 6000);
};

// Test 7: Simulate custom error conditions
const testCustomErrors = () => {
  console.log('🧪 Test 7: Simulating custom error conditions...');
  
  setTimeout(() => {
    if (errorDebugger && errorDebugger.reportError) {
      errorDebugger.reportError('Custom test error: Filesystem access denied', {
        operation: 'fileRead',
        path: '/var/mobile/test.txt',
        permissions: 'denied'
      });
      
      errorDebugger.reportError('Custom test error: Plugin initialization failed', {
        plugin: 'TestPlugin',
        method: 'initialize',
        timeout: 5000
      });
    }
  }, 7000);
};

// Test 8: Simulate memory issues
const testMemoryIssues = () => {
  console.log('🧪 Test 8: Simulating memory issues...');
  
  setTimeout(() => {
    // Create a large array to simulate memory pressure
    try {
      const largeArray = new Array(1000000).fill('memory-test-data-'.repeat(100));
      console.log('Created large array for memory test');
      
      // Clean up after a short time
      setTimeout(() => {
        largeArray.length = 0;
        console.log('Memory test cleanup completed');
      }, 2000);
    } catch (error) {
      console.error('Memory test error:', error);
    }
  }, 8000);
};

// Test 9: Simulate iOS-specific errors
const testIOSSpecificErrors = () => {
  console.log('🧪 Test 9: Simulating iOS-specific errors...');
  
  setTimeout(() => {
    // Simulate WKWebView errors
    console.error('[WKWebView] Could not process request');
    console.error('[iOS] App Transport Security blocked cleartext HTTP');
    console.error('[Capacitor] Bridge communication failed');
  }, 9000);
};

// Test 10: Simulate runtime JavaScript errors
const testRuntimeErrors = () => {
  console.log('🧪 Test 10: Simulating runtime JavaScript errors...');
  
  setTimeout(() => {
    try {
      // Attempt to call undefined function
      undefinedFunction();
    } catch (error) {
      console.error('Runtime error simulated:', error);
    }
    
    try {
      // Attempt to access property of null
      const nullObject = null;
      console.log(nullObject.someProperty);
    } catch (error) {
      console.error('Null access error simulated:', error);
    }
  }, 10000);
};

// Main test execution
const runAllTests = async () => {
  console.log('🚀 Starting comprehensive error simulation...');
  
  // Wait for error debugger to be ready
  await waitForErrorDebugger();
  
  // Run all tests
  testSandboxError();
  testSplashScreenError();
  testCapacitorPluginError();
  testNetworkError();
  testPromiseRejection();
  testConsoleErrors();
  testCustomErrors();
  testMemoryIssues();
  testIOSSpecificErrors();
  testRuntimeErrors();
  
  // Summary after all tests
  setTimeout(() => {
    console.log('🏁 Error simulation tests completed');
    console.log('📊 Check the error debugger display for captured errors');
    
    if (errorDebugger && errorDebugger.getErrors) {
      const errors = errorDebugger.getErrors();
      console.log(\`📈 Total errors captured: \${errors.length}\`);
      
      if (errors.length > 0) {
        console.log('🔍 Error summary:');
        errors.forEach((error, index) => {
          console.log(\`  \${index + 1}. [\${error.severity.toUpperCase()}] \${error.type}: \${error.message.substring(0, 60)}...\`);
        });
      }
    }
  }, 12000);
};

// Auto-start tests when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runAllTests);
} else {
  runAllTests();
}

console.log('✅ Error simulation script loaded and ready');
`;

  fs.writeFileSync('public/error-simulation.js', simulationScript);
  console.log('✅ Error simulation script created at public/error-simulation.js');
  
  return true;
}

// Create debug page for testing
function createDebugPage() {
  console.log('\n📄 Creating debug test page...');
  
  const debugPageContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error Debugging Test Page</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .test-button {
            background: #007AFF;
            color: white;
            border: none;
            padding: 12px 20px;
            margin: 10px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
        }
        .test-button:hover {
            background: #0056CC;
        }
        .error-display {
            background: #FFE6E6;
            border: 1px solid #FF6B6B;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            max-height: 300px;
            overflow-y: auto;
        }
        .status {
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            font-weight: bold;
        }
        .status.success { background: #D4EDDA; color: #155724; }
        .status.warning { background: #FFF3CD; color: #856404; }
        .status.error { background: #F8D7DA; color: #721C24; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Error Debugging Test Page</h1>
        <p>This page helps test the comprehensive error debugging system.</p>
        
        <div id="status" class="status warning">
            ⏳ Waiting for error debugger to initialize...
        </div>
        
        <h2>Manual Error Tests</h2>
        <button class="test-button" onclick="testSandboxError()">Test Sandbox Error</button>
        <button class="test-button" onclick="testSplashScreenError()">Test SplashScreen Error</button>
        <button class="test-button" onclick="testCapacitorError()">Test Capacitor Error</button>
        <button class="test-button" onclick="testNetworkError()">Test Network Error</button>
        <button class="test-button" onclick="testRuntimeError()">Test Runtime Error</button>
        <button class="test-button" onclick="runAllTests()">Run All Tests</button>
        <button class="test-button" onclick="clearErrors()" style="background: #FF6B6B;">Clear Errors</button>
        
        <h2>Error Information</h2>
        <div id="errorInfo" class="error-display">
            No errors captured yet.
        </div>
        
        <h2>Debug Information</h2>
        <div id="debugInfo" class="error-display">
            Loading debug information...
        </div>
    </div>

    <script>
        let errorDebugger;
        
        // Check for error debugger availability
        const checkErrorDebugger = () => {
            if (window.__errorDebugger) {
                errorDebugger = window.__errorDebugger;
                document.getElementById('status').innerHTML = '✅ Error debugger is active and ready';
                document.getElementById('status').className = 'status success';
                updateDebugInfo();
                return true;
            }
            return false;
        };
        
        // Update debug information display
        const updateDebugInfo = () => {
            if (errorDebugger) {
                const debugInfo = errorDebugger.getDebugInfo();
                document.getElementById('debugInfo').innerHTML = \`
                    <strong>Debug Information:</strong><br>
                    Platform: \${navigator.platform}<br>
                    User Agent: \${navigator.userAgent.substring(0, 100)}...<br>
                    Capacitor Available: \${typeof window.Capacitor !== 'undefined'}<br>
                    Capacitor Platform: \${window.Capacitor ? window.Capacitor.getPlatform() : 'N/A'}<br>
                    Native Platform: \${window.Capacitor ? window.Capacitor.isNativePlatform() : 'N/A'}<br>
                    Document Ready State: \${document.readyState}<br>
                    Window Location: \${window.location.href}<br>
                    Memory Usage: \${performance.memory ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}
                \`;
                
                const errors = errorDebugger.getErrors();
                if (errors && errors.length > 0) {
                    document.getElementById('errorInfo').innerHTML = \`
                        <strong>Captured Errors (\${errors.length}):</strong><br><br>
                        \${errors.slice(0, 10).map((error, index) => \`
                            <div style="margin-bottom: 15px; padding: 10px; background: #FFF; border-left: 4px solid #FF6B6B;">
                                <strong>\${index + 1}. [\${error.severity.toUpperCase()}] \${error.type}:</strong><br>
                                \${error.message}<br>
                                <small style="color: #666;">
                                    \${new Date(error.timestamp).toLocaleString()}
                                    \${error.url ? \` • \${error.url.split('/').pop()}\` : ''}
                                    \${error.lineNumber ? \`:\${error.lineNumber}\` : ''}
                                </small>
                            </div>
                        \`).join('')}
                    \`;
                } else {
                    document.getElementById('errorInfo').innerHTML = 'No errors captured yet.';
                }
            }
        };
        
        // Test functions
        const testSandboxError = () => {
            window.dispatchEvent(new ErrorEvent('error', {
                message: 'Could not create a sandbox extension for file test',
                filename: 'capacitor://localhost/main.js',
                lineno: 42,
                colno: 10
            }));
            setTimeout(updateDebugInfo, 100);
        };
        
        const testSplashScreenError = () => {
            console.error('SplashScreen plugin TO JS undefined');
            setTimeout(updateDebugInfo, 100);
        };
        
        const testCapacitorError = () => {
            console.error('Capacitor plugin initialization failed: TypeError undefined');
            setTimeout(updateDebugInfo, 100);
        };
        
        const testNetworkError = () => {
            fetch('https://nonexistent-domain-12345.com/test').catch(() => {});
            setTimeout(updateDebugInfo, 100);
        };
        
        const testRuntimeError = () => {
            try {
                undefinedFunction();
            } catch (error) {
                console.error('Runtime error:', error);
            }
            setTimeout(updateDebugInfo, 100);
        };
        
        const runAllTests = () => {
            testSandboxError();
            setTimeout(testSplashScreenError, 500);
            setTimeout(testCapacitorError, 1000);
            setTimeout(testNetworkError, 1500);
            setTimeout(testRuntimeError, 2000);
            setTimeout(updateDebugInfo, 2500);
        };
        
        const clearErrors = () => {
            if (errorDebugger) {
                errorDebugger.clearErrors();
                updateDebugInfo();
            }
        };
        
        // Check for debugger every second
        const debuggerCheckInterval = setInterval(() => {
            if (checkErrorDebugger()) {
                clearInterval(debuggerCheckInterval);
            }
        }, 1000);
        
        // Update info every 5 seconds
        setInterval(updateDebugInfo, 5000);
    </script>
</body>
</html>
`;

  fs.writeFileSync('public/debug-test.html', debugPageContent);
  console.log('✅ Debug test page created at public/debug-test.html');
  
  return true;
}

// Create monitoring script
function createMonitoringScript() {
  console.log('\n📊 Creating error monitoring script...');
  
  const monitoringScript = `#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('📊 Error Monitoring Script');
console.log('==========================');

// Check if app is running
const checkAppStatus = () => {
  try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', { encoding: 'utf8' });
    return response.trim() === '200';
  } catch (error) {
    return false;
  }
};

// Monitor iOS simulator
const monitorIOSSimulator = () => {
  try {
    const simulatorStatus = execSync('xcrun simctl list devices | grep "Booted"', { encoding: 'utf8' });
    return simulatorStatus.trim().length > 0;
  } catch (error) {
    return false;
  }
};

// Generate monitoring report
const generateReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    appStatus: checkAppStatus(),
    iosSimulatorRunning: monitorIOSSimulator(),
    debugComponents: {
      comprehensiveErrorDebugger: fs.existsSync('src/components/ComprehensiveErrorDebugger.tsx'),
      iosSandboxErrorHandler: fs.existsSync('src/components/IOSSandboxErrorHandler.tsx'),
      enhancedSplashScreen: fs.existsSync('src/components/SplashScreenHandler.tsx'),
      errorSimulationScript: fs.existsSync('public/error-simulation.js'),
      debugTestPage: fs.existsSync('public/debug-test.html')
    },
    recommendations: [
      'Open debug-test.html in browser to test error handling',
      'Check iOS simulator for native error conditions',
      'Monitor console for comprehensive error logging',
      'Use error simulation script for automated testing'
    ]
  };
  
  console.log('📋 Monitoring Report:');
  console.log(\`App Status: \${report.appStatus ? '✅ Running' : '❌ Not Running'}\`);
  console.log(\`iOS Simulator: \${report.iosSimulatorRunning ? '✅ Running' : '❌ Not Running'}\`);
  console.log('\\n🔧 Debug Components:');
  Object.entries(report.debugComponents).forEach(([component, exists]) => {
    console.log(\`  \${exists ? '✅' : '❌'} \${component}\`);
  });
  
  fs.writeFileSync('error-monitoring-report.json', JSON.stringify(report, null, 2));
  console.log('\\n📄 Report saved to: error-monitoring-report.json');
  
  return report;
};

generateReport();
`;

  fs.writeFileSync('error-monitoring.js', monitoringScript);
  console.log('✅ Error monitoring script created');
  
  return true;
}

// Main execution
async function main() {
  console.log('Setting up comprehensive error debugging...\n');
  
  const steps = [
    { name: 'Create Error Simulation Script', fn: createErrorSimulationScript },
    { name: 'Create Debug Test Page', fn: createDebugPage },
    { name: 'Create Monitoring Script', fn: createMonitoringScript }
  ];
  
  let successCount = 0;
  
  for (const step of steps) {
    try {
      const success = step.fn();
      if (success) {
        successCount++;
      }
    } catch (error) {
      console.error(\`❌ Step "\${step.name}" failed:\`, error);
    }
  }
  
  console.log(\`\\n🎯 Setup Summary: \${successCount}/\${steps.length} steps completed\`);
  
  if (successCount === steps.length) {
    console.log('\\n🎉 Comprehensive error debugging setup complete!');
    console.log('\\n📋 Next Steps:');
    console.log('1. Start your Next.js app: npm run dev');
    console.log('2. Open http://localhost:3000/debug-test.html for testing');
    console.log('3. Check browser console for detailed error logs');
    console.log('4. Monitor the red error banner at top of app for real-time errors');
    console.log('5. Run: node error-monitoring.js for status reports');
  } else {
    console.log('\\n⚠️ Setup completed with some issues.');
  }
}

main().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});`;

  fs.writeFileSync('setup-error-debugging.js', monitoringScript);
  console.log('✅ Complete error debugging setup script created');
  
  return true;
}

// Execute the script
main();
