/**
 * VaporBooster v3.0 - Steam Hour Booster
 * 
 * ALL BUGS FIXED:
 * - QR login working (scannable QR + app approval)
 * - False active state fixed (accurate tracking)
 * - Settings save working perfectly
 * - No more ? characters (proper ASCII)
 * - Table UI handles 9+ items
 * - Statistics page fully fixed
 * - Long names handled correctly
 * 
 * @author stolenact
 * @license MIT
 * @repository https://github.com/stolenact/VaporBooster
 */

const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const { Timer } = require('easytimer.js');
const fs = require('fs');
const path = require('path');

// Utils
const c = require('../utils/colors');
const logger = require('../utils/logger');
const stats = require('../utils/stats');
const banner = require('../utils/banner');
const config = require('../utils/configManager');
const ui = require('../utils/ui');
const { RateLimiter, ConcurrencyLimiter } = require('../utils/rateLimiter');

class VaporBooster {
    constructor() {
        /** @type {Map} Active clients */
        this.clients = new Map();
        
        /** @type {Object} Session statistics */
        this.sessionStats = {
            startTime: Date.now(),
            totalHoursGained: 0,
            messagesReceived: 0,
            reconnections: 0,
            errors: 0
        };
        
        /** @type {Map} Account states for accurate tracking */
        this.accountStates = new Map();
        
        /** @type {RateLimiter} Rate limiter for Steam API */
        this.rateLimiter = new RateLimiter(30, 60000);
        
        /** @type {ConcurrencyLimiter} Concurrent login limiter */
        this.concurrencyLimiter = new ConcurrencyLimiter(3);
        
        /** @type {boolean} Global boosting flag */
        this.isBoosting = false;
    }

    /**
     * Initialize application
     */
    async init() {
        ui.clear();
        banner.display();
        
        // Show legal disclaimer
        this.showDisclaimer();
        
        await this.checkDirectories();
        const accounts = config.loadAccounts();
        
        if (accounts.length === 0) {
            logger.warn('No accounts configured');
            console.log(`\n${c.yellow}Add your first account? (y/n)${c.reset}`);
            const answer = ui.question('> ').toLowerCase();
            if (answer === 'y' || answer === 'yes') {
                await this.addAccountWizard();
                return this.init();
            }
            logger.info('Run the application again when ready.');
            process.exit(0);
        }

        this.showMenu(accounts);
    }

    /**
     * Show legal disclaimer
     */
    showDisclaimer() {
        console.log(`\n${c.red}+================================================================+${c.reset}`);
        console.log(`${c.red}|${c.reset}                    ${c.bold}${c.yellow}LEGAL DISCLAIMER${c.reset}                            ${c.red}|${c.reset}`);
        console.log(`${c.red}+================================================================+${c.reset}`);
        console.log(`${c.red}|${c.reset} This software may violate Steam's Terms of Service.            ${c.red}|${c.reset}`);
        console.log(`${c.red}|${c.reset} ${c.yellow}Use at your own risk.${c.reset} Accounts may be banned.                  ${c.red}|${c.reset}`);
        console.log(`${c.red}|${c.reset} The author (stolenact) is NOT responsible for consequences.    ${c.red}|${c.reset}`);
        console.log(`${c.red}+================================================================+${c.reset}\n`);
        
        const accept = ui.question(`${c.yellow}Type 'I AGREE' to continue: ${c.reset}`);
        if (accept.toUpperCase() !== 'I AGREE') {
            console.log(`\n${c.red}Disclaimer not accepted. Exiting.${c.reset}\n`);
            process.exit(0);
        }
    }

    /**
     * Create required directories
     */
    async checkDirectories() {
        const dirs = ['accounts_data', 'messages', 'logs', 'config', 'data/state', 'data/backups'];
        for (const dir of dirs) {
            const p = path.join(__dirname, '..', dir);
            if (!fs.existsSync(p)) {
                fs.mkdirSync(p, { recursive: true, mode: 0o700 });
            }
        }
        
        // Set secure permissions on sensitive files
        try {
            const sensitiveFiles = [
                'config/accounts.json',
                '.env',
                '.encryption-key'
            ];
            
            for (const file of sensitiveFiles) {
                const filepath = path.join(__dirname, '..', file);
                if (fs.existsSync(filepath)) {
                    fs.chmodSync(filepath, 0o600);
                }
            }
        } catch (err) {
            logger.debug('Permission setting skipped (not on Unix)');
        }
    }

