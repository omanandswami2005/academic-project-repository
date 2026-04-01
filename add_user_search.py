import re

with open('server/src/controllers/user.controller.js', 'r') as f:
    content = f.read()

# Add ilike to drizzle imports
content = content.replace("const { eq } = require('drizzle-orm');", "const { eq, ilike, or } = require('drizzle-orm');")

new_func = """/**
 * GET /api/users/search
 */
const searchUsers = async (req, res) => {
    try {
        const db = getDB();
        const { q } = req.query;

        if (!q || typeof q !== 'string') {
            return res.status(400).json({ message: 'Query parameter q is required.' });
        }

        const searchTerm = `%${q}%`;

        const result = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role,
            branch: users.branch,
        })
        .from(users)
        .where(
            or(
                ilike(users.username, searchTerm),
                ilike(users.email, searchTerm)
            )
        )
        .limit(20);

        res.status(200).json({ users: result });
    } catch (error) {
        logger.error('USER', 'Search users failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

module.exports = { getProfile, updateProfile, getUserById, searchUsers };"""

content = content.replace("module.exports = { getProfile, updateProfile, getUserById };", new_func)

with open('server/src/controllers/user.controller.js', 'w') as f:
    f.write(content)
