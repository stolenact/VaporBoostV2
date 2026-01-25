/**
 * VaporBooster - ANSI Color Utilities
 * Terminal colors and text styling
 * 
 * @author stolenact
 * @repository https://github.com/stolenact/VaporBooster
 */

module.exports = {
    // Reset all styles
    reset: '\x1b[0m',

    // Text styles
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',

    // Standard colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',

    // Bright colors
    brightRed: '\x1b[91m',
    brightGreen: '\x1b[92m',
    brightYellow: '\x1b[93m',
    brightBlue: '\x1b[94m',
    brightMagenta: '\x1b[95m',
    brightCyan: '\x1b[96m',
    brightWhite: '\x1b[97m',

    // Background colors
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',

    /**
     * RGB foreground color
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     */
    rgb: (r, g, b) => `\x1b[38;2;${r};${g};${b}m`,

    /**
     * RGB background color
     */
    bgRgb: (r, g, b) => `\x1b[48;2;${r};${g};${b}m`
};