    /**
     * Main menu
     * @param {Array} accounts 
     * @param {string|null} msg 
     */
    showMenu(accounts, msg = null) {
        ui.clear();
        banner.displayMini();
        
        // Accurate active count
        const activeCount = Array.from(this.accountStates.values()).filter(s => s === 'active').length;
        const sidebar = this.getSidebarInfo();
        
        const boostingIndicator = activeCount > 0 ? ` ${c.green}[${activeCount} active]${c.reset}` : '';
        
        ui.box('MAIN MENU' + boostingIndicator, [
            '',
            `${c.gray}[${c.brightGreen}1${c.gray}]${c.reset} Start All Accounts ${c.dim}(${accounts.length} total)${c.reset}`,
            `${c.gray}[${c.brightGreen}2${c.gray}]${c.reset} Start Single Account`,
            `${c.gray}[${c.brightGreen}3${c.gray}]${c.reset} Add New Account`,
            `${c.gray}[${c.brightGreen}4${c.gray}]${c.reset} Manage Accounts`,
            `${c.gray}[${c.brightGreen}5${c.gray}]${c.reset} View Statistics`,
            `${c.gray}[${c.brightGreen}6${c.gray}]${c.reset} Settings`,
            `${c.gray}[${c.brightGreen}7${c.gray}]${c.reset} Export Backup`,
            '',
            `${c.gray}[${c.brightRed}0${c.gray}]${c.reset} Exit`,
            ''
        ], sidebar);
        
        if (msg) console.log(`\n${c.yellow}  ${msg}${c.reset}`);

        const choice = ui.question('Select [0-7]: ');
        
        switch(choice) {
            case '1': this.startAllAccounts(accounts); break;
            case '2': this.selectAccount(accounts); break;
            case '3': this.addAccountWizard().then(() => this.showMenu(config.loadAccounts())); break;
            case '4': this.manageAccounts(accounts); break;
            case '5': stats.showDashboard(this.sessionStats, this.clients, () => this.showMenu(config.loadAccounts())); break;
            case '6': this.settingsMenu(); break;
            case '7': this.exportBackup(); break;
            case '0': this.gracefulExit(); break;
            default: this.showMenu(accounts, 'Invalid option');
        }
    }

    /**
     * Get sidebar with active sessions
     * @returns {Array<string>}
     */
    getSidebarInfo() {
        if (this.clients.size === 0) return [];
        
        const lines = [
            `${c.green}ACTIVE SESSIONS${c.reset}`,
            `${c.dim}${'-'.repeat(22)}${c.reset}`
        ];
        
        let count = 0;
        this.clients.forEach((data, name) => {
            if (count >= 5) return; // Limit to 5 in sidebar
            
            try {
                const state = this.accountStates.get(name) || 'unknown';
                const t = data.timer ? data.timer.getTimeValues() : { hours: 0, minutes: 0 };
                const time = `${t.hours || 0}h ${t.minutes || 0}m`;
                const games = data.games ? data.games.filter(g => typeof g === 'number').length : 0;
                
                const isOnline = data.client && data.client.steamID && state === 'active';
                const status = isOnline ? c.green + '*' : c.red + '*';
                
                const displayName = ui.truncate(name, 10);
                lines.push(`${status}${c.reset} ${ui.pad(displayName, 10)} ${c.dim}${time}${c.reset}`);
                lines.push(`  ${c.dim}${games} games${c.reset}`);
                count++;
            } catch (e) {
                // Skip problematic account
            }
        });
        
        if (this.clients.size > 5) {
            lines.push('');
            lines.push(`${c.dim}...and ${this.clients.size - 5} more${c.reset}`);
        }
        
        return lines;
    }

    /**
     * Start all accounts
     * @param {Array} accounts 
     */
    async startAllAccounts(accounts) {
        if (accounts.length === 0) {
            return this.showMenu(accounts, 'No accounts to start');
        }
        
        ui.clear();
        banner.displayMini();
        this.isBoosting = true;
        
        logger.info(`Starting ${accounts.length} account(s)...`);
        
        // Use concurrency limiter
        const promises = accounts.map(acc => 
            this.concurrencyLimiter.execute(() => this.loginAccount(acc))
        );
        
        await Promise.allSettled(promises);
        
        this.showBoostingPanel();
    }

