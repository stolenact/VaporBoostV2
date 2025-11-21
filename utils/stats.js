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
        const session = {
            date: new Date().toISOString(),
            duration,
            accounts: clients.size,
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
    }
}

module.exports = new Statistics();