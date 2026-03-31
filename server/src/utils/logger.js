/**
 * APRS Logger — Colorized, icon-rich terminal logging utility
 * Uses ANSI escape codes — no external dependencies required.
 */

// ─── ANSI Codes ───────────────────────────────────────────────────────────────
const R = '\x1b[0m';      // Reset
const B = '\x1b[1m';      // Bold
const D = '\x1b[2m';      // Dim

const fGray = '\x1b[90m';
const fRed = '\x1b[91m';
const fGreen = '\x1b[92m';
const fYellow = '\x1b[93m';
const fBlue = '\x1b[94m';
const fMagenta = '\x1b[95m';
const fCyan = '\x1b[96m';
const fWhite = '\x1b[97m';

const bgRed = '\x1b[41m';
const bgGreen = '\x1b[42m';
const bgYellow = '\x1b[43m';
const bgBlue = '\x1b[44m';
const bgMagenta = '\x1b[45m';
const bgCyan = '\x1b[46m';
const bgGray = '\x1b[100m';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timestamp() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${D}${fGray}[${hh}:${mm}:${ss}.${ms}]${R}`;
}

function pad(str, width) {
    return str.padEnd(width);
}

// ─── Level Badges ─────────────────────────────────────────────────────────────
const LEVELS = {
    info: { badge: `${bgBlue}${fWhite}${B} INFO  ${R}`, icon: '🔷' },
    success: { badge: `${bgGreen}${fWhite}${B} OK    ${R}`, icon: '✅' },
    warn: { badge: `${bgYellow}${fWhite}${B} WARN  ${R}`, icon: '⚠️ ' },
    error: { badge: `${bgRed}${fWhite}${B} ERROR ${R}`, icon: '❌' },
    debug: { badge: `${bgGray}${fWhite}${B} DEBUG ${R}`, icon: '🔍' },
    http: { badge: `${bgCyan}${fWhite}${B} HTTP  ${R}`, icon: '🌐' },
    db: { badge: `${bgBlue}${fWhite}${B} DB    ${R}`, icon: '💾' },
    auth: { badge: `${bgMagenta}${fWhite}${B} AUTH  ${R}`, icon: '🔐' },
    file: { badge: `${bgGray}${fWhite}${B} FILE  ${R}`, icon: '📁' },
    server: { badge: `${bgGreen}${fWhite}${B} START ${R}`, icon: '🚀' },
    notify: { badge: `${bgBlue}${fWhite}${B} NOTIF ${R}`, icon: '🔔' },
    mail: { badge: `${bgCyan}${fWhite}${B} MAIL  ${R}`, icon: '📧' },
};

// ─── Core print function ──────────────────────────────────────────────────────
function print(level, module, message, detail) {
    const { badge, icon } = LEVELS[level] || LEVELS.info;
    const ts = timestamp();
    const mod = module ? `${fCyan}${B}[${module.toUpperCase()}]${R} ` : '';
    const msg = message;
    const det = detail ? ` ${D}${fGray}→ ${detail}${R}` : '';
    process.stdout.write(`${ts} ${icon}  ${badge} ${mod}${msg}${det}\n`);
}

// ─── Public API ───────────────────────────────────────────────────────────────
const logger = {
    info(module, message, detail) { print('info', module, `${fWhite}${message}${R}`, detail); },
    success(module, message, detail) { print('success', module, `${fGreen}${message}${R}`, detail); },
    warn(module, message, detail) { print('warn', module, `${fYellow}${message}${R}`, detail); },
    error(module, message, err) {
        print('error', module, `${fRed}${message}${R}`);
        if (err) {
            const stack = err.stack || String(err);
            process.stderr.write(`${D}${fGray}${stack}${R}\n`);
        }
    },
    debug(module, message, detail) { print('debug', module, `${fGray}${message}${R}`, detail); },
    db(message, detail) { print('db', null, `${fBlue}${message}${R}`, detail); },
    auth(message, detail) { print('auth', null, `${fMagenta}${message}${R}`, detail); },
    file(message, detail) { print('file', null, `${fWhite}${message}${R}`, detail); },
    server(message, detail) { print('server', null, `${fGreen}${message}${R}`, detail); },
    notify(message, detail) { print('notify', null, `${fCyan}${message}${R}`, detail); },
    mail(message, detail) { print('mail', null, `${fCyan}${message}${R}`, detail); },

    /**
     * HTTP request logger — color-codes by status range.
     * @param {string} method  HTTP method
     * @param {string} url     Request path
     * @param {number} status  HTTP status code
     * @param {number} ms      Duration in milliseconds
     * @param {string} [user]  Optional user identifier
     */
    http(method, url, status, ms, user) {
        const statusColor =
            status >= 500 ? `${bgRed}${fWhite}` :
                status >= 400 ? `${fRed}` :
                    status >= 300 ? `${fYellow}` :
                        status >= 200 ? `${fGreen}` :
                            `${fWhite}`;

        const methodColor =
            method === 'GET' ? `${fGreen}` :
                method === 'POST' ? `${fBlue}` :
                    method === 'PUT' ? `${fYellow}` :
                        method === 'PATCH' ? `${fCyan}` :
                            method === 'DELETE' ? `${fRed}` :
                                `${fWhite}`;

        const msColor = ms > 1000 ? fRed : ms > 300 ? fYellow : fGreen;
        const userStr = user ? ` ${D}${fGray}| ${fMagenta}${user}${R}` : '';

        const { icon } = LEVELS.http;
        const ts = timestamp();
        const badge = LEVELS.http.badge;

        process.stdout.write(
            `${ts} ${icon}  ${badge} ${methodColor}${B}${pad(method, 7)}${R}` +
            `${fWhite}${url}${R}` +
            `  ${statusColor}${B}${status}${R}` +
            `  ${msColor}${ms}ms${R}` +
            `${userStr}\n`
        );
    },
};

module.exports = logger;
