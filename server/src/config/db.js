const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/project_db';
            await mongoose.connect(mongoURI);
            console.log('✅ Database is Connected!');
            return true;
        } catch (err) {
            if (i < retries - 1) {
                console.log(`⏳ Attempt ${i + 1}/${retries} - Retrying connection in ${delay / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                console.error('❌ Connection failed after', retries, 'attempts');
                console.error('Error:', err.message);
                console.error('💡 Make sure MongoDB is running on port 27017');
                return false;
            }
        }
    }
};

module.exports = connectDB;
