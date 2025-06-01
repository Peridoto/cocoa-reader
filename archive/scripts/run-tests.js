#!/usr/bin/env node
const { spawn } = require('child_process');

console.log('🧪 Running Web Ethics Compliance Tests...\n');

const vitest = spawn('npx', ['vitest', 'run', '--reporter=verbose'], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

vitest.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ All tests passed! Web ethics compliance implemented successfully.');
  } else {
    console.log('\n❌ Some tests failed. Please check the output above.');
  }
  process.exit(code);
});
