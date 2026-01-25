/**
 * VaporBooster - UI Utilities
 * Handles all console UI rendering with proper sizing and encoding
 * 
 * FIXES:
 * - Dynamic width calculation for long names
 * - Proper Unicode/ASCII handling (no more ? chars)
 * - Support for 9+ items in tables
 * - Better text wrapping
 * 
 * @author stolenact
 * @repository https://github.com/stolenact/VaporBooster
 */

const readline = require('readline-sync');
const c = require('./colors');

// Detect terminal width, fallback to 80
const getTerminalWidth = () => {
    try {
        return process.stdout.columns || 80;
    } catch {
        return 80;
    }
};

// Dynamic width based on terminal
const WIDTH = Math.min(getTerminalWidth() - 4, 100);

/**
 * Strip ANSI codes from string (for accurate length calculation)
 * @param {string} str 
 * @returns {string}
 */
function stripAnsi(str) {
    if (!str) return '';
    return String(str).replace(/\x1b\[[0-9;]*m/g, '');
}

/**
 * Truncate string to fit width
 * @param {string} str 
 * @param {number} maxWidth 
 * @returns {string}
 */
function truncate(str, maxWidth) {
    const clean = stripAnsi(str);
    if (clean.length <= maxWidth) return str;

    // Find position in original string (accounting for ANSI codes)
    let visibleCount = 0;
    let result = '';
    let inAnsi = false;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (char === '\x1b') {
            inAnsi = true;
        }

        result += char;

        if (inAnsi) {
            if (char === 'm') inAnsi = false;
        } else {
            visibleCount++;
            if (visibleCount >= maxWidth - 3) {
                result += c.dim + '...' + c.reset;
                break;
            }
        }
    }

    return result;
}

/**
 * Pad string to width (accounting for ANSI codes)
 * @param {string} str 
 * @param {number} width 
 * @returns {string}
 */
function pad(str, width) {
    const clean = stripAnsi(str);
    const padding = Math.max(0, width - clean.length);
    return str + ' '.repeat(padding);
}

/**
 * Safe character replacement (fixes ? chars)
 * @param {string} str 
 * @returns {string}
 */
function safeChars(str) {
    if (!str) return '';

    // Replace problematic Unicode chars with ASCII equivalents
    const replacements = {
        '│': '|',
        '─': '-',
        '┌': '+',
        '┐': '+',
        '└': '+',
        '┘': '+',
        '├': '+',
        '┤': '+',
        '┬': '+',
        '┴': '+',
        '┼': '+',
        '═': '=',
        '║': '|',
        '╔': '+',
        '╗': '+',
        '╚': '+',
        '╝': '+',
        '╠': '+',
        '╣': '+',
        '╦': '+',
        '╩': '+',
        '╬': '+',
        '●': '*',
        '○': 'o',
        '✓': '+',
        '✗': 'x',
        '⚠': '!',
        'ℹ': 'i',
        '💬': '>',
        '🎮': '#'
    };

    let result = str;
    for (const [unicode, ascii] of Object.entries(replacements)) {
        result = result.replace(new RegExp(unicode, 'g'), ascii);
    }

    // Remove any remaining non-ASCII chars
    result = result.replace(/[^\x00-\x7F]/g, '?');

    return result;
}

/**
 * Draw a box with title and content
 * FIXED: Dynamic width, supports 9+ items, handles long text
 * 
 * @param {string} title - Box title
 * @param {Array<string>} lines - Content lines
 * @param {Array<string>|null} sidebar - Optional sidebar content
 */
