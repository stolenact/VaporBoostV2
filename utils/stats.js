<<<<<<< HEAD
const c = require('./colors');
const readline = require('readline-sync');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

class Statistics {
    constructor() {
        this.statsFile = path.join(ROOT_DIR, 'logs', 'statistics.json');
        this.history = this.loadHistory();
    }

    loadHistory() {
        try {
            if (fs.existsSync(this.statsFile)) {
                return JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
            }
        } catch (e) {}
        return { sessions: [], totalHours: 0, totalSessions: 0 };
    }

    saveHistory() {
        try {
            const dir = path.dirname(this.statsFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.statsFile, JSON.stringify(this.history, null, 2));
        } catch (e) {}
    }

    recordSession(sessionStats, clients) {
        const duration = Date.now() - sessionStats.startTime;
=======
/**
 * VaporBooster - Statistics Module
 * Tracks and displays session/lifetime statistics
 * 
 * @author VaporBooster Team
 */

const fs = require('fs');
const path = require('path');
const c = require('./colors');
const ui = require('./ui');

const ROOT = path.join(__dirname, '..');
const STATS_FILE = path.join(ROOT, 'logs', 'statistics.json');

class Statistics {
    constructor() {
        this.history = this.loadHistory();
    }

    /**
     * Load statistics history from file
     * @returns {Object}
     */
    loadHistory() {
        try {
            if (fs.existsSync(STATS_FILE)) {
                return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
            }
        } catch (e) { /* ignore */ }

        return {
            totalSessions: 0,
            totalHours: 0,
            totalMessages: 0,
            sessions: []
        };
    }

    /**
     * Save statistics history
     */
    saveHistory() {
        try {
            const dir = path.dirname(STATS_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(STATS_FILE, JSON.stringify(this.history, null, 2));
        } catch (e) { /* ignore */ }
    }

    /**
     * Record current session statistics
     * @param {Object} sessionStats 
     * @param {Map} clients 
     */
    recordSession(sessionStats, clients) {
        const duration = Date.now() - sessionStats.startTime;
        const hours = duration / 3600000;

        // Calculate total boosted hours across all accounts
        let totalAccountHours = 0;
        clients.forEach(data => {
            const t = data.timer.getTimeValues();
            totalAccountHours += t.hours + (t.minutes / 60) + (t.seconds / 3600);
        });

>>>>>>> 894d41f (Updated V3 pre-release)
        const session = {
            date: new Date().toISOString(),
            duration,
            accounts: clients.size,
<<<<<<< HEAD
            messages: sessionStats.messagesReceived
        };
        
        this.history.sessions.push(session);
        this.history.totalSessions++;
        this.history.totalHours += duration / 3600000;
        this.saveHistory();
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    showDashboard(sessionStats, clients, callback) {
        console.clear();
        
        const uptime = this.formatDuration(Date.now() - sessionStats.startTime);
        const activeAccounts = clients.size;
        
        let totalGames = 0;
        clients.forEach((data) => {
            totalGames += data.games.filter(g => typeof g === 'number').length;
        });

        console.log(`
${c.cyan}+=========================================================================+${c.reset}
${c.cyan}|${c.reset}                       ${c.bold}${c.white}STATISTICS DASHBOARD${c.reset}                           ${c.cyan}|${c.reset}
${c.cyan}+=========================================================================+${c.reset}
${c.cyan}|${c.reset}                                                                         ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}   ${c.yellow}[ CURRENT SESSION ]${c.reset}                                                 ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}   +---------------------------------------------------------------+   ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}   | Uptime:           ${c.green}${uptime.padEnd(20)}${c.reset}                      |   ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}   | Active Accounts:  ${c.green}${String(activeAccounts).padEnd(20)}${c.reset}                      |   ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}   | Games Boosting:   ${c.green}${String(totalGames).padEnd(20)}${c.reset}                      |   ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}   | Messages:         ${c.green}${String(sessionStats.messagesReceived).padEnd(20)}${c.reset}                      |   ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}   | Reconnections:    ${c.green}${String(sessionStats.reconnections).padEnd(20)}${c.reset}                      |   ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}   +---------------------------------------------------------------+   ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}                                                                         ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}   ${c.magenta}[ LIFETIME STATISTICS ]${c.reset}                                             ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}   +---------------------------------------------------------------+   ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}   | Total Sessions:   ${c.yellow}${String(this.history.totalSessions).padEnd(20)}${c.reset}                      |   ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}   | Total Hours:      ${c.yellow}${this.history.totalHours.toFixed(2).padEnd(20)}${c.reset}                      |   ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}   +---------------------------------------------------------------+   ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}                                                                         ${c.cyan}|${c.reset}
${c.cyan}+=========================================================================+${c.reset}`);

        if (clients.size > 0) {
            console.log(`${c.cyan}|${c.reset}   ${c.bold}ACCOUNT BREAKDOWN${c.reset}                                                    ${c.cyan}|${c.reset}`);
            console.log(`${c.cyan}|${c.reset}   +---------------------------------------------------------------+   ${c.cyan}|${c.reset}`);
            
            clients.forEach((data, username) => {
                const time = data.timer.getTimeValues().toString();
                const games = data.games.filter(g => typeof g === 'number').length;
                const status = data.client.steamID ? `${c.green}ON ${c.reset}` : `${c.red}OFF${c.reset}`;
                console.log(`${c.cyan}|${c.reset}   | [${status}] ${c.yellow}${username.padEnd(18)}${c.reset} | Time: ${c.white}${time.padEnd(10)}${c.reset} | Games: ${c.magenta}${games}${c.reset} |   ${c.cyan}|${c.reset}`);
            });
            
            console.log(`${c.cyan}|${c.reset}   +---------------------------------------------------------------+   ${c.cyan}|${c.reset}`);
        }

        console.log(`${c.cyan}+=========================================================================+${c.reset}`);
        
        readline.question(`\n${c.dim}Press Enter to go back...${c.reset}`);
        
        if (callback) callback();
    }

    generateReport(clients, sessionStats) {
        const report = {
            generated: new Date().toISOString(),
            session: {
                uptime: this.formatDuration(Date.now() - sessionStats.startTime),
                accounts: clients.size,
                messages: sessionStats.messagesReceived
            },
            accounts: [],
            lifetime: this.history
        };

        clients.forEach((data, username) => {
            report.accounts.push({
                username,
                time: data.timer.getTimeValues().toString(),
                games: data.games.filter(g => typeof g === 'number'),
                online: !!data.client.steamID
            });
        });

        const logsDir = path.join(ROOT_DIR, 'logs');
        if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
        
        const filename = `report_${Date.now()}.json`;
        fs.writeFileSync(path.join(logsDir, filename), JSON.stringify(report, null, 2));
        return filename;
=======
            messages: sessionStats.messagesReceived,
            errors: sessionStats.errors,
            hoursGained: totalAccountHours
        };

        this.history.sessions.push(session);
        this.history.totalSessions++;
        this.history.totalHours += totalAccountHours;
        this.history.totalMessages += sessionStats.messagesReceived;

        // Keep only last 100 sessions
        if (this.history.sessions.length > 100) {
            this.history.sessions = this.history.sessions.slice(-100);
        }

        this.saveHistory();
    }

    /**
     * Format milliseconds to readable duration
     * @param {number} ms 
     * @returns {string}
     */
    formatDuration(ms) {
        const sec = Math.floor(ms / 1000);
        const min = Math.floor(sec / 60);
        const hrs = Math.floor(min / 60);
        const days = Math.floor(hrs / 24);

        if (days > 0) return `${days}d ${hrs % 24}h ${min % 60}m`;
        if (hrs > 0) return `${hrs}h ${min % 60}m ${sec % 60}s`;
        if (min > 0) return `${min}m ${sec % 60}s`;
        return `${sec}s`;
    }

    /**
     * Display statistics dashboard
     * @param {Object} sessionStats 
     * @param {Map} clients 
     * @param {Function} callback 
     */
    showDashboard(sessionStats, clients, callback) {
        console.clear();

        const uptime = this.formatDuration(Date.now() - sessionStats.startTime);

        // Calculate current session stats
        let totalGames = 0;
        let currentHours = 0;

        clients.forEach(data => {
            totalGames += data.games.filter(g => typeof g === 'number').length;
            const t = data.timer.getTimeValues();
            currentHours += t.hours + (t.minutes / 60);
        });

        // Current session box
        ui.box('CURRENT SESSION', [
            '',
            `  Uptime:         ${c.green}${uptime}${c.reset}`,
            `  Active Accounts:${c.green} ${clients.size}${c.reset}`,
            `  Games Boosting: ${c.green}${totalGames}${c.reset}`,
            `  Hours Gained:   ${c.green}${currentHours.toFixed(2)}${c.reset}`,
            `  Messages:       ${c.green}${sessionStats.messagesReceived}${c.reset}`,
            `  Errors:         ${c.yellow}${sessionStats.errors}${c.reset}`,
            `  Reconnections:  ${c.yellow}${sessionStats.reconnections}${c.reset}`,
            ''
        ]);

        // Lifetime stats box
        ui.box('LIFETIME STATISTICS', [
            '',
            `  Total Sessions:   ${c.yellow}${this.history.totalSessions}${c.reset}`,
            `  Total Hours:      ${c.yellow}${this.history.totalHours.toFixed(2)}${c.reset}`,
            `  Total Messages:   ${c.yellow}${this.history.totalMessages}${c.reset}`,
            ''
        ]);

        // Per-account breakdown
        if (clients.size > 0) {
            const accountLines = [''];

            clients.forEach((data, name) => {
                const t = data.timer.getTimeValues();
                const time = `${String(t.hours).padStart(2, '0')}:${String(t.minutes).padStart(2, '0')}:${String(t.seconds).padStart(2, '0')}`;
                const games = data.games.filter(g => typeof g === 'number').length;
                const status = data.client.steamID ? `${c.green}ON${c.reset} ` : `${c.red}OFF${c.reset}`;
                const mode = data.account.invisible ? `${c.dim}(inv)${c.reset}` : '';

                accountLines.push(`  [${status}] ${c.yellow}${name.padEnd(15)}${c.reset} ${mode}`);
                accountLines.push(`        Time: ${c.white}${time}${c.reset}  Games: ${c.cyan}${games}${c.reset}`);
            });

            accountLines.push('');
            ui.box('ACCOUNT DETAILS', accountLines);
        }

        ui.pause();
        if (callback) callback();
    }

    /**
     * Get quick stats summary
     * @param {Map} clients 
     * @returns {Object}
     */
    getQuickStats(clients) {
        let totalGames = 0;
        let totalHours = 0;

        clients.forEach(data => {
            totalGames += data.games.filter(g => typeof g === 'number').length;
            const t = data.timer.getTimeValues();
            totalHours += t.hours + (t.minutes / 60);
        });

        return {
            accounts: clients.size,
            games: totalGames,
            hours: totalHours.toFixed(2),
            lifetime: this.history.totalHours.toFixed(2)
        };
>>>>>>> 894d41f (Updated V3 pre-release)
    }
}

module.exports = new Statistics();