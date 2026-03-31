const { eq, desc, and } = require('drizzle-orm');
const { getDB } = require('../config/db');
const { notifications } = require('../db/schema');
const logger = require('../utils/logger');

/**
 * GET /api/notifications
 */
const getNotifications = async (req, res) => {
    try {
        const db = getDB();
        const userId = req.user.id;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const offset = (page - 1) * limit;

        const notificationList = await db.select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(limit)
            .offset(offset);

        res.status(200).json({
            message: 'Notifications retrieved',
            notifications: notificationList,
        });
    } catch (error) {
        logger.error('NOTIF', 'Get notifications failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
    try {
        const db = getDB();
        const notificationId = parseInt(req.params.id);

        const [updated] = await db.update(notifications)
            .set({ read: true })
            .where(and(
                eq(notifications.id, notificationId),
                eq(notifications.userId, req.user.id)
            ))
            .returning();

        if (!updated) {
            logger.warn('NOTIF', `Notification id=${notificationId} not found for user id=${req.user.id}`);
            return res.status(404).json({ message: 'Notification not found.' });
        }

        res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
        logger.error('NOTIF', 'Mark as read failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
    try {
        const db = getDB();
        await db.update(notifications)
            .set({ read: true })
            .where(and(
                eq(notifications.userId, req.user.id),
                eq(notifications.read, false)
            ));

        res.status(200).json({ message: 'All notifications marked as read.' });
    } catch (error) {
        logger.error('NOTIF', 'Mark all as read failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
