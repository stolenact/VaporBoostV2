<<<<<<< HEAD
=======
/**
 * VaporBooster v3.0 - Advanced Steam Hour Booster
 * Main application entry point
 * 
 * Features:
 * - Multi-account support with 2FA/QR login
 * - Invisible boosting mode
 * - Real-time statistics
 * - PM2 support for production
 * 
 * @author VaporBooster Team
 * @license MIT
 */

>>>>>>> 894d41f (Updated V3 pre-release)
const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const { Timer } = require('easytimer.js');
const readline = require('readline-sync');
const fs = require('fs');
const path = require('path');

<<<<<<< HEAD
=======
// Utils
>>>>>>> 894d41f (Updated V3 pre-release)
const c = require('../utils/colors');
const logger = require('../utils/logger');
const stats = require('../utils/stats');
const banner = require('../utils/banner');
const config = require('../utils/configManager');
<<<<<<< HEAD
const gameDB = require('../utils/gameDatabase');

class VaporBooster {
    constructor() {
        this.clients = new Map();
        this.timers = new Map();
=======
const ui = require('../utils/ui');

// PM2 Support - Graceful shutdown
const isPM2 = 'PM2_HOME' in process.env || 'PM2_JSON_PROCESSING' in process.env;

class VaporBooster {
    constructor() {
        /** @type {Map<string, {client: SteamUser, account: Object, timer: Timer, games: Array}>} */
        this.clients = new Map();
        
        /** @type {Object} Session statistics */
>>>>>>> 894d41f (Updated V3 pre-release)
        this.sessionStats = {
            startTime: Date.now(),
            totalHoursGained: 0,
            messagesReceived: 0,
<<<<<<< HEAD
            reconnections: 0
        };
    }

=======
            reconnections: 0,
            errors: 0
        };
        
        /** @type {boolean} Is currently boosting */
        this.isBoosting = false;
        
        // PM2 graceful restart
        if (isPM2) {
            process.on('message', (msg) => {
                if (msg === 'shutdown') this.gracefulExit();
            });
        }
    }

