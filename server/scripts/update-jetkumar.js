require('dotenv').config();
const { getDB } = require('../src/config/db');
const { users } = require('../src/db/schema');
const { eq } = require('drizzle-orm');

async function updateJetkumar() {
    try {
        const db = getDB();
        
        // Find user by name
        console.log("Searching for user 'GAIKWAD JETKUMAR VIKAS'...");
        const [user] = await db.select()
            .from(users)
            .where(eq(users.username, 'GAIKWAD JETKUMAR VIKAS'))
            .limit(1);
            
        if (!user) {
            console.error("❌ Error: GAIKWAD JETKUMAR VIKAS not found in database!");
            process.exit(1);
        }
        
        console.log(`Found user: ID ${user.id} | Name: ${user.username} | Old PRN: ${user.prn} | Old Email: ${user.email}`);
        
        // Update user
        console.log("Updating PRN and Email in database...");
        const newPrn = 'RBT22CB005';
        const newEmail = 'rbt22cb005@rscoe.edu';
        
        const [updatedUser] = await db.update(users)
            .set({
                prn: newPrn,
                email: newEmail,
                updatedAt: new Date()
            })
            .where(eq(users.id, user.id))
            .returning();
            
        console.log(`\n======================================================`);
        console.log(`✅ SUCCESS: Jetkumar GAWKWAD's profile has been updated!`);
        console.log(`======================================================`);
        console.log(`  • ID:       ${updatedUser.id}`);
        console.log(`  • Username: ${updatedUser.username}`);
        console.log(`  • New PRN:  ${updatedUser.prn}`);
        console.log(`  • New Email:${updatedUser.email}`);
        console.log(`======================================================\n`);
        
        process.exit(0);
    } catch (e) {
        console.error("❌ Error updating Jetkumar's credentials:", e.message);
        process.exit(1);
    }
}

updateJetkumar();
