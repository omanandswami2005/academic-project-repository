require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

(async () => {
    const connected = await testConnection();
    if (!connected) {
        console.error('⚠️  Server will start but database operations may fail!');
        console.error('💡 Set DATABASE_URL in your .env file to your Neon PostgreSQL connection string');
    }

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 API: http://localhost:${PORT}/api`);
    });
})();