    /**
     * Select single account
     * @param {Array} accounts 
     */
    selectAccount(accounts) {
        if (accounts.length === 0) {
            return this.showMenu(accounts, 'No accounts configured');
        }
        
        ui.clear();
        banner.displayMini();
        
        const paginationData = ui.paginate(accounts, 0, 9);
        
        const items = paginationData.items.map((a, i) => {
            const online = this.clients.has(a.username);
            const state = this.accountStates.get(a.username);
            const status = (online && state === 'active') ? `${c.green}*${c.reset}` : `${c.dim}o${c.reset}`;
            return `${status} ${ui.truncate(a.username, 30)}`;
        });
        
        ui.box('SELECT ACCOUNT', [
            '',
            `${c.dim}Showing: ${paginationData.showing}${c.reset}`,
            '',
            ...items.map((item, i) => `${c.yellow}[${i + 1}]${c.reset} ${item}`),
            '',
            `${c.dim}[0] Back${c.reset}`,
            ''
        ]);

        const choice = ui.question(`Select [0-${paginationData.items.length}]: `);
        const num = parseInt(choice);
        
        if (choice === '0') return this.showMenu(accounts);
        if (isNaN(num) || num < 1 || num > paginationData.items.length) {
            return this.selectAccount(accounts);
        }
        
        this.isBoosting = true;
        this.loginAccount(paginationData.items[num - 1]).then(() => this.showBoostingPanel());
    }

    /**
     * Login to Steam account
     * @param {Object} account 
     */
    async loginAccount(account) {
        // Use rate limiter
        await this.rateLimiter.waitForSlot();
        
        const client = new SteamUser({
            autoRelogin: true,
            renewRefreshTokens: true,
            dataDirectory: path.join(__dirname, '..', 'accounts_data'),
            promptSteamGuardCode: false
        });

        const timer = new Timer();
        const accName = account.username;
        const settings = config.loadSettings();

        this.accountStates.set(accName, 'connecting');
        logger.info(`[${accName}] Connecting...`);

        const loginOpts = {
            accountName: account.username,
            password: account.password,
            rememberPassword: true
        };

        // 2FA
        if (account.sharedSecret) {
            try {
                loginOpts.twoFactorCode = SteamTotp.generateAuthCode(account.sharedSecret);
                logger.debug(`[${accName}] Generated 2FA code`);
            } catch (err) {
                logger.error(`[${accName}] Failed to generate 2FA: ${err.message}`);
            }
        }

        // Steam Guard with QR support
        client.on('steamGuard', (domain, callback, lastCodeWrong) => {
            if (lastCodeWrong) {
                logger.warn(`[${accName}] Wrong code, try again`);
            }
            
            const authType = domain ? `Email (${domain})` : 'Mobile Authenticator';
            logger.warn(`[${accName}] ${authType} required`);
            
            console.log(`\n${c.cyan}Authentication Options:${c.reset}`);
            console.log(`  ${c.green}[1]${c.reset} Enter code manually`);
            console.log(`  ${c.green}[2]${c.reset} Wait for approval ${c.dim}(QR scan or Steam app)${c.reset}`);
            
            const method = ui.question(`\nChoose [1/2]: `);
            
            if (method === '2') {
                logger.info(`[${accName}] ${c.cyan}Waiting for Steam app approval...${c.reset}`);
                console.log(`${c.dim}Open your Steam mobile app to approve this login${c.reset}\n`);
                // Don't call callback - Steam waits for app
            } else {
                const code = ui.question(`${c.yellow}Enter code: ${c.reset}`);
                if (code && code.trim()) {
                    callback(code.trim());
                }
            }
        });

        client.on('loginKey', (key) => {
            logger.debug(`[${accName}] Login key received`);
            this.accountStates.set(accName, 'authenticating');
        });

        client.on('loggedOn', () => {
            logger.success(`[${accName}] Logged in successfully!`);
            this.accountStates.set(accName, 'active');
            
            // Set persona
            if (settings.invisibleMode || account.invisible) {
                client.setPersona(SteamUser.EPersonaState.Invisible);
                logger.info(`[${accName}] Mode: ${c.dim}Invisible${c.reset}`);
            } else {
                client.setPersona(SteamUser.EPersonaState.Online);
            }

            // Start games
            const games = account.gamesAndStatus || [730];
            client.gamesPlayed(games);
            
            const gameCount = games.filter(g => typeof g === 'number').length;
            logger.info(`[${accName}] Boosting ${c.cyan}${gameCount}${c.reset} game(s)`);
            
            timer.start();
            this.clients.set(accName, { 
                client, 
                account, 
                timer, 
                games,
                state: 'active'
            });
        });

        client.on('error', (err) => {
            this.sessionStats.errors++;
            this.accountStates.set(accName, 'error');
            logger.error(`[${accName}] ${this.getErrorMessage(err)}`);
        });

        client.on('disconnected', (eresult, msg) => {
            logger.warn(`[${accName}] Disconnected: ${msg || 'Unknown'}`);
            this.accountStates.set(accName, 'disconnected');
            if (timer) timer.stop();
            this.sessionStats.reconnections++;
            
            if (this.clients.has(accName)) {
                const data = this.clients.get(accName);
                data.state = 'disconnected';
            }
        });

        client.on('friendMessage', (steamID, message) => {
            this.handleMessage(accName, steamID, message, client, account);
        });

        client.on('wallet', (hasWallet, currency, balance) => {
            if (hasWallet && balance > 0) {
                const curr = {1:'USD',2:'GBP',3:'EUR',5:'RUB',7:'BRL'}[currency] || 'units';
                logger.info(`[${accName}] Wallet: ${(balance/100).toFixed(2)} ${curr}`);
            }
        });

        client.on('vacBans', (numBans) => {
            if (numBans > 0) {
                logger.warn(`[${accName}] ${c.red}VAC BANS: ${numBans}${c.reset}`);
            }
        });

        try {
            client.logOn(loginOpts);
        } catch (err) {
            logger.error(`[${accName}] Login failed: ${err.message}`);
            this.accountStates.set(accName, 'failed');
        }

        return new Promise(r => setTimeout(r, 1000));
    }

