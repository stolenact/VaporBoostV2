// ANSI Color Codes for Terminal
module.exports = {
    // Reset
    reset: '\x1b[0m',
    
    // Styles
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',
    blink: '\x1b[5m',
    inverse: '\x1b[7m',
    hidden: '\x1b[8m',
    strikethrough: '\x1b[9m',
    
    // Foreground Colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    
    // Bright Foreground Colors
    brightRed: '\x1b[91m',
    brightGreen: '\x1b[92m',
    brightYellow: '\x1b[93m',
    brightBlue: '\x1b[94m',
    brightMagenta: '\x1b[95m',
    brightCyan: '\x1b[96m',
    brightWhite: '\x1b[97m',
    
    // Background Colors
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
    
    // Bright Background Colors
    bgBrightRed: '\x1b[101m',
    bgBrightGreen: '\x1b[102m',
    bgBrightYellow: '\x1b[103m',
    bgBrightBlue: '\x1b[104m',
    bgBrightMagenta: '\x1b[105m',
    bgBrightCyan: '\x1b[106m',
    bgBrightWhite: '\x1b[107m',
    
    // Utility functions
    rgb: (r, g, b) => `\x1b[38;2;${r};${g};${b}m`,
    bgRgb: (r, g, b) => `\x1b[48;2;${r};${g};${b}m`,
    
    // Gradient effect for text
    gradient: (text, startColor, endColor) => {
        const colors = [
            [0, 255, 255],   // Cyan
            [0, 200, 255],
            [0, 150, 255],
            [0, 100, 255],
            [50, 50, 255],   // Blue
        ];
        
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const colorIndex = Math.floor((i / text.length) * (colors.length - 1));
            const [r, g, b] = colors[colorIndex];
            result += `\x1b[38;2;${r};${g};${b}m${text[i]}`;
        }
        return result + '\x1b[0m';
    },
    
    // Rainbow effect
    rainbow: (text) => {
        const colors = [
            [255, 0, 0],     // Red
            [255, 127, 0],   // Orange
            [255, 255, 0],   // Yellow
            [0, 255, 0],     // Green
            [0, 0, 255],     // Blue
            [75, 0, 130],    // Indigo
            [148, 0, 211],   // Violet
        ];
        
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const [r, g, b] = colors[i % colors.length];
            result += `\x1b[38;2;${r};${g};${b}m${text[i]}`;
        }
        return result + '\x1b[0m';
    }
};