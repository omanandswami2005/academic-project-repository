// Quick verification script to check if the project is set up correctly
import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying Project Setup...\n');

const checks = {
  'Frontend package.json': fs.existsSync('package.json'),
  'Backend package.json': fs.existsSync('server/package.json'),
  'Vite config': fs.existsSync('vite.config.js'),
  'Server entry': fs.existsSync('server/Index.js'),
  'Database config': fs.existsSync('server/db.js'),
  'User model': fs.existsSync('server/models/User.js'),
  'App component': fs.existsSync('src/App.jsx'),
  'Main entry': fs.existsSync('src/main.jsx'),
  'Index HTML': fs.existsSync('index.html'),
};

let allPassed = true;
for (const [check, passed] of Object.entries(checks)) {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${check}`);
  if (!passed) allPassed = false;
}

console.log('\n📦 Checking Dependencies...\n');

try {
  const frontendPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const backendPkg = JSON.parse(fs.readFileSync('server/package.json', 'utf8'));
  
  const frontendDeps = Object.keys(frontendPkg.dependencies || {});
  const backendDeps = Object.keys(backendPkg.dependencies || {});
  
  console.log(`Frontend dependencies: ${frontendDeps.length}`);
  console.log(`  Required: react, react-dom, react-router-dom, axios`);
  console.log(`Backend dependencies: ${backendDeps.length}`);
  console.log(`  Required: express, mongoose, cors, bcryptjs`);
  
  const nodeModulesFrontend = fs.existsSync('node_modules');
  const nodeModulesBackend = fs.existsSync('server/node_modules');
  
  console.log(`\n${nodeModulesFrontend ? '✅' : '❌'} Frontend node_modules installed`);
  console.log(`${nodeModulesBackend ? '✅' : '❌'} Backend node_modules installed`);
  
  if (!nodeModulesFrontend || !nodeModulesBackend) {
    allPassed = false;
    console.log('\n⚠️  Run: npm install (in root) and npm install (in server/)');
  }
} catch (error) {
  console.log('❌ Error reading package files:', error.message);
  allPassed = false;
}

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ Setup looks good! You can start the project.');
  console.log('\nTo start:');
  console.log('  1. Start MongoDB: net start MongoDB');
  console.log('  2. Start backend: cd server && npm start');
  console.log('  3. Start frontend: npm run dev');
  console.log('\nOr use: start-project.bat (Windows)');
} else {
  console.log('❌ Some issues found. Please fix them before running.');
}
console.log('='.repeat(50));

