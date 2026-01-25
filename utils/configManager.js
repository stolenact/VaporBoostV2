/**
 * VaporBooster - Configuration Manager
 * Handles accounts, settings, import/export
 * 
 * @author VaporBooster Team
 */

const fs = require('fs');
const path = require('path');
const c = require('./colors');
const logger = require('./logger');
const ui = require('./ui');

const ROOT = path.join(__dirname, '..');
const ACCOUNTS_FILE = path.join(ROOT, 'config', 'accounts.json');
const SETTINGS_FILE = path.join(ROOT, 'config', 'settings.json');

/** Default application settings */
const DEFAULT_SETTINGS = {
    autoReconnect: true,
    invisibleMode: false,
    saveMessages: true,
    debug: false,
    startupDelay: 2000,
    maxReconnectAttempts: 5
};

class ConfigManager {
    constructor() {
        this.ensureDirs();
    }

    /**
     * Ensure config directory exists
     */
    ensureDirs() {
        const configDir = path.join(ROOT, 'config');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
    }

    /**
     * Load all accounts
     * @returns {Array<Object>}
     */
    loadAccounts() {
        try {
            if (fs.existsSync(ACCOUNTS_FILE)) {
                const data = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
                const accounts = JSON.parse(data);
                return Array.isArray(accounts) ? accounts : [];
            }
        } catch (err) {
            logger.error(`Failed to load accounts: ${err.message}`);
        }
        return [];
    }

    /**
     * Save all accounts
     * @param {Array<Object>} accounts 
     * @returns {boolean}
     */
    saveAccounts(accounts) {
        try {
            this.ensureDirs();
            fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
            return true;
        } catch (err) {
            logger.error(`Failed to save accounts: ${err.message}`);
            return false;
        }
    }

    /**
     * Save or update a single account
     * @param {Object} account 
     * @returns {boolean}
     */
    saveAccount(account) {
        const accounts = this.loadAccounts();
        const idx = accounts.findIndex(a =>
            a.username.toLowerCase() === account.username.toLowerCase()
        );

        if (idx >= 0) {
            accounts[idx] = { ...accounts[idx], ...account };
        } else {
            accounts.push(account);
        }

        return this.saveAccounts(accounts);
    }

    /**
     * Check if account exists
     * @param {string} username 
     * @returns {boolean}
     */
    accountExists(username) {
        const accounts = this.loadAccounts();
        return accounts.some(a =>
            a.username.toLowerCase() === username.toLowerCase()
        );
    }

    /**
     * Load application settings
     * @returns {Object}
     */
    loadSettings() {
        try {
            if (fs.existsSync(SETTINGS_FILE)) {
                const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
                return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
            }
        } catch (err) {
            logger.error(`Failed to load settings: ${err.message}`);
        }
        return { ...DEFAULT_SETTINGS };
    }

    /**
     * Save application settings
     * @param {Object} settings 
     * @returns {boolean}
     */
    saveSettings(settings) {
        try {
            this.ensureDirs();
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
            return true;
        } catch (err) {
            logger.error(`Failed to save settings: ${err.message}`);
            return false;
        }
    }

    /**
     * Export accounts to file (without passwords for safety)
     * @param {Function} callback 
     */
    exportAccounts(callback) {
        console.clear();

        const accounts = this.loadAccounts();

        if (accounts.length === 0) {
            logger.warn('No accounts to export');
            ui.pause();
            if (callback) callback();
            return;
        }

        ui.box('EXPORT ACCOUNTS', [
            '',
            `${c.dim}Export ${accounts.length} account(s) to JSON file.${c.reset}`,
            `${c.dim}Note: Passwords are NOT exported for security.${c.reset}`,
            ''
        ]);

        let filename = ui.question('Filename (default: backup.json): ');
        if (!filename) filename = 'backup.json';
        if (!filename.endsWith('.json')) filename += '.json';

        // Export data (no passwords)
        const exportData = {
            exported: new Date().toISOString(),
            version: '3.0.0',
            accounts: accounts.map(a => ({
                username: a.username,
                has2FA: !!a.sharedSecret,
                invisible: a.invisible || false,
                games: (a.gamesAndStatus || []).filter(g => typeof g === 'number'),
                status: (a.gamesAndStatus || []).find(g => typeof g === 'string') || null,
                replyMessage: a.replyMessage || null
            }))
        };

        try {
            const filepath = path.join(ROOT, filename);
            fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
            logger.success(`Exported to: ${filepath}`);
        } catch (err) {
            logger.error(`Export failed: ${err.message}`);
        }

        ui.pause();
        if (callback) callback();
    }

    /**
     * Import accounts from file
     * @param {string} filepath 
     * @returns {Array<Object>}
     */
    importAccounts(filepath) {
        try {
            if (!fs.existsSync(filepath)) {
                logger.error('File not found');
                return [];
            }

            const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            logger.info(`Found ${data.accounts?.length || 0} accounts in backup`);
            return data.accounts || [];
        } catch (err) {
            logger.error(`Import failed: ${err.message}`);
            return [];
        }
    }
}

module.exports = new ConfigManager();