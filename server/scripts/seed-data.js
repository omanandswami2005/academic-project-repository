const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { getDB } = require('../src/config/db');
const { users, projects, projectPhases, projectMembers } = require('../src/db/schema');
const { eq, and, or } = require('drizzle-orm');
const logger = require('../src/utils/logger');

const jsonPath = path.join(__dirname, '../src/db/normalized_data.json');

const PHASE_NAMES = [
    'Idea & Proposal',
    'Research Paper',
    'Building Prototype',
    'Completing Prototype',
    'Completing Model',
    'Final Submission',
];

// Helper to extract domain tags from titles
function getDomainTags(title) {
    const t = (title || '').toLowerCase();
    const tags = new Set();
    
    if (t.includes('iot') || t.includes('solar') || t.includes('sensor') || t.includes('hardware') || t.includes('embedded')) {
        tags.add('IoT');
        tags.add('Embedded Systems');
    }
    if (t.includes('ai') || t.includes('artificial intelligence') || t.includes('ml') || t.includes('machine learning') || t.includes('deep learning') || t.includes('neural')) {
        tags.add('AI/ML');
    }
    if (t.includes('vision') || t.includes('dyskinesia') || t.includes('image') || t.includes('detection') || t.includes('analytics')) {
        tags.add('Computer Vision');
    }
    if (t.includes('healthcare') || t.includes('medical') || t.includes('healing') || t.includes('safety') || t.includes('women')) {
        tags.add('Healthcare & Safety');
    }
    if (t.includes('supply chain') || t.includes('blockchain') || t.includes('tracking')) {
        tags.add('Blockchain');
    }
    if (t.includes('web') || t.includes('app') || t.includes('system') || t.includes('management') || t.includes('platform') || t.includes('portal')) {
        tags.add('Web & Software');
    }
    if (t.includes('concrete') || t.includes('column') || t.includes('buckling') || t.includes('flood') || t.includes('hydrological') || t.includes('water')) {
        tags.add('Infrastructure & Env');
    }
    
    if (tags.size === 0) {
        tags.add('Capstone Project');
    }
    
    return Array.from(tags);
}

// Clean up guide names
function sanitizeGuideName(name) {
    if (!name) return null;
    let n = name.trim();
    // E.g. "Dr. S. C. Wagaj" or "Dr.Dipmala Salunke" or "Dr S. N. Khan / Dr. D.M.Mate"
    // Split on slashes or "co guide" if there's multiple, just pick the main one
    if (n.includes('/')) {
        n = n.split('/')[0].trim();
    }
    if (n.toLowerCase().includes('co guide')) {
        n = n.split(/co guide/i)[0].trim();
    }
    return n;
}

// Generate teacher email
function generateTeacherEmail(name) {
    if (!name) return null;
    const clean = name.toLowerCase()
        .replace(/dr\./g, '')
        .replace(/prof\./g, '')
        .replace(/[^a-z0-9]/g, '');
    return `${clean}@rscoe.edu`;
}