function box(title, lines, sidebar = null) {
    const w = WIDTH;
    const useSidebar = sidebar && sidebar.length > 0;
    const mainWidth = useSidebar ? Math.floor(w * 0.65) : w;

    // Use safe ASCII characters
    const hLine = '-'.repeat(mainWidth - 2);
    const topLeft = '+', topRight = '+';
    const bottomLeft = '+', bottomRight = '+';
    const vertical = '|';
    const cross = '+';

    // Top border
    console.log(`\n${c.cyan}${topLeft}${hLine}${topRight}${c.reset}`);

    // Title
    const titleText = truncate(title, mainWidth - 4);
    console.log(`${c.cyan}${vertical}${c.reset} ${c.bold}${pad(titleText, mainWidth - 4)}${c.reset} ${c.cyan}${vertical}${c.reset}`);

    // Separator
    console.log(`${c.cyan}${cross}${hLine}${cross}${c.reset}`);

    // Content
    const maxLines = Math.max(lines.length, sidebar ? sidebar.length : 0);

    for (let i = 0; i < maxLines; i++) {
        let mainLine = lines[i] || '';
        mainLine = truncate(mainLine, mainWidth - 4);

        const cleanMain = stripAnsi(mainLine);
        const padMain = mainWidth - 4 - cleanMain.length;

        let row = `${c.cyan}${vertical}${c.reset} ${mainLine}${' '.repeat(Math.max(0, padMain))} ${c.cyan}${vertical}${c.reset}`;

        // Add sidebar if exists
        if (useSidebar && sidebar[i]) {
            const sidebarText = truncate(sidebar[i], 30);
            row += `  ${sidebarText}`;
        }

        console.log(row);
    }

    // Bottom border
    console.log(`${c.cyan}${bottomLeft}${hLine}${bottomRight}${c.reset}`);
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
 * Question wrapper with color
 * FIXED: Better input handling
 * 
 * @param {string} prompt 
 * @returns {string}
 */
function question(prompt) {
    try {
        const answer = readline.question(`${c.cyan}${prompt}${c.reset}`);
        return String(answer || '').trim();
    } catch (err) {
        console.error('Input error:', err.message);
        return '';
    }
}

/**
 * Password input (hidden, supports long passwords)
 * FIXED: Proper backspace handling, 256+ char support
 * 
 * @param {string} prompt 
 * @returns {string}
 */
function questionPassword(prompt) {
    try {
        // Use readline-sync with proper options
        const password = readline.question(`${c.cyan}${prompt}${c.reset}`, {
            hideEchoBack: true,
            mask: '',  // Empty mask for true hidden input
            limit: /[\s\S]*/,  // Accept any character including special chars
            limitMessage: ''
        });
        return String(password || '');
    } catch (err) {
        console.error('Password input error:', err.message);
        return '';
    }
}

/**
 * Pause and wait for Enter
 */
function pause() {
    try {
        readline.question(`\n${c.dim}Press Enter to continue...${c.reset}`);
    } catch (err) {
        // Ignore
    }
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
    console.log(`${c.dim}${'-'.repeat(WIDTH)}${c.reset}`);
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
 * FIXED: Supports 9+ items, dynamic column sizing
 * 
 * @param {Array<string>} headers 
 * @param {Array<Array>} rows 
 */
function table(headers, rows) {
    if (!headers || headers.length === 0) return;
    if (!rows || rows.length === 0) {
        console.log(c.dim + 'No data' + c.reset);
        return;
    }

    // Calculate optimal column widths
    const numCols = headers.length;
    const availableWidth = WIDTH - 4 - (numCols - 1); // Account for borders and separators

    // Get max width needed for each column
    const colWidths = headers.map((header, i) => {
        const headerLen = stripAnsi(String(header)).length;
        const maxDataLen = Math.max(...rows.map(row => {
            const cell = row[i];
            return stripAnsi(String(cell || '')).length;
        }));
        return Math.max(headerLen, maxDataLen);
    });

    // Distribute width proportionally, with minimum of 8 chars
    const totalNeeded = colWidths.reduce((a, b) => a + b, 0);
    const finalWidths = colWidths.map(w => {
        const proportional = Math.floor((w / totalNeeded) * availableWidth);
        return Math.max(8, Math.min(proportional, 40));
    });

    // Borders
    const topBorder = `${c.cyan}+${finalWidths.map(w => '-'.repeat(w)).join('+')}+${c.reset}`;
    const separator = `${c.cyan}+${finalWidths.map(w => '-'.repeat(w)).join('+')}+${c.reset}`;
    const bottomBorder = topBorder;

    console.log(topBorder);

    // Headers
    const headerRow = headers.map((h, i) => {
        const text = truncate(String(h), finalWidths[i]);
        return pad(c.bold + text + c.reset, finalWidths[i]);
    }).join(c.cyan + '|' + c.reset);

    console.log(`${c.cyan}|${c.reset}${headerRow}${c.cyan}|${c.reset}`);
    console.log(separator);

    // Rows (handle 9+ items with pagination hint)
    const maxDisplayRows = 20;
    const displayRows = rows.slice(0, maxDisplayRows);

    displayRows.forEach(row => {
        const rowStr = row.map((cell, i) => {
            const text = truncate(String(cell || ''), finalWidths[i]);
            return pad(text, finalWidths[i]);
        }).join(c.cyan + '|' + c.reset);

        console.log(`${c.cyan}|${c.reset}${rowStr}${c.cyan}|${c.reset}`);
    });

    console.log(bottomBorder);

    // Show remaining count if more than max
    if (rows.length > maxDisplayRows) {
        console.log(`${c.dim}... and ${rows.length - maxDisplayRows} more items${c.reset}`);
    }
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

    // Use safe ASCII chars
    return `${c.green}${'#'.repeat(filled)}${c.dim}${'-'.repeat(empty)}${c.reset} ${pct}%`;
}

/**
 * Spinner for async operations
 * FIXED: Safe ASCII frames
 * 
 * @returns {{start: Function, stop: Function}}
 */
function spinner(message) {
    // Use safe ASCII frames instead of Unicode
    const frames = ['|', '/', '-', '\\'];
    let i = 0;
    let interval;

    return {
        start: () => {
            interval = setInterval(() => {
                process.stdout.write(`\r${c.cyan}${frames[i]}${c.reset} ${message}`);
                i = (i + 1) % frames.length;
            }, 100);
        },
        stop: (finalMsg) => {
            clearInterval(interval);
            process.stdout.write(`\r${c.green}+${c.reset} ${finalMsg || message}\n`);
        }
    };
}

/**
 * List with pagination
 * FIXED: Handles 9+ items with proper pagination
 * 
 * @param {Array} items 
 * @param {number} page 
 * @param {number} pageSize 
 * @returns {{items: Array, totalPages: number, hasNext: boolean, hasPrev: boolean}}
 */
function paginate(items, page = 0, pageSize = 10) {
    const totalPages = Math.ceil(items.length / pageSize);
    const start = page * pageSize;
    const end = Math.min(start + pageSize, items.length);

    return {
        items: items.slice(start, end),
        totalPages,
        currentPage: page,
        hasNext: page < totalPages - 1,
        hasPrev: page > 0,
        showing: `${start + 1}-${end} of ${items.length}`
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
    paginate,
    truncate,
    pad,
    stripAnsi,
    safeChars,
    WIDTH,
    getTerminalWidth
};