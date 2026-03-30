/**
 * Comprehensive API test runner
 * Usage: node -r ./scripts/dns-fix.js scripts/test-api.js
 */
const http = require('http');

const BASE = 'http://localhost:5000';
let studentToken = '';
let teacherToken = '';
let expertToken = '';
let studentRefresh = '';
let studentId = 0;
let teacherId = 0;
let projectId = 0;

const results = { pass: 0, fail: 0, errors: [] };

async function req(method, path, body, token) {
    return new Promise((resolve) => {
        const url = new URL(path, BASE);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const r = http.request(options, (res) => {
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, data });
                }
            });
        });
        r.on('error', (e) => resolve({ status: 0, data: { message: e.message } }));
        if (body) r.write(JSON.stringify(body));
        r.end();
    });
}

function test(name, passed, detail) {
    if (passed) {
        results.pass++;
        console.log(`  ✅ ${name}`);
    } else {
        results.fail++;
        results.errors.push({ name, detail });
        console.log(`  ❌ ${name}: ${typeof detail === 'object' ? JSON.stringify(detail).substring(0, 200) : detail}`);
    }
}

async function run() {
    console.log('\n═══════════════════════════════════════════');
    console.log('  APRS API Test Suite');
    console.log('═══════════════════════════════════════════\n');

    // ─── Health ───
    console.log('── Health ──');
    let r = await req('GET', '/health');
    test('GET /health returns 200', r.status === 200, r.data);

    // ─── Auth: Signup ───
    console.log('\n── Auth: Signup ──');

    r = await req('POST', '/api/auth/signup', {
        username: 'API Student', email: 'apistudent@test.com',
        password: 'TestPass123', role: 'student', branch: 'Computer Science',
        prn: 'PRN100', mobile: '1234567890', year: '2024',
    });
    test('Signup student', r.status === 201 || r.data?.message?.includes('already exists'), r.data);

    r = await req('POST', '/api/auth/signup', {
        username: 'API Teacher', email: 'apiteacher@test.com',
        password: 'TestPass123', role: 'teacher', branch: 'Computer Science',
    });
    test('Signup teacher', r.status === 201 || r.data?.message?.includes('already exists'), r.data);

    r = await req('POST', '/api/auth/signup', {
        username: 'API Expert', email: 'apiexpert@test.com',
        password: 'TestPass123', role: 'expert',
    });
    test('Signup expert', r.status === 201 || r.data?.message?.includes('already exists'), r.data);

    // Signup validation
    r = await req('POST', '/api/auth/signup', { email: 'bad', password: '123' });
    test('Signup validation rejects bad input', r.status === 400, r.data);

    r = await req('POST', '/api/auth/signup', {
        username: 'Dup', email: 'apistudent@test.com', password: 'TestPass123',
    });
    test('Signup rejects duplicate email', r.status === 409 || r.data?.message?.includes('already exists'), r.data);

    // ─── Auth: Login ───
    console.log('\n── Auth: Login ──');

    r = await req('POST', '/api/auth/login', { email: 'apistudent@test.com', password: 'TestPass123' });
    test('Login student', r.status === 200 && r.data?.accessToken, r.data?.message || r.data);
    if (r.data?.accessToken) {
        studentToken = r.data.accessToken;
        studentRefresh = r.data.refreshToken;
        studentId = r.data.user?.id;
    }

    r = await req('POST', '/api/auth/login', { email: 'apiteacher@test.com', password: 'TestPass123' });
    test('Login teacher', r.status === 200 && r.data?.accessToken, r.data?.message || r.data);
    if (r.data?.accessToken) {
        teacherToken = r.data.accessToken;
        teacherId = r.data.user?.id;
    }

    r = await req('POST', '/api/auth/login', { email: 'apiexpert@test.com', password: 'TestPass123' });
    test('Login expert', r.status === 200 && r.data?.accessToken, r.data?.message || r.data);
    if (r.data?.accessToken) expertToken = r.data.accessToken;

    r = await req('POST', '/api/auth/login', { email: 'apistudent@test.com', password: 'WrongPass123' });
    test('Login rejects wrong password', r.status >= 400 && r.status < 500, r.data);

    r = await req('POST', '/api/auth/login', { email: 'nonexistent@test.com', password: 'TestPass123' });
    test('Login rejects unknown user', r.status >= 400 && r.status < 500, r.data);

    // ─── Auth: Refresh Token ───
    console.log('\n── Auth: Refresh Token ──');

    r = await req('POST', '/api/auth/refresh', { refreshToken: studentRefresh });
    test('Refresh token returns new accessToken', r.status === 200 && r.data?.accessToken, r.data?.message || r.data);
    if (r.data?.accessToken) studentToken = r.data.accessToken; // use new token

    r = await req('POST', '/api/auth/refresh', { refreshToken: 'invalidtoken' });
    test('Refresh rejects invalid token', r.status !== 200, r.data);

    // ─── Auth: Update Password ───
    console.log('\n── Auth: Update Password ──');

    r = await req('PATCH', '/api/auth/update-password', {
        currentPassword: 'TestPass123', newPassword: 'NewTestPass123',
    }, studentToken);
    test('Update password works', r.status === 200, r.data);

    // Change it back
    r = await req('POST', '/api/auth/login', { email: 'apistudent@test.com', password: 'NewTestPass123' });
    test('Login with new password', r.status === 200, r.data?.message || r.data);
    if (r.data?.accessToken) {
        studentToken = r.data.accessToken;
        studentRefresh = r.data.refreshToken;
    }

    r = await req('PATCH', '/api/auth/update-password', {
        currentPassword: 'NewTestPass123', newPassword: 'TestPass123',
    }, studentToken);
    test('Revert password back', r.status === 200, r.data);

    // Re-login to get fresh token
    r = await req('POST', '/api/auth/login', { email: 'apistudent@test.com', password: 'TestPass123' });
    if (r.data?.accessToken) {
        studentToken = r.data.accessToken;
        studentRefresh = r.data.refreshToken;
    }

    // ─── Auth: Protected Route without Token ───
    console.log('\n── Auth: Protected Routes ──');

    r = await req('PATCH', '/api/auth/update-password', {
        currentPassword: 'x', newPassword: 'TestPass123',
    });
    test('Protected route rejects no token', r.status === 401, r.data);

    r = await req('PATCH', '/api/auth/update-password', {
        currentPassword: 'x', newPassword: 'TestPass123',
    }, 'invalidtoken');
    test('Protected route rejects bad token', r.status === 401, r.data);

    // ─── Projects: Create ───
    console.log('\n── Projects: Create ──');

    r = await req('POST', '/api/projects', {
        title: 'Test Project Alpha',
        description: 'This is a test project for API testing purposes',
        domainTags: ['web', 'nodejs'],
        visibility: 'public',
    }, studentToken);
    test('Create project (student)', r.status === 201 && r.data?.project, r.data);
    if (r.data?.project) projectId = r.data.project.id;

    r = await req('POST', '/api/projects', {
        title: 'Test Project Beta',
        description: 'Another test project for comprehensive testing',
        domainTags: ['ml', 'python'],
        visibility: 'private',
    }, studentToken);
    test('Create second project', r.status === 201, r.data);

    // Non-student shouldn't create
    r = await req('POST', '/api/projects', {
        title: 'Teacher Proj', description: 'Should fail because teachers cannot create',
        domainTags: [],
    }, teacherToken);
    test('Teacher cannot create project', r.status === 403, r.data);

    // ─── Projects: Read ───
    console.log('\n── Projects: Read ──');

    r = await req('GET', '/api/projects', null, studentToken);
    test('List all projects', r.status === 200 && Array.isArray(r.data?.projects), r.data);

    if (projectId) {
        r = await req('GET', `/api/projects/${projectId}`, null, studentToken);
        test('Get project by ID', r.status === 200 && r.data?.project, r.data);
    }

    r = await req('GET', `/api/projects/student/${studentId}`, null, studentToken);
    test('Get projects by student ID', r.status === 200, r.data);

    r = await req('GET', '/api/projects/search?q=Test', null, studentToken);
    test('Search projects', r.status === 200, r.data);

    // ─── Projects: Update ───
    console.log('\n── Projects: Update ──');

    if (projectId) {
        r = await req('PATCH', `/api/projects/${projectId}`, {
            title: 'Updated Test Project Alpha',
            description: 'Updated description for test project',
        }, studentToken);
        test('Update project', r.status === 200, r.data);

        // Teacher updates status
        r = await req('PATCH', `/api/projects/${projectId}/status`, {
            status: 'approved',
        }, teacherToken);
        test('Teacher approves project', r.status === 200, r.data);

        // Update phase
        r = await req('PATCH', `/api/projects/${projectId}/phase`, {
            phase: '1',
            completed: true,
            description: 'Completed phase 1',
        }, studentToken);
        test('Update project phase', r.status === 200 || r.status === 201, r.data);

        // Bulk update phases
        r = await req('PATCH', `/api/projects/${projectId}/phases`, {
            phases: [
                { phaseNumber: 1, completed: true, description: 'Phase 1 done' },
                { phaseNumber: 2, completed: false, description: 'Phase 2 in progress' },
            ],
        }, studentToken);
        test('Bulk update phases', r.status === 200, r.data);
    }

    // ─── Students ───
    console.log('\n── Students ──');

    r = await req('GET', '/api/students', null, teacherToken);
    test('Get all students (teacher)', r.status === 200, r.data);

    r = await req('GET', '/api/students/branch/Computer%20Science', null, teacherToken);
    test('Get students by branch', r.status === 200, r.data);

    if (studentId) {
        r = await req('GET', `/api/students/${studentId}/skills`, null, studentToken);
        test('Get student skills', r.status === 200, r.data);
    }

    // ─── Users ───
    console.log('\n── Users ──');

    r = await req('GET', '/api/users/me', null, studentToken);
    test('Get own profile', r.status === 200 && r.data?.user, r.data);

    r = await req('PATCH', '/api/users/me', {
        username: 'API Student Updated', mobile: '0000000000',
    }, studentToken);
    test('Update profile', r.status === 200, r.data);

    // ─── Feedback ───
    console.log('\n── Feedback ──');

    if (projectId) {
        r = await req('POST', '/api/feedback', {
            projectId, rating: 4, comment: 'Good work on this project!',
            rubricScores: { quality: 4, innovation: 3 },
        }, teacherToken);
        test('Teacher gives feedback', r.status === 201 || r.status === 200, r.data);

        r = await req('GET', `/api/feedback/project/${projectId}`, null, studentToken);
        test('Get project feedback', r.status === 200, r.data);
    }

    // ─── Notifications ───
    console.log('\n── Notifications ──');

    r = await req('GET', '/api/notifications', null, studentToken);
    test('Get notifications', r.status === 200, r.data);

    r = await req('PATCH', '/api/notifications/read-all', null, studentToken);
    test('Mark all notifications read', r.status === 200, r.data);

    // ─── Analytics ───
    console.log('\n── Analytics ──');

    if (studentId) {
        r = await req('GET', `/api/analytics/skills/${studentId}`, null, teacherToken);
        test('Skill radar analytics', r.status === 200, r.data);
    }

    r = await req('GET', '/api/analytics/department/Computer%20Science', null, teacherToken);
    test('Department stats', r.status === 200, r.data);

    r = await req('GET', '/api/analytics/top-students', null, teacherToken);
    test('Top students', r.status === 200, r.data);

    // ─── Forgot Password (won't actually send email in test) ───
    console.log('\n── Forgot Password ──');

    r = await req('POST', '/api/auth/forgot-password', { email: 'apistudent@test.com' });
    test('Forgot password request', r.status === 200, r.data);

    // ─── Project Delete ───
    console.log('\n── Project Delete ──');

    // Create a project to delete
    r = await req('POST', '/api/projects', {
        title: 'To Be Deleted',
        description: 'This project will be deleted in a moment',
    }, studentToken);
    const delId = r.data?.project?.id;
    if (delId) {
        r = await req('DELETE', `/api/projects/${delId}`, null, studentToken);
        test('Delete project', r.status === 200, r.data);
    }

    // ─── Logout ───
    console.log('\n── Logout ──');

    r = await req('POST', '/api/auth/logout', { refreshToken: studentRefresh });
    test('Logout', r.status === 200, r.data);

    // ─── 404 ───
    console.log('\n── Error Handling ──');

    r = await req('GET', '/api/nonexistent');
    test('404 for unknown route', r.status === 404, r.data);

    // ─── Summary ───
    console.log('\n═══════════════════════════════════════════');
    console.log(`  Results: ${results.pass} passed, ${results.fail} failed`);
    console.log('═══════════════════════════════════════════');

    if (results.errors.length > 0) {
        console.log('\n── Failed Tests ──');
        results.errors.forEach((e) => {
            console.log(`  ❌ ${e.name}`);
            console.log(`     ${typeof e.detail === 'object' ? JSON.stringify(e.detail).substring(0, 300) : e.detail}`);
        });
    }

    process.exit(results.fail > 0 ? 1 : 0);
}

run();
