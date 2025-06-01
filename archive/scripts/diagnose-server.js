const { exec } = require('child_process');
const path = require('path');

console.log('🔍 COCOA READER SERVER DIAGNOSTICS');
console.log('===================================');

// Check if we're in the right directory
const currentDir = process.cwd();
console.log(`📂 Current directory: ${currentDir}`);

// Check if package.json exists
const fs = require('fs');
if (fs.existsSync('package.json')) {
    console.log('✅ package.json found');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`📦 Project: ${pkg.name} v${pkg.version}`);
} else {
    console.log('❌ package.json NOT found - wrong directory?');
    process.exit(1);
}

// Check Node.js version
console.log(`📦 Node.js: ${process.version}`);

// Check if node_modules exists
if (fs.existsSync('node_modules')) {
    console.log('✅ node_modules found');
} else {
    console.log('❌ node_modules NOT found - run: npm install');
}

// Check key source files
const keyFiles = [
    'src/app/page.tsx',
    'src/app/layout.tsx',
    'next.config.js',
    'tsconfig.json'
];

console.log('\n📁 Checking key files:');
keyFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} MISSING`);
    }
});

// Check if port 3000 is available
console.log('\n🔍 Checking port 3000...');
exec('lsof -i :3000', (error, stdout, stderr) => {
    if (stdout.trim()) {
        console.log('⚠️  Port 3000 is OCCUPIED:');
        console.log(stdout);
        console.log('\n🔧 To fix: kill -9 $(lsof -ti:3000)');
    } else {
        console.log('✅ Port 3000 is available');
    }
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('==============');
    console.log('1. Run: npm install (if node_modules missing)');
    console.log('2. Run: npm run dev');
    console.log('3. Open: http://localhost:3000');
    console.log('4. If issues persist, check browser console (F12)');
});
