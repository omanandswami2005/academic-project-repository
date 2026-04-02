import re

with open('server/src/routes/user.routes.js', 'r') as f:
    content = f.read()

content = content.replace("const { getProfile, updateProfile, getUserById } = require('../controllers/user.controller');", "const { getProfile, updateProfile, getUserById, searchUsers } = require('../controllers/user.controller');")

new_route = "router.get('/search', authenticate, authorize('teacher', 'admin', 'expert'), searchUsers);\nrouter.get('/:id',"
content = content.replace("router.get('/:id',", new_route)

with open('server/src/routes/user.routes.js', 'w') as f:
    f.write(content)
