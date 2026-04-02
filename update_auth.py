import re

with open('server/src/controllers/auth.controller.js', 'r') as f:
    content = f.read()

old_returning = """        }).returning({
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role,
            branch: users.branch,
        });"""

new_returning = """        }).returning({
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role,
            branch: users.branch,
            bio: users.bio,
        });"""

content = content.replace(old_returning, new_returning)

with open('server/src/controllers/auth.controller.js', 'w') as f:
    f.write(content)