// Generate student email
function generateStudentEmail(prn, name) {
    if (prn) {
        return `${prn.toLowerCase().trim()}@rscoe.edu`;
    }
    const clean = (name || 'student').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${clean}@rscoe.edu`;
}

async function seed() {
    try {
        logger.info('SEED', 'Starting Stage 2: Database Seeding via Drizzle ORM...');

        if (!fs.existsSync(jsonPath)) {
            throw new Error(`Normalized JSON file not found at ${jsonPath}. Run Python normalizer first.`);
        }

        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        logger.info('SEED', `Loaded ${data.length} normalized projects from JSON.`);

        const db = getDB();

        // 1. Generate password hash for default Password@123
        logger.info('SEED', 'Hashing default password (Password@123)...');
        const passwordHash = await bcrypt.hash('Password@123', 12);

        // Map to keep track of inserted guides and students in memory
        const teacherMap = new Map(); // guide_name -> user_id
        const studentMap = new Map(); // prn -> user_id
        const projectSeqMap = new Map(); // branch -> current_sequence

        // Cache existing teachers/students in DB to make seed idempotent
        logger.info('SEED', 'Caching existing users from database to prevent duplicates...');
        const existingUsers = await db.select().from(users);
        for (const u of existingUsers) {
            if (u.role === 'teacher') {
                teacherMap.set(u.username, u.id);
            } else if (u.role === 'student' && u.prn) {
                studentMap.set(u.prn, u.id);
            }
        }
        logger.info('SEED', `Cached ${teacherMap.size} teachers and ${studentMap.size} students from DB.`);

        // 2. Loop and seed Guides (Teachers)
        logger.info('SEED', 'Extracting and seeding unique teachers...');
        for (const p of data) {
            const rawGuide = sanitizeGuideName(p.guide);
            if (!rawGuide) continue;

            if (!teacherMap.has(rawGuide)) {
                const email = generateTeacherEmail(rawGuide);
                
                // Double check DB by email
                const [exists] = await db.select().from(users).where(eq(users.email, email)).limit(1);
                if (exists) {
                    teacherMap.set(rawGuide, exists.id);
                    continue;
                }

                logger.db(`Inserting teacher: ${rawGuide} [${email}]`);
                const [newTeacher] = await db.insert(users).values({
                    username: rawGuide,
                    email,
                    passwordHash,
                    role: 'teacher',
                    branch: p.branch,
                    bio: `Mentor for the ${p.branch} department at RSCOE.`,
                }).returning({ id: users.id });

                teacherMap.set(rawGuide, newTeacher.id);
            }
        }

        // 3. Loop and seed Students
        logger.info('SEED', 'Seeding student accounts...');
        for (const p of data) {
            for (const m of p.members) {
                const cleanName = m.name || 'Unknown Student';
                const cleanPrnVal = m.prn || `TEMP_${cleanName.replace(/\s+/g, '')}`;
                
                if (!studentMap.has(cleanPrnVal)) {
                    const email = generateStudentEmail(m.prn, cleanName);

                    // Check DB by email or prn
                    const [exists] = await db.select().from(users)
                        .where(or(eq(users.email, email), eq(users.prn, cleanPrnVal)))
                        .limit(1);
                    if (exists) {
                        studentMap.set(cleanPrnVal, exists.id);
                        continue;
                    }

                    logger.db(`Inserting student: ${cleanName} [${cleanPrnVal}]`);
                    const [newStudent] = await db.insert(users).values({
                        username: cleanName,
                        email,
                        passwordHash,
                        role: 'student',
                        branch: p.branch,
                        prn: cleanPrnVal,
                        mobile: m.phone || null,
                        year: '4th Year',
                        bio: `Student at Rajarshi Shahu College of Engineering, ${p.branch} branch.`,
                    }).returning({ id: users.id });

                    studentMap.set(cleanPrnVal, newStudent.id);
                }
            }
        }

        // 4. Seed Projects, Group Members, and Phases
        logger.info('SEED', 'Seeding projects and structuring project groups...');
        let seededProjectsCount = 0;

        for (const p of data) {
            if (!p.members || p.members.length === 0) continue;

            const leaderPrn = p.members[0].prn || `TEMP_${p.members[0].name.replace(/\s+/g, '')}`;
            const leaderUserId = studentMap.get(leaderPrn);
            if (!leaderUserId) {
                logger.error('SEED', `Failed to find user ID for project leader: ${p.members[0].name}`);
                continue;
            }

            // Determine mentor ID if present
            let mentorUserId = null;
            const cleanGuide = sanitizeGuideName(p.guide);
            if (cleanGuide) {
                mentorUserId = teacherMap.get(cleanGuide) || null;
            }

            // Check if project already exists in database (matching by title and leader)
            const [exists] = await db.select().from(projects)
                .where(and(eq(projects.title, p.title), eq(projects.studentId, leaderUserId)))
                .limit(1);
            if (exists) {
                logger.warn('SEED', `Project already exists: "${p.title}" (Skipping)`);
                continue;
            }

            // Generate sequence number for unique project ID
            const branchCode = p.branch.toUpperCase().replace(/\s+/g, '');
            const currentSeq = (projectSeqMap.get(branchCode) || 0) + 1;
            projectSeqMap.set(branchCode, currentSeq);
            
            // Build unique project ID: BRANCH-S7-2026-SEQ
            const seqStr = String(currentSeq).padStart(3, '0');
            const uniqueProjId = `${branchCode}-S7-2026-${seqStr}`;

            const tags = getDomainTags(p.title);
            
            // Calculate phase completions based on sheet completionRate
            const rate = p.completionRate || 0.0;
            const completedPhasesCount = Math.round(rate * 6);

            logger.db(`Creating project [${uniqueProjId}]: "${p.title}" (Completion: ${Math.round(rate * 100)}%)`);
            const [newProject] = await db.insert(projects).values({
                uniqueProjectId: uniqueProjId,
                title: p.title,
                description: `Final year capstone project in the ${p.branch} department. Title: "${p.title}".`,
                domainTags: tags,
                semester: 7,
                studentId: leaderUserId,
                mentorId: mentorUserId,
                mentorStatus: mentorUserId ? 'accepted' : 'none',
                status: 'approved',
                visibility: 'public',
                stars: completedPhasesCount,
            }).returning({ id: projects.id });

            // Create Group Members
            for (let i = 0; i < p.members.length; i++) {
                const mem = p.members[i];
                const memPrn = mem.prn || `TEMP_${mem.name.replace(/\s+/g, '')}`;
                const memUserId = studentMap.get(memPrn);
                
                if (memUserId) {
                    await db.insert(projectMembers).values({
                        projectId: newProject.id,
                        userId: memUserId,
                        roleInGroup: i === 0 ? 'leader' : 'member',
                        status: 'accepted',
                    });
                }
            }

            // Create project phases (1 to 6)
            const phaseInserts = PHASE_NAMES.map((phaseName, index) => {
                const phaseNum = index + 1;
                const completed = phaseNum <= completedPhasesCount;
                return {
                    projectId: newProject.id,
                    phaseNumber: phaseNum,
                    phaseName,
                    completed,
                    completedAt: completed ? new Date() : null,
                    description: completed ? `Successfully submitted and reviewed phase ${phaseNum} milestone.` : '',
                };
            });
            await db.insert(projectPhases).values(phaseInserts);

            seededProjectsCount++;
        }

        logger.success('SEED', `Stage 2 COMPLETE: Successfully seeded ${seededProjectsCount} projects into the database!`);
        process.exit(0);
    } catch (error) {
        logger.error('SEED', 'Database seeding failed', error);
        process.exit(1);
    }
}

seed();
