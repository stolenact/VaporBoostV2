/**
 * VaporBooster - Logging System
 * Handles all console output and file logging
 * 
 * @author VaporBooster Team
 */

const fs = require('fs');
const path = require('path');
const c = require('./colors');

const ROOT = path.join(__dirname, '..');

class Logger {
    constructor() {
        this.debugMode = false;
        this.logToFile = true;
        this.logDir = path.join(ROOT, 'logs');
        this.currentLogFile = null;
        this.init();
    }

    /**
     * Initialize logger
     */
    init() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        const date = new Date().toISOString().split('T')[0];
        this.currentLogFile = path.join(this.logDir, `vapor_${date}.log`);
    }

    /**
     * Get formatted timestamp
     * @returns {string}
     */
    timestamp() {
        return new Date().toLocaleTimeString('en-US', { hour12: false });
    }

    /**
     * Write to log file
     * @param {string} level 
     * @param {string} msg 
     */
    writeFile(level, msg) {
        if (!this.logToFile) return;
        try {
            const line = `[${new Date().toISOString()}] [${level}] ${msg}\n`;
            fs.appendFileSync(this.currentLogFile, line);
        } catch (e) { /* ignore */ }
    }

    /**
     * Info message
     * @param {string} msg 
     */
    info(msg) {
        console.log(`${c.cyan}ℹ${c.reset} ${c.dim}${this.timestamp()}${c.reset} ${msg}`);
        this.writeFile('INFO', msg);
    }

    /**
     * Success message
     * @param {string} msg 
     */
    success(msg) {
        console.log(`${c.green}✓${c.reset} ${c.dim}${this.timestamp()}${c.reset} ${c.green}${msg}${c.reset}`);
        this.writeFile('SUCCESS', msg);
    }

    /**
     * Warning message
     * @param {string} msg 
     */
    warn(msg) {
        console.log(`${c.yellow}⚠${c.reset} ${c.dim}${this.timestamp()}${c.reset} ${c.yellow}${msg}${c.reset}`);
        this.writeFile('WARN', msg);
    }

    /**
     * Error message
     * @param {string} msg 
     */
    error(msg) {
        console.log(`${c.red}✗${c.reset} ${c.dim}${this.timestamp()}${c.reset} ${c.red}${msg}${c.reset}`);
        this.writeFile('ERROR', msg);
    }

    /**
     * Debug message (only if debug mode enabled)
     * @param {string} msg 
     */
    debug(msg) {
        if (!this.debugMode) return;
        console.log(`${c.magenta}●${c.reset} ${c.dim}${this.timestamp()} ${msg}${c.reset}`);
        this.writeFile('DEBUG', msg);
    }

    /**
     * Chat message
     * @param {string} msg 
     */
    message(msg) {
        console.log(`${c.brightCyan}💬${c.reset} ${c.dim}${this.timestamp()}${c.reset} ${c.brightCyan}${msg}${c.reset}`);
        this.writeFile('MSG', msg);
    }

    /**
     * Steam-specific message
     * @param {string} msg 
     */
    steam(msg) {
        console.log(`${c.blue}🎮${c.reset} ${c.dim}${this.timestamp()}${c.reset} ${c.blue}${msg}${c.reset}`);
        this.writeFile('STEAM', msg);
    }
}

module.exports = new Logger();