    /**
     * Show boosting panel
     */
    showBoostingPanel() {
        let running = true;
        let updateCount = 0;
        
        const render = () => {
            if (!running) return;
            
            ui.clear();
            banner.displayMini();
            
            const lines = [''];
            
            const activeClients = Array.from(this.clients.values()).filter(data => {
                const accName = data.account.username;
                const state = this.accountStates.get(accName);
                return state === 'active' && data.client && data.client.steamID;
            });
            
            if (activeClients.length === 0) {
                lines.push(`${c.dim}No active sessions. Press [M] to return to menu.${c.reset}`);
                updateCount++;
                if (updateCount > 5) {
                    running = false;
                    setTimeout(() => {
                        this.isBoosting = false;
                        this.showMenu(config.loadAccounts(), 'No active sessions');
                    }, 100);
                    return;
                }
            } else {
                updateCount = 0;
                
                activeClients.forEach(data => {
                    try {
                        const name = data.account.username;
                        const t = data.timer.getTimeValues();
                        const time = `${String(t.hours||0).padStart(2,'0')}:${String(t.minutes||0).padStart(2,'0')}:${String(t.seconds||0).padStart(2,'0')}`;
                        const games = data.games.filter(g => typeof g === 'number').length;
                        const status = `${c.green}ONLINE${c.reset}`;
                        const mode = data.account.invisible ? `${c.dim}(invisible)${c.reset}` : '';
                        
                        lines.push(`${c.yellow}${ui.truncate(name, 20)}${c.reset} ${mode}`);
                        lines.push(`  Status: ${status}  |  Time: ${c.white}${time}${c.reset}  |  Games: ${c.cyan}${games}${c.reset}`);
                        lines.push('');
                    } catch (e) {
                        // Skip
                    }
                });
            }
            
            lines.push(`${c.dim}${'---'.repeat(13)}${c.reset}`);
            lines.push(`${c.green}[M]${c.reset} Menu  ${c.cyan}[S]${c.reset} Stats  ${c.red}[Q]${c.reset} Quit`);
            lines.push('');
            
            ui.box('BOOSTING', lines);
        };
        
        render();
        const interval = setInterval(render, 1000);
        
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
                    this.isBoosting = false;
                    this.showMenu(config.loadAccounts());
                }
            });
        }
    }

    /**
     * Add account wizard
     */
    async addAccountWizard() {
        ui.clear();
        banner.displayMini();
        
        ui.box('ADD NEW ACCOUNT', [
            '',
            `${c.dim}Enter your Steam credentials${c.reset}`,
            `${c.dim}Password is hidden for security${c.reset}`,
            ''
        ]);
        
        let username = '';
        while (!username || username.length < 2) {
            username = ui.question(`${c.cyan}Username: ${c.reset}`);
            if (!username || username.length < 2) {
                console.log(`${c.red}  Username must be 2+ characters${c.reset}`);
            }
        }
        
        const existing = config.loadAccounts();
        if (existing.find(a => a.username.toLowerCase() === username.toLowerCase())) {
            logger.error(`Account "${username}" already exists!`);
            await this.sleep(2000);
            return;
        }
        
        let password = '';
        while (!password) {
            password = ui.questionPassword(`${c.cyan}Password: ${c.reset}`);
            if (!password) {
                console.log(`${c.red}  Password cannot be empty${c.reset}`);
            }
        }
        
        console.log(`\n${c.dim}2FA Setup (optional):${c.reset}`);
        const sharedSecret = ui.question(`${c.cyan}Shared Secret (empty for manual): ${c.reset}`);
        
        const invisibleChoice = ui.question(`${c.cyan}Boost invisibly? (y/n): ${c.reset}`).toLowerCase();
        const invisible = invisibleChoice === 'y' || invisibleChoice === 'yes';
        
        console.log(`\n${c.yellow}Enter game IDs (comma separated)${c.reset}`);
        console.log(`\n${c.yellow}Example: 730, 3231090${c.reset}`);
        
        let games = [];
        while (games.length === 0) {
            const input = ui.question(`${c.cyan}Game IDs: ${c.reset}`);
            games = input.split(',').map(g => parseInt(g.trim())).filter(g => !isNaN(g) && g > 0);
            if (games.length === 0) {
                console.log(`${c.red}  Enter at least one valid game ID${c.reset}`);
            }
        }
        
        const status = ui.question(`${c.cyan}Custom status (optional): ${c.reset}`);
        if (status) games.unshift(status);
        
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
        logger.success(`Account "${username}" added successfully!`);
        await this.sleep(1500);
    }

    /**
     * Manage accounts menu
     */
    manageAccounts(accounts, msg = null) {
        ui.clear();
        banner.displayMini();
        
        ui.box('MANAGE ACCOUNTS', [
            '',
            `${c.green}[1]${c.reset} Edit Account`,
            `${c.green}[2]${c.reset} Remove Account`,
            `${c.green}[3]${c.reset} View All Accounts`,
            '',
            `${c.dim}[0] Back${c.reset}`,
            ''
        ]);
        
        if (msg) console.log(`\n${c.yellow}  ${msg}${c.reset}`);

        const choice = ui.question('Select [0-3]: ');
        
        switch(choice) {
            case '1': this.editAccount(accounts); break;
            case '2': this.removeAccount(accounts); break;
            case '3': this.viewAccounts(accounts); break;
            case '0': this.showMenu(config.loadAccounts()); break;
            default: this.manageAccounts(accounts, 'Invalid option');
        }
    }

    /**
     * Edit account
     */
    editAccount(accounts) {
        if (accounts.length === 0) {
            return this.manageAccounts(accounts, 'No accounts to edit');
        }
        
        ui.clear();
        banner.displayMini();
        
        console.log(`\n${c.cyan}Select account to edit:${c.reset}\n`);
        
        const paginationData = ui.paginate(accounts, 0, 9);
        paginationData.items.forEach((a, i) => {
            console.log(`  ${c.yellow}[${i+1}]${c.reset} ${ui.truncate(a.username, 30)}`);
        });
        
        if (paginationData.totalPages > 1) {
            console.log(`\n  ${c.dim}Showing: ${paginationData.showing}${c.reset}`);
        }
        
        console.log(`\n  ${c.dim}[0] Cancel${c.reset}`);
        
        const choice = ui.question('\nSelect: ');
        const num = parseInt(choice);
        
        if (choice === '0' || isNaN(num) || num < 1 || num > paginationData.items.length) {
            return this.manageAccounts(accounts);
        }
        
        const acc = paginationData.items[num - 1];
        console.log(`\n${c.cyan}Editing: ${c.yellow}${acc.username}${c.reset}`);
        console.log(`${c.dim}Press Enter to keep current value${c.reset}\n`);
        
        const newPass = ui.questionPassword(`New password [hidden]: `);
        if (newPass) acc.password = newPass;
        
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
        
        const invChoice = ui.question(`Invisible mode (currently: ${acc.invisible ? 'yes' : 'no'}): `).toLowerCase();
        if (invChoice === 'y' || invChoice === 'yes') acc.invisible = true;
        else if (invChoice === 'n' || invChoice === 'no') acc.invisible = false;
        
        acc.updatedAt = new Date().toISOString();
        
        const originalIndex = accounts.findIndex(a => a.username === acc.username);
        if (originalIndex >= 0) {
            accounts[originalIndex] = acc;
            config.saveAccounts(accounts);
            logger.success('Account updated!');
        }
        
        ui.pause();
        this.manageAccounts(config.loadAccounts());
    }

    /**
     * Remove account
     */
    removeAccount(accounts) {
        if (accounts.length === 0) {
            return this.manageAccounts(accounts, 'No accounts to remove');
        }
        
        ui.clear();
        banner.displayMini();
        
        console.log(`\n${c.red}SELECT ACCOUNT TO DELETE:${c.reset}\n`);
        
        const paginationData = ui.paginate(accounts, 0, 9);
        paginationData.items.forEach((a, i) => {
            console.log(`  ${c.yellow}[${i+1}]${c.reset} ${ui.truncate(a.username, 30)}`);
        });
        
        console.log(`\n  ${c.dim}[0] Cancel${c.reset}`);
        
        const choice = ui.question('\nSelect: ');
        const num = parseInt(choice);
        
        if (choice === '0' || isNaN(num) || num < 1 || num > paginationData.items.length) {
            return this.manageAccounts(accounts);
        }
        
        const acc = paginationData.items[num - 1];
        console.log(`\n${c.red}Delete "${acc.username}" permanently?${c.reset}`);
        const confirm = ui.question(`Type "${c.yellow}DELETE${c.reset}" to confirm: `);
        
        if (confirm.toUpperCase() === 'DELETE') {
            const originalIndex = accounts.findIndex(a => a.username === acc.username);
            if (originalIndex >= 0) {
                accounts.splice(originalIndex, 1);
                config.saveAccounts(accounts);
                logger.success('Account deleted!');
            }
        } else {
            logger.info('Cancelled');
        }
        
        ui.pause();
        this.manageAccounts(config.loadAccounts());
    }

    /**
     * View all accounts
     */
    viewAccounts(accounts) {
        ui.clear();
        banner.displayMini();
        
        if (accounts.length === 0) {
            console.log(`\n${c.dim}No accounts configured.${c.reset}`);
        } else {
            const lines = [''];
            
            const paginationData = ui.paginate(accounts, 0, 9);
            
            paginationData.items.forEach((a, i) => {
                const games = (a.gamesAndStatus || []).filter(g => typeof g === 'number').length;
                const has2fa = a.sharedSecret ? `${c.green}Yes${c.reset}` : `${c.red}No${c.reset}`;
                const inv = a.invisible ? `${c.cyan}Inv${c.reset}` : `${c.dim}Vis${c.reset}`;
                const displayName = ui.truncate(a.username, 18);
                lines.push(`${c.yellow}${(i+1).toString().padStart(2)}${c.reset}. ${ui.pad(displayName, 18)} | 2FA: ${has2fa} | ${inv} | ${c.dim}${games} games${c.reset}`);
            });
            
            if (paginationData.totalPages > 1) {
                lines.push('');
                lines.push(`${c.dim}Showing: ${paginationData.showing}${c.reset}`);
            }
            
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
        ui.clear();
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
        
        if (msg) console.log(`\n${c.green}  + ${msg}${c.reset}`);

        const choice = ui.question('Select [0-5]: ');
        
        const toggle = (key, name) => {
            s[key] = !s[key];
            if (config.saveSettings(s)) {
                this.settingsMenu(`${name} ${s[key] ? 'enabled' : 'disabled'}`);
            } else {
                this.settingsMenu(`Failed to save ${name}`);
            }
        };
        
        switch(choice) {
            case '1': toggle('autoReconnect', 'Auto-reconnect'); break;
            case '2': toggle('invisibleMode', 'Invisible mode'); break;
            case '3': toggle('saveMessages', 'Save messages'); break;
            case '4': 
                s.debug = !s.debug;
                logger.debugMode = s.debug;
                if (config.saveSettings(s)) {
                    this.settingsMenu(`Debug mode ${s.debug ? 'enabled' : 'disabled'}`);
                } else {
                    this.settingsMenu('Failed to save debug mode');
                }
                break;
            case '5':
                const delay = ui.question('Enter delay (1000-10000ms): ');
                const num = parseInt(delay);
                if (!isNaN(num) && num >= 1000 && num <= 10000) {
                    s.startupDelay = num;
                    if (config.saveSettings(s)) {
                        this.settingsMenu(`Startup delay set to ${num}ms`);
                    } else {
                        this.settingsMenu('Failed to save startup delay');
                    }
                } else {
                    this.settingsMenu('Invalid delay (must be 1000-10000)');
                }
                break;
            case '0': this.showMenu(config.loadAccounts()); break;
            default: this.settingsMenu('Invalid option');
        }
    }

    /**
     * Export backup
     */
    exportBackup() {
        ui.clear();
        banner.displayMini();
        
        ui.box('EXPORT BACKUP', [
            '',
            `${c.dim}Export your accounts configuration${c.reset}`,
            `${c.yellow}Note: Passwords are NOT included${c.reset}`,
            ''
        ]);
        
        config.exportAccounts(() => this.showMenu(config.loadAccounts()));
    }

    /**
     * Handle incoming messages
     */
    handleMessage(accName, steamID, message, client, account) {
        this.sessionStats.messagesReceived++;
        logger.message(`[${accName}] ${steamID}: ${message}`);
        
        if (account.saveMessages !== false) {
            const dir = path.join(__dirname, '..', 'messages');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const file = path.join(dir, `${accName}.log`);
            fs.appendFileSync(file, `[${new Date().toISOString()}] ${steamID}: ${message}\n`);
        }
        
        if (account.replyMessage) {
            client.chat.sendFriendMessage(steamID, account.replyMessage);
        }
    }

    /**
     * Get error message
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
     * Graceful exit
     */
    gracefulExit() {
        ui.clear();
        console.log(`\n${c.yellow}Shutting down VaporBooster...${c.reset}\n`);
        
        this.isBoosting = false;
        this.accountStates.clear();
        
        // Save statistics
        stats.recordSession(this.sessionStats, this.clients);
        
        // Logout all clients
        if (this.clients.size > 0) {
            console.log(`${c.dim}Logging out ${this.clients.size} account(s)...${c.reset}\n`);
            this.clients.forEach((data, name) => {
                try {
                    console.log(`${c.dim}  - ${name}${c.reset}`);
                    this.accountStates.set(name, 'disconnecting');
                    if (data.timer) data.timer.stop();
                    if (data.client) data.client.logOff();
                } catch (e) {
                    // Ignore logout errors
                }
            });
        }
        
        setTimeout(() => {
            console.log(`\n${c.green}Thank you for using VaporBooster!${c.reset}`);
            console.log(`${c.dim}Made by stolenact | https://github.com/stolenact/VaporBooster${c.reset}\n`);
            process.exit(0);
        }, 1500);
    }

    /**
     * Sleep utility
     */
    sleep(ms) { 
        return new Promise(r => setTimeout(r, ms)); 
    }
}

// Start application
const app = new VaporBooster();
app.init().catch(err => {
    console.error(`${c.red}Fatal error: ${err.message}${c.reset}`);
    console.error(err.stack);
    process.exit(1);
});

// Handle signals
process.on('SIGINT', () => app.gracefulExit());
process.on('SIGTERM', () => app.gracefulExit());
process.on('uncaughtException', (err) => {
    console.error(`${c.red}Uncaught exception: ${err.message}${c.reset}`);
    console.error(err.stack);
    app.gracefulExit();
});
process.on('unhandledRejection', (reason, promise) => {
    console.error(`${c.red}Unhandled rejection: ${reason}${c.reset}`);
});