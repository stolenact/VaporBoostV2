/**
 * VaporBooster - UI Utilities
 * Handles all console UI rendering with proper sizing
 * 
 * @author stolenact
 */

const readline = require('readline-sync');
const c = require('./colors');

// Fixed width for consistent UI (works in most terminals)
const WIDTH = 50;

/**
 * Draw a box with title and content
 * @param {string} title - Box title
 * @param {Array<string>} lines - Content lines
 * @param {Array<string>|null} sidebar - Optional sidebar content
 */
function box(title, lines, sidebar = null) {
    const w = WIDTH;
    const border = '─'.repeat(w - 2);

    console.log(`\n${c.cyan}┌${border}┐${c.reset}`);
    console.log(`${c.cyan}│${c.reset} ${c.bold}${title.padEnd(w - 4)}${c.reset} ${c.cyan}│${c.reset}`);
    console.log(`${c.cyan}├${border}┤${c.reset}`);

    const maxLines = Math.max(lines.length, sidebar ? sidebar.length : 0);

    for (let i = 0; i < maxLines; i++) {
        let mainLine = lines[i] || '';
        const cleanMain = stripAnsi(mainLine);
        const padMain = w - 4 - cleanMain.length;

        let row = `${c.cyan}│${c.reset} ${mainLine}${' '.repeat(Math.max(0, padMain))} ${c.cyan}│${c.reset}`;

        // Add sidebar if exists
        if (sidebar && sidebar[i]) {
            row += `  ${sidebar[i]}`;
        }

        console.log(row);
    }

    console.log(`${c.cyan}└${border}┘${c.reset}`);
}

/**
 * Simple box without sidebar
 * @param {string} title 
 * @param {Array<string>} lines 
 */
function simpleBox(title, lines) {
    box(title, lines, null);
}

/**
 * Strip ANSI codes from string (for length calculation)
 * @param {string} str 
 * @returns {string}
 */
function stripAnsi(str) {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
}

/**
 * Question wrapper with color
 * @param {string} prompt 
 * @returns {string}
 */
function question(prompt) {
    return readline.question(`${c.cyan}${prompt}${c.reset}`).trim();
}

/**
 * Password input (hidden, supports long passwords)
 * @param {string} prompt 
 * @returns {string}
 */
function questionPassword(prompt) {
    // readline-sync has issues with very long passwords
    // Use mask option for better UX
    return readline.question(`${c.cyan}${prompt}${c.reset}`, {
        hideEchoBack: true,
        mask: '*',
        limit: /./,  // Accept any character
        limitMessage: ''
    });
}

/**
 * Pause and wait for Enter
 */
function pause() {
    readline.question(`\n${c.dim}Press Enter to continue...${c.reset}`);
}

/**
 * Clear screen and show cursor
 */
function clear() {
    console.clear();
    process.stdout.write('\x1B[?25h'); // Show cursor
}

/**
 * Print a horizontal line
 */
function line() {
    console.log(`${c.dim}${'─'.repeat(WIDTH)}${c.reset}`);
}

/**
 * Print centered text
 * @param {string} text 
 */
function center(text) {
    const clean = stripAnsi(text);
    const pad = Math.max(0, Math.floor((WIDTH - clean.length) / 2));
    console.log(' '.repeat(pad) + text);
}

/**
 * Print a table
 * @param {Array<string>} headers 
 * @param {Array<Array>} rows 
 */
function table(headers, rows) {
    const colWidth = Math.floor((WIDTH - 4) / headers.length);

    // Header
    let headerRow = headers.map(h => h.substring(0, colWidth - 1).padEnd(colWidth - 1)).join('│');
    console.log(`${c.cyan}┌${'─'.repeat(WIDTH - 2)}┐${c.reset}`);
    console.log(`${c.cyan}│${c.reset}${c.bold} ${headerRow}${c.reset}${c.cyan}│${c.reset}`);
    console.log(`${c.cyan}├${'─'.repeat(WIDTH - 2)}┤${c.reset}`);

    // Rows
    rows.forEach(row => {
        let rowStr = row.map((cell, i) => {
            const str = String(cell || '').substring(0, colWidth - 1);
            return str.padEnd(colWidth - 1);
        }).join('│');
        console.log(`${c.cyan}│${c.reset} ${rowStr}${c.cyan}│${c.reset}`);
    });

    console.log(`${c.cyan}└${'─'.repeat(WIDTH - 2)}┘${c.reset}`);
}

/**
 * Progress bar
 * @param {number} current 
 * @param {number} total 
 * @param {number} width 
 * @returns {string}
 */
function progressBar(current, total, width = 20) {
    const pct = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * width);
    const empty = width - filled;
    return `${c.green}${'█'.repeat(filled)}${c.dim}${'░'.repeat(empty)}${c.reset} ${pct}%`;
}

/**
 * Spinner for async operations
 * @returns {{start: Function, stop: Function}}
 */
function spinner(message) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    let interval;

    return {
        start: () => {
            interval = setInterval(() => {
                process.stdout.write(`\r${c.cyan}${frames[i]}${c.reset} ${message}`);
                i = (i + 1) % frames.length;
            }, 80);
        },
        stop: (finalMsg) => {
            clearInterval(interval);
            process.stdout.write(`\r${c.green}✓${c.reset} ${finalMsg || message}\n`);
        }
    };
}

module.exports = {
    box,
    simpleBox,
    question,
    questionPassword,
    pause,
    clear,
    line,
    center,
    table,
    progressBar,
    spinner,
    stripAnsi,
    WIDTH
};