// Script to view all users in the database
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'expert'], default: 'student' }
});

const User = mongoose.model('User', UserSchema);

async function viewUsers() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/project_db');
    console.log('✅ Connected to database\n');
    
    const users = await User.find({}).select('-password'); // Exclude password for security
    console.log(`📊 Total Users: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      console.log('Users in database:');
      console.log('='.repeat(60));
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user._id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt || 'N/A'}`);
      });
      console.log('\n' + '='.repeat(60));
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from database');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

viewUsers();

