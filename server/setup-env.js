// Setup script to create .env file from .env.example
// Run with: node setup-env.js

const fs = require('fs');
const path = require('path');

const envExamplePath = path.join(__dirname, '.env.example');
const envPath = path.join(__dirname, '.env');

console.log('🔧 Setting up .env file...\n');

// Check if .env.example exists
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ ERROR: .env.example file not found!');
  console.log('   Please create .env.example first.\n');
  process.exit(1);
}

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  WARNING: .env file already exists!');
  console.log('   If you want to recreate it, delete the existing .env file first.\n');
  process.exit(0);
}

// Copy .env.example to .env
try {
  const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
  fs.writeFileSync(envPath, envExampleContent);
  
  console.log('✅ .env file created successfully!\n');
  console.log('📝 Next steps:');
  console.log('   1. Open server/.env in a text editor');
  console.log('   2. Fill in your EMAIL_USER and EMAIL_PASS');
  console.log('   3. For Gmail: Generate an App Password at https://myaccount.google.com/apppasswords');
  console.log('   4. Test your email configuration: npm run test-email\n');
  
} catch (error) {
  console.error('❌ ERROR: Failed to create .env file');
  console.error(`   ${error.message}\n`);
  process.exit(1);
}

