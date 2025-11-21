const fs = require('fs');
const path = require('path');
const c = require('./colors');

// FIXED: Ruta a la raíz del proyecto
const ROOT_DIR = path.join(__dirname, '..');

class Logger {
    constructor() {
        this.logFile = path.join(ROOT_DIR, 'logs', `vapor_${this.getDateString()}.log`);
        this.debugMode = false;
        this.logToFile = true;
    }

    getDateString() {
        return new Date().toISOString().split('T')[0];
    }

    getTimestamp() {
        return new Date().toLocaleTimeString('en-US', { hour12: false });
    }

    formatMessage(level, message) {
        return `[${this.getTimestamp()}] [${level}] ${message}`;
    }

    writeToFile(message) {
        if (!this.logToFile) return;
        try {
            const dir = path.dirname(this.logFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.appendFileSync(this.logFile, message + '\n');
        } catch (err) {
            // Silently fail
        }
    }

    info(message) {
        const formatted = this.formatMessage('INFO', message);
        console.log(`${c.cyan}i${c.reset}  ${c.dim}${this.getTimestamp()}${c.reset} ${message}`);
        this.writeToFile(formatted);
    }

    success(message) {
        const formatted = this.formatMessage('SUCCESS', message);
        console.log(`${c.green}+${c.reset}  ${c.dim}${this.getTimestamp()}${c.reset} ${c.green}${message}${c.reset}`);
        this.writeToFile(formatted);
    }

    warn(message) {
        const formatted = this.formatMessage('WARN', message);
        console.log(`${c.yellow}!${c.reset}  ${c.dim}${this.getTimestamp()}${c.reset} ${c.yellow}${message}${c.reset}`);
        this.writeToFile(formatted);
    }

    error(message) {
        const formatted = this.formatMessage('ERROR', message);
        console.log(`${c.red}x${c.reset}  ${c.dim}${this.getTimestamp()}${c.reset} ${c.red}${message}${c.reset}`);
        this.writeToFile(formatted);
    }

    debug(message) {
        if (!this.debugMode) return;
        const formatted = this.formatMessage('DEBUG', message);
        console.log(`${c.magenta}*${c.reset}  ${c.dim}${this.getTimestamp()}${c.reset} ${c.dim}${message}${c.reset}`);
        this.writeToFile(formatted);
    }

    message(message) {
        const formatted = this.formatMessage('MSG', message);
        console.log(`${c.brightCyan}>${c.reset} ${c.dim}${this.getTimestamp()}${c.reset} ${c.brightCyan}${message}${c.reset}`);
        this.writeToFile(formatted);
    }

    steam(message) {
        const formatted = this.formatMessage('STEAM', message);
        console.log(`${c.blue}S${c.reset} ${c.dim}${this.getTimestamp()}${c.reset} ${c.blue}${message}${c.reset}`);
        this.writeToFile(formatted);
    }

    box(title, content, color = c.cyan) {
        const width = 60;
        const line = '='.repeat(width - 2);
        
        console.log(`${color}+${line}+${c.reset}`);
        console.log(`${color}|${c.reset} ${c.bold}${title.padEnd(width - 4)}${c.reset} ${color}|${c.reset}`);
        console.log(`${color}+${line}+${c.reset}`);
        
        content.forEach(l => {
            const cleanLine = l.replace(/\x1b\[[0-9;]*m/g, '');
            const padding = width - 4 - cleanLine.length;
            console.log(`${color}|${c.reset} ${l}${' '.repeat(Math.max(0, padding))} ${color}|${c.reset}`);
        });
        
        console.log(`${color}+${line}+${c.reset}`);
    }

    progressBar(current, total, width = 30) {
        const percentage = Math.round((current / total) * 100);
        const filled = Math.round((current / total) * width);
        const empty = width - filled;
        
        const bar = `${c.green}${'#'.repeat(filled)}${c.dim}${'-'.repeat(empty)}${c.reset}`;
        return `${bar} ${percentage}%`;
    }

    spinner() {
        const frames = ['|', '/', '-', '\\'];
        let i = 0;
        
        return {
            start: (message) => {
                this._spinnerInterval = setInterval(() => {
                    process.stdout.write(`\r${c.cyan}${frames[i]}${c.reset} ${message}`);
                    i = (i + 1) % frames.length;
                }, 100);
            },
            stop: (finalMessage) => {
                clearInterval(this._spinnerInterval);
                process.stdout.write(`\r${c.green}+${c.reset} ${finalMessage}\n`);
            }
        };
    }

    table(headers, rows) {
        const colWidths = headers.map((h, i) => {
            const maxData = Math.max(...rows.map(r => String(r[i] || '').length));
            return Math.max(h.length, maxData) + 2;
        });

        const topBorder = `${c.cyan}+${colWidths.map(w => '-'.repeat(w)).join('+')}+${c.reset}`;
        const headerSep = `${c.cyan}+${colWidths.map(w => '-'.repeat(w)).join('+')}+${c.reset}`;
        const bottomBorder = `${c.cyan}+${colWidths.map(w => '-'.repeat(w)).join('+')}+${c.reset}`;

        console.log(topBorder);
        console.log(`${c.cyan}|${c.reset}${headers.map((h, i) => ` ${c.bold}${h.padEnd(colWidths[i] - 1)}${c.reset}`).join(`${c.cyan}|${c.reset}`)}${c.cyan}|${c.reset}`);
        console.log(headerSep);
        
        rows.forEach(row => {
            console.log(`${c.cyan}|${c.reset}${row.map((cell, i) => ` ${String(cell || '').padEnd(colWidths[i] - 1)}`).join(`${c.cyan}|${c.reset}`)}${c.cyan}|${c.reset}`);
        });
        
        console.log(bottomBorder);
    }
}

module.exports = new Logger();