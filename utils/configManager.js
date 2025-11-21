const fs = require('fs');
const path = require('path');
const readline = require('readline-sync');
const c = require('./colors');
const logger = require('./logger');

const ROOT_DIR = path.join(__dirname, '..');
const ACCOUNTS_PATH = path.join(ROOT_DIR, 'config', 'accounts.json');
const SETTINGS_PATH = path.join(ROOT_DIR, 'config', 'settings.json');

const DEFAULT_SETTINGS = {
    autoReconnect: true,
    debug: false,
    logToFile: true,
    startupDelay: 2000,
    maxReconnectAttempts: 5,
    reconnectDelay: 30000
};

class ConfigManager {
    constructor() {
        this.ensureConfigDir();
    }

    ensureConfigDir() {
        const configDir = path.join(ROOT_DIR, 'config');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
    }

    loadAccounts() {
        try {
            if (fs.existsSync(ACCOUNTS_PATH)) {
                const data = fs.readFileSync(ACCOUNTS_PATH, 'utf8');
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            }
            return [];
        } catch (err) {
            logger.error(`Failed to load accounts: ${err.message}`);
            return [];
        }
    }

    saveAccounts(accounts) {
        try {
            this.ensureConfigDir();
            fs.writeFileSync(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2));
            return true;
        } catch (err) {
            logger.error(`Failed to save accounts: ${err.message}`);
            return false;
        }
    }

    saveAccount(account) {
        const accounts = this.loadAccounts();
        const existingIndex = accounts.findIndex(a => a.username === account.username);
        
        if (existingIndex >= 0) {
            accounts[existingIndex] = account;
        } else {
            accounts.push(account);
        }
        
        return this.saveAccounts(accounts);
    }

    addAccount(callback) {
        console.clear();
        console.log(`\n${c.cyan}+========================================+${c.reset}`);
        console.log(`${c.cyan}|${c.reset}         ${c.bold}ADD NEW ACCOUNT${c.reset}               ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}+========================================+${c.reset}\n`);
        
        // Username - required
        let username = '';
        while (!username) {
            username = readline.question(`${c.cyan}Username: ${c.reset}`).trim();
            if (!username) {
                console.log(`${c.red}  ! Username cannot be empty${c.reset}`);
            }
        }
        
        // Check if exists
        const accounts = this.loadAccounts();
        if (accounts.find(a => a.username.toLowerCase() === username.toLowerCase())) {
            console.log(`\n${c.red}Account "${username}" already exists!${c.reset}`);
            readline.question(`\n${c.dim}Press Enter to go back...${c.reset}`);
            if (callback) callback();
            return null;
        }
        
        // Password - required
        let password = '';
        while (!password) {
            password = readline.question(`${c.cyan}Password: ${c.reset}`, { hideEchoBack: true });
            if (!password) {
                console.log(`${c.red}  ! Password cannot be empty${c.reset}`);
            }
        }
        
        // 2FA
        const sharedSecret = readline.question(`${c.cyan}Shared Secret (2FA, optional): ${c.reset}`).trim();
        
        // Games - required at least one
        console.log(`\n${c.yellow}Enter game IDs (comma separated, e.g., 730,440,570)${c.reset}`);
        console.log(`${c.dim}Use Game Database [4] in main menu to find IDs${c.reset}`);
        
        let games = [];
        while (games.length === 0) {
            const gamesInput = readline.question(`${c.cyan}Games: ${c.reset}`).trim();
            games = gamesInput.split(',')
                .map(g => parseInt(g.trim()))
                .filter(g => !isNaN(g) && g > 0);
            if (games.length === 0) {
                console.log(`${c.red}  ! Enter at least one valid game ID${c.reset}`);
            }
        }
        
        // Optional fields
        const customStatus = readline.question(`${c.cyan}Custom Status (optional): ${c.reset}`).trim();
        const replyMessage = readline.question(`${c.cyan}Auto-reply Message (optional): ${c.reset}`).trim();
        
        const account = {
            username,
            password,
            sharedSecret: sharedSecret || '',
            enableStatus: true,
            gamesAndStatus: customStatus ? [customStatus, ...games] : games,
            replyMessage: replyMessage || '',
            receiveMessages: true,
            saveMessages: true,
            createdAt: new Date().toISOString()
        };
        
        if (this.saveAccount(account)) {
            logger.success(`Account "${username}" added successfully!`);
        }
        
        readline.question(`\n${c.dim}Press Enter to continue...${c.reset}`);
        if (callback) callback();
        return account;
    }

    editAccount(accounts, callback) {
        console.clear();
        console.log(`\n${c.cyan}+========================================+${c.reset}`);
        console.log(`${c.cyan}|${c.reset}           ${c.bold}EDIT ACCOUNT${c.reset}                 ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}+========================================+${c.reset}\n`);
        
        if (accounts.length === 0) {
            console.log(`${c.yellow}No accounts to edit.${c.reset}`);
            readline.question(`\n${c.dim}Press Enter to go back...${c.reset}`);
            if (callback) callback();
            return;
        }
        
        accounts.forEach((acc, i) => {
            console.log(`  ${c.yellow}[${i + 1}]${c.reset} ${acc.username}`);
        });
        
        console.log(`\n  ${c.dim}[0] Cancel${c.reset}\n`);
        
        const choice = readline.question(`${c.cyan}Select account: ${c.reset}`).trim();
        const num = parseInt(choice);
        
        if (choice === '0' || isNaN(num) || num < 1 || num > accounts.length) {
            if (callback) callback();
            return;
        }
        
        const account = accounts[num - 1];
        
        console.log(`\n${c.cyan}Editing: ${c.yellow}${account.username}${c.reset}`);
        console.log(`${c.dim}Press Enter to keep current value${c.reset}\n`);
        
        // Password
        const newPassword = readline.question(`${c.cyan}New Password [Enter to skip]: ${c.reset}`, { hideEchoBack: true });
        if (newPassword) account.password = newPassword;
        
        // Secret
        const currentSecret = account.sharedSecret ? 'configured' : 'not set';
        const newSecret = readline.question(`${c.cyan}New Shared Secret [${currentSecret}]: ${c.reset}`).trim();
        if (newSecret) account.sharedSecret = newSecret;
        
        // Games
        const currentGames = account.gamesAndStatus.filter(g => typeof g === 'number');
        console.log(`\n${c.cyan}Current games: ${c.yellow}${currentGames.join(', ')}${c.reset}`);
        const newGames = readline.question(`${c.cyan}New games (comma separated): ${c.reset}`).trim();
        if (newGames) {
            const games = newGames.split(',').map(g => parseInt(g.trim())).filter(g => !isNaN(g) && g > 0);
            if (games.length > 0) {
                const status = account.gamesAndStatus.find(g => typeof g === 'string');
                account.gamesAndStatus = status ? [status, ...games] : games;
            }
        }
        
        // Status
        const currentStatus = account.gamesAndStatus.find(g => typeof g === 'string') || 'none';
        const newStatus = readline.question(`${c.cyan}New custom status [${currentStatus}]: ${c.reset}`).trim();
        if (newStatus) {
            const games = account.gamesAndStatus.filter(g => typeof g === 'number');
            account.gamesAndStatus = [newStatus, ...games];
        }
        
        // Reply
        const newReply = readline.question(`${c.cyan}New auto-reply message: ${c.reset}`).trim();
        if (newReply) account.replyMessage = newReply;
        
        account.updatedAt = new Date().toISOString();
        
        if (this.saveAccounts(accounts)) {
            logger.success('Account updated successfully!');
        }
        
        readline.question(`\n${c.dim}Press Enter to continue...${c.reset}`);
        if (callback) callback();
    }

    removeAccount(accounts, callback) {
        console.clear();
        console.log(`\n${c.cyan}+========================================+${c.reset}`);
        console.log(`${c.cyan}|${c.reset}          ${c.bold}REMOVE ACCOUNT${c.reset}                ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}+========================================+${c.reset}\n`);
        
        if (accounts.length === 0) {
            console.log(`${c.yellow}No accounts to remove.${c.reset}`);
            readline.question(`\n${c.dim}Press Enter to go back...${c.reset}`);
            if (callback) callback();
            return;
        }
        
        accounts.forEach((acc, i) => {
            console.log(`  ${c.yellow}[${i + 1}]${c.reset} ${acc.username}`);
        });
        
        console.log(`\n  ${c.dim}[0] Cancel${c.reset}\n`);
        
        const choice = readline.question(`${c.cyan}Select account to remove: ${c.reset}`).trim();
        const num = parseInt(choice);
        
        if (choice === '0' || isNaN(num) || num < 1 || num > accounts.length) {
            if (callback) callback();
            return;
        }
        
        const account = accounts[num - 1];
        console.log(`\n${c.red}WARNING: This will permanently delete "${account.username}"${c.reset}`);
        const confirm = readline.question(`${c.red}Type "yes" to confirm: ${c.reset}`).trim().toLowerCase();
        
        if (confirm === 'yes') {
            accounts.splice(num - 1, 1);
            if (this.saveAccounts(accounts)) {
                logger.success('Account removed successfully!');
            }
        } else {
            logger.info('Cancelled');
        }
        
        readline.question(`\n${c.dim}Press Enter to continue...${c.reset}`);
        if (callback) callback();
    }

    exportAccounts(callback) {
        console.clear();
        console.log(`\n${c.cyan}+========================================+${c.reset}`);
        console.log(`${c.cyan}|${c.reset}          ${c.bold}EXPORT ACCOUNTS${c.reset}               ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}+========================================+${c.reset}\n`);
        
        const accounts = this.loadAccounts();
        
        if (accounts.length === 0) {
            console.log(`${c.yellow}No accounts to export.${c.reset}`);
            readline.question(`\n${c.dim}Press Enter to go back...${c.reset}`);
            if (callback) callback();
            return;
        }
        
        console.log(`${c.dim}This will export account data (without passwords) to a file.${c.reset}\n`);
        
        let filename = readline.question(`${c.cyan}Filename (default: export.json): ${c.reset}`).trim();
        if (!filename) filename = 'export.json';
        if (!filename.endsWith('.json')) filename += '.json';
        
        const exportData = accounts.map(acc => ({
            username: acc.username,
            games: acc.gamesAndStatus.filter(g => typeof g === 'number'),
            status: acc.gamesAndStatus.find(g => typeof g === 'string') || '',
            has2FA: !!acc.sharedSecret,
            replyMessage: acc.replyMessage || ''
        }));
        
        try {
            const exportPath = path.join(ROOT_DIR, filename);
            fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
            logger.success(`Exported ${accounts.length} accounts to ${filename}`);
            console.log(`${c.dim}Location: ${exportPath}${c.reset}`);
        } catch (err) {
            logger.error(`Export failed: ${err.message}`);
        }
        
        readline.question(`\n${c.dim}Press Enter to continue...${c.reset}`);
        if (callback) callback();
    }

    loadSettings() {
        try {
            if (fs.existsSync(SETTINGS_PATH)) {
                const data = fs.readFileSync(SETTINGS_PATH, 'utf8');
                return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
            }
        } catch (err) {}
        return { ...DEFAULT_SETTINGS };
    }

    saveSettings(settings) {
        try {
            this.ensureConfigDir();
            fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
            return true;
        } catch (err) {
            logger.error(`Failed to save settings: ${err.message}`);
            return false;
        }
    }
}

module.exports = new ConfigManager();