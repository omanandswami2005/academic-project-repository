require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

(async () => {
    const connected = await testConnection();
    if (!connected) {
        logger.warn('DB', 'Server will start but database operations may fail!');
        logger.warn('DB', 'Set DATABASE_URL in your .env file to your Neon PostgreSQL connection string');
    }

    app.listen(PORT, () => {
        logger.server(`Server running on port ${PORT}`);
        logger.server(`API base: http://localhost:${PORT}/api`);
        logger.info('ENV', `Environment: ${process.env.NODE_ENV || 'development'}`);
    });
})();
