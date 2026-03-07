const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // This tells the server to look for your local MongoDB
      // Note: useNewUrlParser and useUnifiedTopology are not needed in Mongoose 9+
      await mongoose.connect('mongodb://127.0.0.1:27017/project_db');
      console.log("✅ Database is Connected!");
      return true;
    } catch (err) {
      if (i < retries - 1) {
        console.log(`⏳ Attempt ${i + 1}/${retries} - Retrying connection in ${delay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error("❌ Connection failed after", retries, "attempts");
        console.error("Error:", err.message);
        console.error("💡 Make sure MongoDB is running on port 27017");
        console.error("💡 Start MongoDB with: mongod --dbpath C:\\data\\db");
        return false;
      }
    }
  }
};

module.exports = connectDB;