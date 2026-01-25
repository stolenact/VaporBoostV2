/**
 * VaporBooster - Input Validator
 * Validates and sanitizes all user inputs
 * 
 * @author VaporBooster Team
 */

/**
 * Prevent prototype pollution
 * @param {Object} obj 
 * @returns {Object}
 */
function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = {};
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

    for (const key in obj) {
        if (dangerousKeys.includes(key)) continue;
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        const value = obj[key];

        if (value && typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

/**
 * Sanitize string for logging (prevent log injection)
 * @param {string} str 
 * @returns {string}
 */
function sanitizeForLog(str) {
    if (typeof str !== 'string') return String(str);

    return str
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control chars
}

/**
 * Validate username
 * @param {string} username 
 * @returns {boolean}
 */
function isValidUsername(username) {
    if (!username || typeof username !== 'string') return false;
    if (username.length < 2 || username.length > 64) return false;
    // Allow alphanumeric, underscore, dash
    return /^[a-zA-Z0-9_-]+$/.test(username);
}

/**
 * Validate password
 * @param {string} password 
 * @returns {boolean}
 */
function isValidPassword(password) {
    if (!password || typeof password !== 'string') return false;
    if (password.length < 1 || password.length > 256) return false;
    return true;
}

/**
 * Validate game ID
 * @param {number} gameId 
 * @returns {boolean}
 */
function isValidGameId(gameId) {
    const num = parseInt(gameId);
    return !isNaN(num) && num > 0 && num < 9999999;
}

/**
 * Validate account object
 * @param {Object} account 
 * @returns {{valid: boolean, errors: Array<string>}}
 */
function validateAccount(account) {
    const errors = [];

    if (!account || typeof account !== 'object') {
        return { valid: false, errors: ['Invalid account object'] };
    }

    // Username
    if (!isValidUsername(account.username)) {
        errors.push('Invalid username (2-64 chars, alphanumeric only)');
    }

    // Password
    if (!isValidPassword(account.password)) {
        errors.push('Invalid password (1-256 chars)');
    }

    // Games
    if (account.gamesAndStatus) {
        if (!Array.isArray(account.gamesAndStatus)) {
            errors.push('gamesAndStatus must be an array');
        } else {
            const games = account.gamesAndStatus.filter(g => typeof g === 'number');
            if (games.length === 0) {
                errors.push('At least one game ID required');
            }

            for (const game of games) {
                if (!isValidGameId(game)) {
                    errors.push(`Invalid game ID: ${game}`);
                }
            }
        }
    }

    // Shared secret (if provided)
    if (account.sharedSecret) {
        if (typeof account.sharedSecret !== 'string') {
            errors.push('Shared secret must be a string');
        } else if (account.sharedSecret.length > 0 && account.sharedSecret.length < 10) {
            errors.push('Shared secret too short');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate settings object
 * @param {Object} settings 
 * @returns {{valid: boolean, errors: Array<string>}}
 */
function validateSettings(settings) {
    const errors = [];

    if (!settings || typeof settings !== 'object') {
        return { valid: false, errors: ['Invalid settings object'] };
    }

    // Validate numeric ranges
    if (settings.startupDelay !== undefined) {
        const delay = parseInt(settings.startupDelay);
        if (isNaN(delay) || delay < 500 || delay > 30000) {
            errors.push('startupDelay must be between 500-30000ms');
        }
    }

    if (settings.maxReconnectAttempts !== undefined) {
        const attempts = parseInt(settings.maxReconnectAttempts);
        if (isNaN(attempts) || attempts < 0 || attempts > 50) {
            errors.push('maxReconnectAttempts must be between 0-50');
        }
    }

    // Validate booleans
    const booleanFields = ['autoReconnect', 'invisibleMode', 'saveMessages', 'debug'];
    for (const field of booleanFields) {
        if (settings[field] !== undefined && typeof settings[field] !== 'boolean') {
            errors.push(`${field} must be boolean`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Sanitize filename
 * @param {string} filename 
 * @returns {string}
 */
function sanitizeFilename(filename) {
    if (!filename) return 'unnamed';

    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .substring(0, 255);
}

/**
 * Validate file path (prevent directory traversal)
 * @param {string} filepath 
 * @param {string} baseDir 
 * @returns {boolean}
 */
function isPathSafe(filepath, baseDir) {
    const path = require('path');
    const resolved = path.resolve(baseDir, filepath);
    const base = path.resolve(baseDir);

    return resolved.startsWith(base);
}

/**
 * Validate JSON safely
 * @param {string} jsonString 
 * @returns {Object|null}
 */
function parseJSONSafe(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        return sanitizeObject(parsed);
    } catch (err) {
        return null;
    }
}

/**
 * Validate environment variable
 * @param {string} name 
 * @param {string} defaultValue 
 * @returns {string}
 */
function getEnvSafe(name, defaultValue = '') {
    const value = process.env[name];
    if (!value) return defaultValue;

    // Sanitize
    return String(value).trim();
}

/**
 * Validate integer from env
 * @param {string} name 
 * @param {number} defaultValue 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
function getEnvInt(name, defaultValue, min, max) {
    const value = process.env[name];
    if (!value) return defaultValue;

    const num = parseInt(value);
    if (isNaN(num)) return defaultValue;

    return Math.max(min, Math.min(max, num));
}

/**
 * Validate boolean from env
 * @param {string} name 
 * @param {boolean} defaultValue 
 * @returns {boolean}
 */
function getEnvBool(name, defaultValue) {
    const value = process.env[name];
    if (!value) return defaultValue;

    return value.toLowerCase() === 'true' || value === '1';
}

module.exports = {
    sanitizeObject,
    sanitizeForLog,
    sanitizeFilename,
    isValidUsername,
    isValidPassword,
    isValidGameId,
    validateAccount,
    validateSettings,
    isPathSafe,
    parseJSONSafe,
    getEnvSafe,
    getEnvInt,
    getEnvBool
};