    /**
     * Initialize the application
     */
>>>>>>> 894d41f (Updated V3 pre-release)
    async init() {
        console.clear();
        banner.display();
        
        await this.checkDirectories();
        const accounts = config.loadAccounts();
        
        if (accounts.length === 0) {
<<<<<<< HEAD
            logger.warn('No accounts found in config/accounts.json');
            console.log(`\n${c.yellow}Run setup wizard to add your first account? (y/n)${c.reset}`);
            const answer = readline.question(`${c.cyan}> ${c.reset}`).toLowerCase().trim();
            if (answer === 'y' || answer === 'yes') {
                await this.setupWizard();
                return this.init();
            }
            logger.info('You can manually create config/accounts.json or run the wizard later.');
=======
            logger.warn('No accounts configured');
            console.log(`\n${c.yellow}Would you like to add an account now? (y/n)${c.reset}`);
            const answer = ui.question('> ').toLowerCase();
            if (answer === 'y' || answer === 'yes') {
                await this.addAccountWizard();
                return this.init();
            }
>>>>>>> 894d41f (Updated V3 pre-release)
            process.exit(0);
        }

        this.showMenu(accounts);
    }

<<<<<<< HEAD
    async checkDirectories() {
        const dirs = ['accounts_data', 'messages', 'logs', 'config'];
        for (const dir of dirs) {
            const dirPath = path.join(__dirname, '..', dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        }
    }

    showMenu(accounts, errorMsg = null) {
        console.clear();
        banner.display();
        
        console.log(`\n${c.cyan}+============================================================+${c.reset}`);
        console.log(`${c.cyan}|${c.reset}              ${c.bold}${c.white}VAPOR BOOSTER - MAIN MENU${c.reset}                   ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}+============================================================+${c.reset}`);
        console.log(`${c.cyan}|${c.reset}                                                            ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[1]${c.reset} Start All Accounts ${c.dim}(${accounts.length} loaded)${c.reset}                    ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[2]${c.reset} Start Single Account                                 ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[3]${c.reset} Account Manager                                      ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[4]${c.reset} Game Database Browser                                ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[5]${c.reset} Statistics Dashboard                                 ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[6]${c.reset} Settings                                             ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[7]${c.reset} Setup Wizard                                         ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}                                                            ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.red}[0]${c.reset} Exit                                                 ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}                                                            ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}+============================================================+${c.reset}`);
        
        if (errorMsg) {
            console.log(`\n${c.red}  ! ${errorMsg}${c.reset}`);
        }

        const choice = readline.question(`\n${c.cyan}Select option [0-7]: ${c.reset}`).trim();
        
        switch(choice) {
            case '1': 
                if (accounts.length === 0) {
                    this.showMenu(accounts, 'No accounts configured!');
                } else {
                    this.startAllAccounts(accounts);
                }
                break;
            case '2': this.selectAccount(accounts); break;
            case '3': this.accountManager(accounts); break;
            case '4': gameDB.browse(() => this.showMenu(config.loadAccounts())); break;
            case '5': stats.showDashboard(this.sessionStats, this.clients, () => this.showMenu(config.loadAccounts())); break;
            case '6': this.settingsMenu(); break;
            case '7': this.setupWizard().then(() => this.init()); break;
            case '0': this.gracefulExit(); break;
            default: 
                this.showMenu(accounts, 'Invalid option! Please select 0-7');
        }
    }

    async startAllAccounts(accounts) {
        console.clear();
        banner.displayMini();
        logger.info(`Starting ${accounts.length} accounts...`);
        
        for (let i = 0; i < accounts.length; i++) {
            await this.loginAccount(accounts[i], i);
            await this.sleep(2000);
        }
        
        this.showActiveStatus();
    }

    selectAccount(accounts) {
        console.clear();
        banner.displayMini();
        
        if (accounts.length === 0) {
            logger.warn('No accounts configured!');
            readline.question(`\n${c.dim}Press Enter to go back...${c.reset}`);
            return this.showMenu(accounts);
        }
        
        console.log(`\n${c.cyan}+----------------------------------+${c.reset}`);
        console.log(`${c.cyan}|${c.reset}      ${c.bold}SELECT ACCOUNT${c.reset}              ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}+----------------------------------+${c.reset}`);
        
        accounts.forEach((acc, i) => {
            const status = this.clients.has(acc.username) ? `${c.green}*${c.reset}` : `${c.dim}-${c.reset}`;
            console.log(`${c.cyan}|${c.reset}  ${status} ${c.yellow}[${i + 1}]${c.reset} ${acc.username.padEnd(20)} ${c.cyan}|${c.reset}`);
        });
        
        console.log(`${c.cyan}|${c.reset}                                  ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.dim}[0] Back to menu${c.reset}                 ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}+----------------------------------+${c.reset}`);
        
        const choice = readline.question(`\n${c.cyan}Select [0-${accounts.length}]: ${c.reset}`).trim();
=======
    /**
     * Create required directories
     */
    async checkDirectories() {
        const dirs = ['accounts_data', 'messages', 'logs', 'config'];
        for (const dir of dirs) {
            const p = path.join(__dirname, '..', dir);
            if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
        }
    }

    /**
     * Main menu display
     * @param {Array} accounts - List of configured accounts
     * @param {string|null} msg - Optional message to display
     */
    showMenu(accounts, msg = null) {
        console.clear();
        banner.displayMini();
        
        // Sidebar with active sessions
        const sidebar = this.getSidebarInfo();
        
        ui.box('MAIN MENU', [
            '',
            `${c.green}[1]${c.reset} Start All Accounts ${c.dim}(${accounts.length})${c.reset}`,
            `${c.green}[2]${c.reset} Start Single Account`,
            `${c.green}[3]${c.reset} Add New Account`,
            `${c.green}[4]${c.reset} Manage Accounts`,
            `${c.green}[5]${c.reset} View Statistics`,
            `${c.green}[6]${c.reset} Settings`,
            '',
            `${c.red}[0]${c.reset} Exit`,
            ''
        ], sidebar);
        
        if (msg) console.log(`\n${c.yellow}  ${msg}${c.reset}`);

        const choice = ui.question('Select [0-6]: ');
        
        switch(choice) {
            case '1': this.startAllAccounts(accounts); break;
            case '2': this.selectAccount(accounts); break;
            case '3': this.addAccountWizard().then(() => this.showMenu(config.loadAccounts())); break;
            case '4': this.manageAccounts(accounts); break;
            case '5': stats.showDashboard(this.sessionStats, this.clients, () => this.showMenu(config.loadAccounts())); break;
            case '6': this.settingsMenu(); break;
            case '0': this.gracefulExit(); break;
            default: this.showMenu(accounts, 'Invalid option');
        }
    }

    /**
     * Get sidebar info for active sessions
     * @returns {Array<string>} Sidebar lines
     */
    getSidebarInfo() {
        if (this.clients.size === 0) return [];
        
        const lines = [
            `${c.green}ACTIVE SESSIONS${c.reset}`,
            `${c.dim}${'?'.repeat(22)}${c.reset}`
        ];
        
        this.clients.forEach((data, name) => {
            const t = data.timer.getTimeValues();
            const time = `${t.hours}h ${t.minutes}m`;
            const games = data.games.filter(g => typeof g === 'number').length;
            const status = data.client.steamID ? c.green + '?' : c.red + '?';
            lines.push(`${status}${c.reset} ${name.substring(0, 10).padEnd(10)} ${c.dim}${time}${c.reset}`);
            lines.push(`  ${c.dim}${games} games${c.reset}`);
        });
        
        return lines;
    }

    /**
     * Start boosting all accounts
     * @param {Array} accounts 
     */
    async startAllAccounts(accounts) {
        if (accounts.length === 0) {
            return this.showMenu(accounts, 'No accounts to start');
        }
        
        console.clear();
        banner.displayMini();
        this.isBoosting = true;
        
        logger.info(`Starting ${accounts.length} account(s)...`);
        
        for (const acc of accounts) {
            await this.loginAccount(acc);
            await this.sleep(2000);
        }
        
        this.showBoostingPanel();
    }

    /**
     * Select a single account to boost
     * @param {Array} accounts 
     */
    selectAccount(accounts) {
        if (accounts.length === 0) {
            return this.showMenu(accounts, 'No accounts configured');
        }
        
        console.clear();
        banner.displayMini();
        
        const items = accounts.map((a, i) => {
            const online = this.clients.has(a.username);
            const status = online ? `${c.green}?${c.reset}` : `${c.dim}?${c.reset}`;
            return `${status} ${a.username}`;
        });
        
        ui.box('SELECT ACCOUNT', [
            '',
            ...items.map((item, i) => `${c.yellow}[${i + 1}]${c.reset} ${item}`),
            '',
            `${c.dim}[0] Back${c.reset}`,
            ''
        ]);

        const choice = ui.question(`Select [0-${accounts.length}]: `);
>>>>>>> 894d41f (Updated V3 pre-release)
        const num = parseInt(choice);
        
        if (choice === '0') return this.showMenu(accounts);
        if (isNaN(num) || num < 1 || num > accounts.length) {
<<<<<<< HEAD
            logger.warn('Invalid selection!');
            return this.selectAccount(accounts);
        }
        
        this.loginAccount(accounts[num - 1], num - 1).then(() => {
            this.showActiveStatus();
        });
    }

    async loginAccount(account, index) {
=======
            return this.selectAccount(accounts);
        }
        
        this.isBoosting = true;
        this.loginAccount(accounts[num - 1]).then(() => this.showBoostingPanel());
    }

    /**
     * Login to a Steam account
     * @param {Object} account - Account configuration
     */
    async loginAccount(account) {
>>>>>>> 894d41f (Updated V3 pre-release)
        const client = new SteamUser({
            autoRelogin: true,
            renewRefreshTokens: true,
            dataDirectory: path.join(__dirname, '..', 'accounts_data')
        });

        const timer = new Timer();
        const accName = account.username;
<<<<<<< HEAD

        logger.info(`[${accName}] Connecting...`);

        const loginDetails = {
            accountName: account.username,
            password: account.password
        };

        if (account.sharedSecret) {
            loginDetails.twoFactorCode = SteamTotp.generateAuthCode(account.sharedSecret);
            logger.debug(`[${accName}] Generated 2FA code`);
        }

        client.on('steamGuard', (domain, callback) => {
            const authType = domain ? `Email (${domain})` : 'Mobile App';
            logger.warn(`[${accName}] Steam Guard required (${authType})`);
            const code = readline.question(`${c.yellow}Enter Steam Guard code: ${c.reset}`);
            callback(code);
        });

        client.on('loggedOn', () => {
            logger.success(`[${accName}] Logged in successfully!`);
            
            if (account.enableStatus !== false) {
                client.setPersona(SteamUser.EPersonaState.Online);
            } else {
                client.setPersona(SteamUser.EPersonaState.Invisible);
            }

=======
        const settings = config.loadSettings();

        logger.info(`[${accName}] Connecting...`);

        // Prepare login options
        const loginOpts = {
            accountName: account.username,
            password: account.password,
            rememberPassword: true
        };

        // 2FA handling
        if (account.sharedSecret) {
            loginOpts.twoFactorCode = SteamTotp.generateAuthCode(account.sharedSecret);
            logger.debug(`[${accName}] Auto-generated 2FA code`);
        }

        // Steam Guard callback
        client.on('steamGuard', (domain, callback, lastCodeWrong) => {
            if (lastCodeWrong) {
                logger.warn(`[${accName}] Wrong code, try again`);
            }
            
            const authType = domain ? `Email (${domain})` : 'Mobile Authenticator';
            logger.warn(`[${accName}] ${authType} code required`);
            
            console.log(`\n${c.cyan}Options:${c.reset}`);
            console.log(`  ${c.dim}1. Enter code manually${c.reset}`);
            console.log(`  ${c.dim}2. Allow login from Steam app${c.reset}`);
            
            const code = ui.question(`\n${c.yellow}Enter code (or 'wait' to approve in app): ${c.reset}`);
            
            if (code.toLowerCase() === 'wait') {
                logger.info(`[${accName}] Waiting for Steam app approval...`);
                // Steam will retry automatically
            } else {
                callback(code);
            }
        });

        // QR Code login support
        client.on('loginKey', (key) => {
            logger.debug(`[${accName}] Login key received`);
        });

        // Successful login
        client.on('loggedOn', () => {
            logger.success(`[${accName}] Logged in!`);
            
            // Set persona state based on settings
            if (settings.invisibleMode || account.invisible) {
                client.setPersona(SteamUser.EPersonaState.Invisible);
                logger.info(`[${accName}] Mode: Invisible`);
            } else {
                client.setPersona(SteamUser.EPersonaState.Online);
            }

            // Start playing games
>>>>>>> 894d41f (Updated V3 pre-release)
            const games = account.gamesAndStatus || [730];
            client.gamesPlayed(games);
            
            const gameCount = games.filter(g => typeof g === 'number').length;
<<<<<<< HEAD
            logger.info(`[${accName}] Boosting ${gameCount} games`);
            
            timer.start();
            this.clients.set(accName, { client, account, timer, games });
            this.timers.set(accName, timer);
        });

        client.on('error', (err) => {
            logger.error(`[${accName}] Error: ${err.message}`);
            this.handleError(accName, err);
        });

        client.on('disconnected', (eresult, msg) => {
            logger.warn(`[${accName}] Disconnected: ${msg}`);
            timer.stop();
        });

=======
            logger.info(`[${accName}] Boosting ${gameCount} game(s)`);
            
            timer.start();
            this.clients.set(accName, { client, account, timer, games });
        });

        // Error handling
        client.on('error', (err) => {
            this.sessionStats.errors++;
            logger.error(`[${accName}] ${this.getErrorMessage(err)}`);
        });

        // Disconnection
        client.on('disconnected', (eresult, msg) => {
            logger.warn(`[${accName}] Disconnected: ${msg || 'Unknown reason'}`);
            timer.stop();
            this.sessionStats.reconnections++;
        });

        // Messages
>>>>>>> 894d41f (Updated V3 pre-release)
        client.on('friendMessage', (steamID, message) => {
            this.handleMessage(accName, steamID, message, client, account);
        });

<<<<<<< HEAD
        client.on('wallet', (hasWallet, currency, balance) => {
            if (hasWallet) {
                logger.info(`[${accName}] Wallet: ${(balance / 100).toFixed(2)} ${this.getCurrencySymbol(currency)}`);
            }
        });

        client.on('vacBans', (numBans, appids) => {
            if (numBans > 0) {
                logger.warn(`[${accName}] VAC BANS: ${numBans}`);
            }
        });

        try {
            client.logOn(loginDetails);
        } catch (err) {
            logger.error(`[${accName}] Login failed: ${err.message}`);
        }
    }

    handleMessage(accName, steamID, message, client, account) {
        this.sessionStats.messagesReceived++;
        const timestamp = new Date().toISOString();
        
        logger.message(`[${accName}] From ${steamID}: ${message}`);
        
        if (account.saveMessages) {
            const msgDir = path.join(__dirname, '..', 'messages');
            if (!fs.existsSync(msgDir)) fs.mkdirSync(msgDir, { recursive: true });
            const logPath = path.join(msgDir, `${accName}.log`);
            fs.appendFileSync(logPath, `[${timestamp}] ${steamID}: ${message}\n`);
=======
        // Wallet info
        client.on('wallet', (hasWallet, currency, balance) => {
            if (hasWallet && balance > 0) {
                const currencies = {1:'USD',2:'GBP',3:'EUR',5:'RUB',7:'BRL',16:'ARS',34:'MXN'};
                logger.info(`[${accName}] Wallet: ${(balance/100).toFixed(2)} ${currencies[currency] || ''}`);
            }
        });

        // VAC status
        client.on('vacBans', (numBans) => {
            if (numBans > 0) logger.warn(`[${accName}] VAC Bans: ${numBans}`);
        });

        try {
            client.logOn(loginOpts);
        } catch (err) {
            logger.error(`[${accName}] Login failed: ${err.message}`);
        }

        return new Promise(r => setTimeout(r, 1000));
    }

    /**
     * Display the boosting panel with live updates
     */
    showBoostingPanel() {
        let running = true;
        
        const render = () => {
            if (!running) return;
            
            console.clear();
            banner.displayMini();
            
            const lines = [''];
            
            if (this.clients.size === 0) {
                lines.push(`${c.dim}No active sessions. Press [M] for menu.${c.reset}`);
            } else {
                this.clients.forEach((data, name) => {
                    const t = data.timer.getTimeValues();
                    const time = `${String(t.hours).padStart(2,'0')}:${String(t.minutes).padStart(2,'0')}:${String(t.seconds).padStart(2,'0')}`;
                    const games = data.games.filter(g => typeof g === 'number').length;
                    const status = data.client.steamID ? `${c.green}ONLINE${c.reset}` : `${c.red}OFFLINE${c.reset}`;
                    const mode = data.account.invisible ? `${c.dim}(invisible)${c.reset}` : '';
                    
                    lines.push(`${c.yellow}${name}${c.reset} ${mode}`);
                    lines.push(`  Status: ${status}  |  Time: ${c.white}${time}${c.reset}  |  Games: ${c.cyan}${games}${c.reset}`);
                    lines.push('');
                });
            }
            
            lines.push(`${c.dim}?????????????????????????????????????${c.reset}`);
            lines.push(`${c.dim}[M] Menu  [S] Stats  [Q] Quit${c.reset}`);
            lines.push('');
            
            ui.box('BOOSTING', lines);
        };
        
        render();
        const interval = setInterval(render, 1000);
        
        // Key handling
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.once('data', (key) => {
                running = false;
                clearInterval(interval);
                process.stdin.setRawMode(false);
                process.stdin.pause();
                
                const k = key.toString().toLowerCase();
                if (k === 'q' || k === '\u0003') {
                    this.gracefulExit();
                } else if (k === 's') {
                    stats.showDashboard(this.sessionStats, this.clients, () => this.showBoostingPanel());
                } else {
                    this.showMenu(config.loadAccounts());
                }
            });
        }
    }

    /**
     * Add new account wizard
     */
    async addAccountWizard() {
        console.clear();
        banner.displayMini();
        
        ui.box('ADD NEW ACCOUNT', [
            '',
            `${c.dim}Enter your Steam credentials below.${c.reset}`,
            `${c.dim}Password input is hidden for security.${c.reset}`,
            ''
        ]);
        
        // Username
        let username = '';
        while (!username || username.length < 2) {
            username = ui.question(`${c.cyan}Username: ${c.reset}`);
            if (!username || username.length < 2) {
                console.log(`${c.red}  Username must be at least 2 characters${c.reset}`);
            }
        }
        
        // Check duplicate
        const existing = config.loadAccounts();
        if (existing.find(a => a.username.toLowerCase() === username.toLowerCase())) {
            logger.error(`Account "${username}" already exists!`);
            await this.sleep(2000);
            return;
        }
        
        // Password (supports long passwords)
        let password = '';
        while (!password) {
            password = ui.questionPassword(`${c.cyan}Password: ${c.reset}`);
            if (!password) {
                console.log(`${c.red}  Password cannot be empty${c.reset}`);
            }
        }
        
        // 2FA
        console.log(`\n${c.dim}2FA Setup (optional):${c.reset}`);
        const sharedSecret = ui.question(`${c.cyan}Shared Secret (leave empty for manual/QR): ${c.reset}`);
        
        // Invisible mode
        const invisibleChoice = ui.question(`${c.cyan}Boost invisibly? (y/n): ${c.reset}`).toLowerCase();
        const invisible = invisibleChoice === 'y' || invisibleChoice === 'yes';
        
        // Games
        console.log(`\n${c.yellow}Enter game IDs separated by commas${c.reset}`);
        console.log(`${c.dim}Example: 730,440,570 (CS2, TF2, Dota2)${c.reset}`);
        console.log(`${c.dim}Find IDs at: store.steampowered.com/app/XXXX${c.reset}`);
        
        let games = [];
        while (games.length === 0) {
            const input = ui.question(`${c.cyan}Game IDs: ${c.reset}`);
            games = input.split(',').map(g => parseInt(g.trim())).filter(g => !isNaN(g) && g > 0);
            if (games.length === 0) {
                console.log(`${c.red}  Enter at least one valid game ID${c.reset}`);
            }
        }
        
        // Custom status
        const status = ui.question(`${c.cyan}Custom status (optional): ${c.reset}`);
        if (status) games.unshift(status);
        
        // Save
        const account = {
            username,
            password,
            sharedSecret: sharedSecret || '',
            invisible,
            gamesAndStatus: games,
            replyMessage: '',
            saveMessages: true,
            createdAt: new Date().toISOString()
        };
        
        config.saveAccount(account);
        logger.success(`Account "${username}" added!`);
        await this.sleep(1500);
    }

    /**
     * Manage existing accounts
     * @param {Array} accounts 
     */
    manageAccounts(accounts, msg = null) {
        console.clear();
        banner.displayMini();
        
        ui.box('MANAGE ACCOUNTS', [
            '',
            `${c.green}[1]${c.reset} Edit Account`,
            `${c.green}[2]${c.reset} Remove Account`,
            `${c.green}[3]${c.reset} View All Accounts`,
            `${c.green}[4]${c.reset} Export (backup)`,
            '',
            `${c.dim}[0] Back${c.reset}`,
            ''
        ]);
        
        if (msg) console.log(`\n${c.yellow}  ${msg}${c.reset}`);

        const choice = ui.question('Select [0-4]: ');
        
        switch(choice) {
            case '1': this.editAccount(accounts); break;
            case '2': this.removeAccount(accounts); break;
            case '3': this.viewAccounts(accounts); break;
            case '4': config.exportAccounts(() => this.manageAccounts(config.loadAccounts())); break;
            case '0': this.showMenu(config.loadAccounts()); break;
            default: this.manageAccounts(accounts, 'Invalid option');
        }
    }

    /**
     * Edit an existing account
     * @param {Array} accounts 
     */
    editAccount(accounts) {
        if (accounts.length === 0) {
            return this.manageAccounts(accounts, 'No accounts to edit');
        }
        
        console.clear();
        banner.displayMini();
        
        console.log(`\n${c.cyan}Select account to edit:${c.reset}\n`);
        accounts.forEach((a, i) => console.log(`  ${c.yellow}[${i+1}]${c.reset} ${a.username}`));
        console.log(`\n  ${c.dim}[0] Cancel${c.reset}`);
        
        const choice = ui.question('\nSelect: ');
        const num = parseInt(choice);
        
        if (choice === '0' || isNaN(num) || num < 1 || num > accounts.length) {
            return this.manageAccounts(accounts);
        }
        
        const acc = accounts[num - 1];
        console.log(`\n${c.cyan}Editing: ${c.yellow}${acc.username}${c.reset}`);
        console.log(`${c.dim}Press Enter to keep current value${c.reset}\n`);
        
        // Password
        const newPass = ui.questionPassword(`New password [hidden]: `);
        if (newPass) acc.password = newPass;
        
        // Games
        const currentGames = acc.gamesAndStatus.filter(g => typeof g === 'number');
        console.log(`${c.dim}Current games: ${currentGames.join(', ')}${c.reset}`);
        const newGames = ui.question('New games (comma separated): ');
        if (newGames) {
            const games = newGames.split(',').map(g => parseInt(g.trim())).filter(g => !isNaN(g) && g > 0);
            if (games.length > 0) {
                const status = acc.gamesAndStatus.find(g => typeof g === 'string');
                acc.gamesAndStatus = status ? [status, ...games] : games;
            }
        }
        
        // Invisible
        const invChoice = ui.question(`Invisible mode (currently: ${acc.invisible ? 'yes' : 'no'}): `).toLowerCase();
        if (invChoice === 'y' || invChoice === 'yes') acc.invisible = true;
        else if (invChoice === 'n' || invChoice === 'no') acc.invisible = false;
        
        acc.updatedAt = new Date().toISOString();
        config.saveAccounts(accounts);
        logger.success('Account updated!');
        
        ui.pause();
        this.manageAccounts(config.loadAccounts());
    }

    /**
     * Remove an account
     * @param {Array} accounts 
     */
    removeAccount(accounts) {
        if (accounts.length === 0) {
            return this.manageAccounts(accounts, 'No accounts to remove');
        }
        
        console.clear();
        banner.displayMini();
        
        console.log(`\n${c.red}SELECT ACCOUNT TO DELETE:${c.reset}\n`);
        accounts.forEach((a, i) => console.log(`  ${c.yellow}[${i+1}]${c.reset} ${a.username}`));
        console.log(`\n  ${c.dim}[0] Cancel${c.reset}`);
        
        const choice = ui.question('\nSelect: ');
        const num = parseInt(choice);
        
        if (choice === '0' || isNaN(num) || num < 1 || num > accounts.length) {
            return this.manageAccounts(accounts);
        }
        
        const acc = accounts[num - 1];
        console.log(`\n${c.red}Delete "${acc.username}" permanently?${c.reset}`);
        const confirm = ui.question(`Type "${c.yellow}yes${c.reset}" to confirm: `);
        
        if (confirm.toLowerCase() === 'yes') {
            accounts.splice(num - 1, 1);
            config.saveAccounts(accounts);
            logger.success('Account deleted!');
        } else {
            logger.info('Cancelled');
        }
        
        ui.pause();
        this.manageAccounts(config.loadAccounts());
    }

    /**
     * View all configured accounts
     * @param {Array} accounts 
     */
    viewAccounts(accounts) {
        console.clear();
        banner.displayMini();
        
        if (accounts.length === 0) {
            console.log(`\n${c.dim}No accounts configured.${c.reset}`);
        } else {
            const lines = [''];
            accounts.forEach((a, i) => {
                const games = (a.gamesAndStatus || []).filter(g => typeof g === 'number').length;
                const has2fa = a.sharedSecret ? `${c.green}Yes${c.reset}` : `${c.red}No${c.reset}`;
                const inv = a.invisible ? `${c.cyan}Inv${c.reset}` : `${c.dim}Vis${c.reset}`;
                lines.push(`${c.yellow}${(i+1).toString().padStart(2)}${c.reset}. ${a.username.padEnd(18)} | 2FA: ${has2fa} | ${inv} | ${c.dim}${games} games${c.reset}`);
            });
            lines.push('');
            ui.box('ALL ACCOUNTS', lines);
        }
        
        ui.pause();
        this.manageAccounts(accounts);
    }

    /**
     * Settings menu
     */
    settingsMenu(msg = null) {
        console.clear();
        banner.displayMini();
        
        const s = config.loadSettings();
        const on = `${c.green}ON${c.reset}`;
        const off = `${c.red}OFF${c.reset}`;
        
        ui.box('SETTINGS', [
            '',
            `${c.green}[1]${c.reset} Auto-reconnect:    [${s.autoReconnect ? on : off}]`,
            `${c.green}[2]${c.reset} Invisible mode:    [${s.invisibleMode ? on : off}]`,
            `${c.green}[3]${c.reset} Save messages:     [${s.saveMessages ? on : off}]`,
            `${c.green}[4]${c.reset} Debug mode:        [${s.debug ? on : off}]`,
            `${c.green}[5]${c.reset} Startup delay:     ${c.yellow}${s.startupDelay}ms${c.reset}`,
            '',
            `${c.dim}[0] Back${c.reset}`,
            ''
        ]);
        
        if (msg) console.log(`\n${c.green}  ? ${msg}${c.reset}`);

        const choice = ui.question('Select [0-5]: ');
        
        const toggle = (key, name) => {
            s[key] = !s[key];
            config.saveSettings(s);
            this.settingsMenu(`${name} ${s[key] ? 'enabled' : 'disabled'}`);
        };
        
        switch(choice) {
            case '1': toggle('autoReconnect', 'Auto-reconnect'); break;
            case '2': toggle('invisibleMode', 'Invisible mode'); break;
            case '3': toggle('saveMessages', 'Save messages'); break;
            case '4': toggle('debug', 'Debug mode'); break;
            case '5':
                const delay = ui.question('Enter delay (1000-10000ms): ');
                const num = parseInt(delay);
                if (!isNaN(num) && num >= 1000 && num <= 10000) {
                    s.startupDelay = num;
                    config.saveSettings(s);
                    this.settingsMenu(`Startup delay set to ${num}ms`);
                } else {
                    this.settingsMenu('Invalid delay value');
                }
                break;
            case '0': this.showMenu(config.loadAccounts()); break;
            default: this.settingsMenu('Invalid option');
        }
    }

    /**
     * Handle incoming friend messages
     */
    handleMessage(accName, steamID, message, client, account) {
        this.sessionStats.messagesReceived++;
        logger.message(`[${accName}] ${steamID}: ${message}`);
        
        if (account.saveMessages !== false) {
            const dir = path.join(__dirname, '..', 'messages');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const file = path.join(dir, `${accName}.log`);
            fs.appendFileSync(file, `[${new Date().toISOString()}] ${steamID}: ${message}\n`);
>>>>>>> 894d41f (Updated V3 pre-release)
        }
        
        if (account.replyMessage) {
            client.chat.sendFriendMessage(steamID, account.replyMessage);
        }
    }

<<<<<<< HEAD
    handleError(accName, err) {
        const errorCodes = {
            61: 'Invalid Password',
            63: 'Account Disabled',
            65: 'Steam Guard Required',
            66: 'Steam Guard Code Wrong',
            84: 'Rate Limited - Wait a few minutes',
            85: 'Login Denied'
        };
        
        const errMsg = errorCodes[err.eresult] || err.message;
        logger.error(`[${accName}] ${errMsg}`);
    }

    showActiveStatus() {
        const updateStatus = () => {
            console.clear();
            banner.displayMini();
            
            console.log(`\n${c.cyan}+=====================================================================+${c.reset}`);
            console.log(`${c.cyan}|${c.reset}                    ${c.bold}${c.green}ACTIVE BOOSTING SESSIONS${c.reset}                          ${c.cyan}|${c.reset}`);
            console.log(`${c.cyan}+=====================================================================+${c.reset}`);
            
            if (this.clients.size === 0) {
                console.log(`${c.cyan}|${c.reset}  ${c.dim}No active sessions...${c.reset}                                             ${c.cyan}|${c.reset}`);
            } else {
                this.clients.forEach((data, username) => {
                    const time = data.timer.getTimeValues().toString();
                    const gameCount = data.games.filter(g => typeof g === 'number').length;
                    const status = data.client.steamID ? `${c.green}ON ${c.reset}` : `${c.red}OFF${c.reset}`;
                    console.log(`${c.cyan}|${c.reset}  [${status}] ${c.yellow}${username.padEnd(18)}${c.reset} | Time: ${c.white}${time.padEnd(10)}${c.reset} | Games: ${c.magenta}${gameCount}${c.reset}    ${c.cyan}|${c.reset}`);
                });
            }
            
            console.log(`${c.cyan}+=====================================================================+${c.reset}`);
            console.log(`${c.cyan}|${c.reset}  ${c.dim}[Q] Quit    [M] Menu    [S] Stats${c.reset}                                 ${c.cyan}|${c.reset}`);
            console.log(`${c.cyan}+=====================================================================+${c.reset}`);
        };
        
        updateStatus();
        const interval = setInterval(updateStatus, 1000);
        
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.once('data', (key) => {
            clearInterval(interval);
            process.stdin.setRawMode(false);
            process.stdin.pause();
            
            const k = key.toString().toLowerCase();
            if (k === 'q' || k === '\u0003') {
                this.gracefulExit();
            } else if (k === 'm') {
                this.showMenu(config.loadAccounts());
            } else if (k === 's') {
                stats.showDashboard(this.sessionStats, this.clients, () => this.showActiveStatus());
            } else {
                this.showActiveStatus();
            }
        });
    }

    accountManager(accounts, errorMsg = null) {
        console.clear();
        banner.displayMini();
        
        console.log(`\n${c.cyan}+========================================+${c.reset}`);
        console.log(`${c.cyan}|${c.reset}         ${c.bold}ACCOUNT MANAGER${c.reset}               ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}+========================================+${c.reset}`);
        console.log(`${c.cyan}|${c.reset}                                        ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[1]${c.reset} Add New Account                  ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[2]${c.reset} Edit Account                     ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[3]${c.reset} Remove Account                   ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[4]${c.reset} View All Accounts                ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[5]${c.reset} Export Accounts                  ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}                                        ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.red}[0]${c.reset} Back to Main Menu                ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}                                        ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}+========================================+${c.reset}`);
        
        if (errorMsg) {
            console.log(`\n${c.red}  ! ${errorMsg}${c.reset}`);
        }
        
        const choice = readline.question(`\n${c.cyan}Select [0-5]: ${c.reset}`).trim();
        
        switch(choice) {
            case '1': config.addAccount(() => this.accountManager(config.loadAccounts())); break;
            case '2': config.editAccount(accounts, () => this.accountManager(config.loadAccounts())); break;
            case '3': config.removeAccount(accounts, () => this.accountManager(config.loadAccounts())); break;
            case '4': this.viewAccounts(accounts); break;
            case '5': config.exportAccounts(() => this.accountManager(config.loadAccounts())); break;
            case '0': this.showMenu(config.loadAccounts()); break;
            default: this.accountManager(accounts, 'Invalid option! Please select 0-5');
        }
    }

    viewAccounts(accounts) {
        console.clear();
        banner.displayMini();
        
        console.log(`\n${c.cyan}+================================================================+${c.reset}`);
        console.log(`${c.cyan}|${c.reset}                   ${c.bold}CONFIGURED ACCOUNTS${c.reset}                        ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}+================================================================+${c.reset}`);
        
        if (accounts.length === 0) {
            console.log(`${c.cyan}|${c.reset}  ${c.dim}No accounts configured yet.${c.reset}                                 ${c.cyan}|${c.reset}`);
        } else {
            accounts.forEach((acc, i) => {
                const has2FA = acc.sharedSecret ? `${c.green}YES${c.reset}` : `${c.red}NO ${c.reset}`;
                const gameCount = (acc.gamesAndStatus || []).filter(g => typeof g === 'number').length;
                console.log(`${c.cyan}|${c.reset}  ${c.yellow}${(i+1).toString().padStart(2)}${c.reset}. ${acc.username.padEnd(20)} | 2FA: ${has2FA} | Games: ${c.magenta}${gameCount.toString().padStart(2)}${c.reset}  ${c.cyan}|${c.reset}`);
            });
        }
        
        console.log(`${c.cyan}+================================================================+${c.reset}`);
        
        readline.question(`\n${c.dim}Press Enter to go back...${c.reset}`);
        this.accountManager(accounts);
    }

    settingsMenu(errorMsg = null) {
        console.clear();
        banner.displayMini();
        
        const settings = config.loadSettings();
        
        const onOff = (val) => val ? `${c.green}ON ${c.reset}` : `${c.red}OFF${c.reset}`;
        
        console.log(`\n${c.cyan}+========================================+${c.reset}`);
        console.log(`${c.cyan}|${c.reset}             ${c.bold}SETTINGS${c.reset}                    ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}+========================================+${c.reset}`);
        console.log(`${c.cyan}|${c.reset}                                        ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[1]${c.reset} Auto-reconnect:  [${onOff(settings.autoReconnect)}]         ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[2]${c.reset} Debug mode:      [${onOff(settings.debug)}]         ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[3]${c.reset} Log to file:     [${onOff(settings.logToFile)}]         ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.green}[4]${c.reset} Startup delay:   ${c.yellow}${settings.startupDelay}ms${c.reset}            ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}                                        ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}  ${c.red}[0]${c.reset} Back to Main Menu                ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}|${c.reset}                                        ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}+========================================+${c.reset}`);
        
        if (errorMsg) {
            console.log(`\n${c.red}  ! ${errorMsg}${c.reset}`);
        }
        
        const choice = readline.question(`\n${c.cyan}Select [0-4]: ${c.reset}`).trim();
        
        switch(choice) {
            case '1': 
                settings.autoReconnect = !settings.autoReconnect; 
                config.saveSettings(settings);
                this.settingsMenu(`Auto-reconnect ${settings.autoReconnect ? 'enabled' : 'disabled'}`);
                break;
            case '2': 
                settings.debug = !settings.debug; 
                config.saveSettings(settings);
                this.settingsMenu(`Debug mode ${settings.debug ? 'enabled' : 'disabled'}`);
                break;
            case '3': 
                settings.logToFile = !settings.logToFile; 
                config.saveSettings(settings);
                this.settingsMenu(`Log to file ${settings.logToFile ? 'enabled' : 'disabled'}`);
                break;
            case '4': 
                const delay = readline.question(`${c.cyan}Enter delay in ms (500-10000): ${c.reset}`).trim();
                const num = parseInt(delay);
                if (isNaN(num) || num < 500 || num > 10000) {
                    this.settingsMenu('Invalid delay! Must be between 500-10000ms');
                } else {
                    settings.startupDelay = num;
                    config.saveSettings(settings);
                    this.settingsMenu(`Startup delay set to ${num}ms`);
                }
                break;
            case '0': 
                this.showMenu(config.loadAccounts()); 
                break;
            default: 
                this.settingsMenu('Invalid option! Please select 0-4');
        }
    }

    async setupWizard() {
        console.clear();
        banner.display();
        
        console.log(`\n${c.cyan}+========================================+${c.reset}`);
        console.log(`${c.cyan}|${c.reset}       ${c.bold}VAPOR BOOSTER SETUP WIZARD${c.reset}       ${c.cyan}|${c.reset}`);
        console.log(`${c.cyan}+========================================+${c.reset}\n`);
        
        logger.info('Let\'s set up your first account!\n');
        
        // Username
        let username = '';
        while (!username) {
            username = readline.question(`${c.cyan}Steam Username: ${c.reset}`).trim();
            if (!username) {
                console.log(`${c.red}  ! Username cannot be empty${c.reset}`);
            }
        }
        
        // Password
        let password = '';
        while (!password) {
            password = readline.question(`${c.cyan}Steam Password: ${c.reset}`, { hideEchoBack: true });
            if (!password) {
                console.log(`${c.red}  ! Password cannot be empty${c.reset}`);
            }
        }
        
        // 2FA
        const has2FA = readline.question(`${c.cyan}Do you have 2FA enabled? (y/n): ${c.reset}`).toLowerCase().trim();
        let sharedSecret = '';
        if (has2FA === 'y' || has2FA === 'yes') {
            sharedSecret = readline.question(`${c.cyan}Shared Secret (leave empty to enter code manually): ${c.reset}`).trim();
        }
        
        // Status
        const status = readline.question(`${c.cyan}Custom status (leave empty for none): ${c.reset}`).trim();
        
        // Games
        console.log(`\n${c.yellow}Enter game IDs to boost (comma separated)${c.reset}`);
        console.log(`${c.dim}Example: 730,440,570 (CS2, TF2, Dota 2)${c.reset}`);
        console.log(`${c.dim}Use Game Database Browser [4] to find game IDs${c.reset}`);
        
        let games = [];
        while (games.length === 0) {
            const gamesInput = readline.question(`${c.cyan}Games: ${c.reset}`).trim();
            games = gamesInput.split(',').map(g => parseInt(g.trim())).filter(g => !isNaN(g) && g > 0);
            if (games.length === 0) {
                console.log(`${c.red}  ! Enter at least one valid game ID${c.reset}`);
            }
        }
        
        if (status) games.unshift(status);
        
        const account = {
            username,
            password,
            sharedSecret,
            enableStatus: true,
            gamesAndStatus: games,
            replyMessage: '',
            receiveMessages: true,
            saveMessages: true
        };
        
        config.saveAccount(account);
        logger.success('Account saved successfully!');
        
        await this.sleep(1500);
    }

    getCurrencySymbol(currency) {
        const symbols = { 1: 'USD', 2: 'GBP', 3: 'EUR', 5: 'RUB', 7: 'BRL', 23: 'ARS' };
        return symbols[currency] || 'units';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

=======
    /**
     * Get human-readable error message
     * @param {Error} err 
     */
    getErrorMessage(err) {
        const codes = {
            5: 'Invalid password',
            6: 'Logged in elsewhere',
            12: 'Account disabled',
            15: 'VAC banned',
            63: 'Account disabled',
            65: 'Steam Guard required',
            66: 'Wrong Steam Guard code',
            84: 'Rate limited - wait 30 min',
            85: 'Login denied'
        };
        return codes[err.eresult] || err.message || 'Unknown error';
    }

    /**
     * Graceful shutdown
     */
>>>>>>> 894d41f (Updated V3 pre-release)
    gracefulExit() {
        console.clear();
        console.log(`\n${c.yellow}Shutting down VaporBooster...${c.reset}\n`);
        
<<<<<<< HEAD
        if (this.clients.size > 0) {
            this.clients.forEach((data, username) => {
                console.log(`${c.dim}  Logging out ${username}...${c.reset}`);
                data.client.logOff();
            });
        }
=======
        // Save statistics
        stats.recordSession(this.sessionStats, this.clients);
        
        // Logout all clients
        this.clients.forEach((data, name) => {
            console.log(`${c.dim}  Logging out ${name}...${c.reset}`);
            data.timer.stop();
            data.client.logOff();
        });
>>>>>>> 894d41f (Updated V3 pre-release)
        
        setTimeout(() => {
            console.log(`\n${c.green}Goodbye!${c.reset}\n`);
            process.exit(0);
        }, 1500);
    }
<<<<<<< HEAD
}

const booster = new VaporBooster();
booster.init().catch(err => {
    console.error(`${c.red}Fatal error: ${err.message}${c.reset}`);
    process.exit(1);
});

process.on('SIGINT', () => booster.gracefulExit());
process.on('SIGTERM', () => booster.gracefulExit());
=======

    /** Sleep utility */
    sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

// Start application
const app = new VaporBooster();
app.init().catch(err => {
    console.error(`${c.red}Fatal: ${err.message}${c.reset}`);
    process.exit(1);
});

// Handle signals
process.on('SIGINT', () => app.gracefulExit());
process.on('SIGTERM', () => app.gracefulExit());
>>>>>>> 894d41f (Updated V3 pre-release)
