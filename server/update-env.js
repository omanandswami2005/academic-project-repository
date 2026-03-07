// Helper script to update .env file with email credentials
// Usage: node update-env.js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(__dirname, '.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📧 Email Configuration Setup\n');
console.log('This script will help you configure your email credentials.\n');

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateEnv() {
  try {
    // Read current .env if it exists
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Get email address
    const emailUser = await askQuestion('Enter your Gmail address: ');
    
    if (!emailUser || !emailUser.includes('@')) {
      console.error('\n❌ Invalid email address!');
      rl.close();
      return;
    }

    // Get app password
    console.log('\n💡 To get your Gmail App Password:');
    console.log('   1. Go to: https://myaccount.google.com/apppasswords');
    console.log('   2. Generate an App Password for "Mail"');
    console.log('   3. Copy the 16-character password (remove spaces)\n');
    
    const emailPass = await askQuestion('Enter your Gmail App Password: ');
    
    if (!emailPass || emailPass.length < 10) {
      console.error('\n❌ App Password seems invalid!');
      rl.close();
      return;
    }

    // Get frontend URL
    const frontendUrl = await askQuestion('\nEnter Frontend URL (press Enter for default http://localhost:3000): ') || 'http://localhost:3000';

    // Create .env content
    const newEnvContent = `EMAIL_USER=${emailUser}
EMAIL_PASS=${emailPass}
FRONTEND_URL=${frontendUrl}
`;

    // Write to file
    fs.writeFileSync(envPath, newEnvContent, 'utf8');
    
    console.log('\n✅ .env file updated successfully!');
    console.log(`   Email: ${emailUser}`);
    console.log(`   Frontend URL: ${frontendUrl}\n`);
    console.log('📝 Next steps:');
    console.log('   1. Restart your server (stop with Ctrl+C, then start again)');
    console.log('   2. Test email: npm run test-email');
    console.log('   3. Try forgot password again\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

updateEnv();

