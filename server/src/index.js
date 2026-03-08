require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connectDB().then((connected) => {
    if (!connected) {
        console.error('⚠️  Server will start but database operations may fail!');
        console.error('💡 To start MongoDB on Windows, run: net start MongoDB');
    } else {
        console.log('✅ Database connection verified');
    }

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
