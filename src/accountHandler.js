const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const { Timer } = require('easytimer.js');
const readline = require('readline-sync');
const fs = require('fs');
const path = require('path');

const c = require('../utils/colors');
const logger = require('../utils/logger');
const stats = require('../utils/stats');
const banner = require('../utils/banner');
const config = require('../utils/configManager');
const gameDB = require('../utils/gameDatabase');

class VaporBooster {
    constructor() {
        this.clients = new Map();
        this.timers = new Map();
        this.sessionStats = {
            startTime: Date.now(),
            totalHoursGained: 0,
            messagesReceived: 0,
            reconnections: 0
        };
    }

    async init() {
        console.clear();
        banner.display();
        
        await this.checkDirectories();
        const accounts = config.loadAccounts();
        
        if (accounts.length === 0) {
            logger.warn('No accounts found in config/accounts.json');
            console.log(`\n${c.yellow}Run setup wizard to add your first account? (y/n)${c.reset}`);
            const answer = readline.question(`${c.cyan}> ${c.reset}`).toLowerCase().trim();
            if (answer === 'y' || answer === 'yes') {
                await this.setupWizard();
                return this.init();
            }
            logger.info('You can manually create config/accounts.json or run the wizard later.');
            process.exit(0);
        }

        this.showMenu(accounts);
    }

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
        const num = parseInt(choice);
        
        if (choice === '0') return this.showMenu(accounts);
        if (isNaN(num) || num < 1 || num > accounts.length) {
            logger.warn('Invalid selection!');
            return this.selectAccount(accounts);
        }
        
        this.loginAccount(accounts[num - 1], num - 1).then(() => {
            this.showActiveStatus();
        });
    }

    async loginAccount(account, index) {
        const client = new SteamUser({
            autoRelogin: true,
            renewRefreshTokens: true,
            dataDirectory: path.join(__dirname, '..', 'accounts_data')
        });

        const timer = new Timer();
        const accName = account.username;

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

            const games = account.gamesAndStatus || [730];
            client.gamesPlayed(games);
            
            const gameCount = games.filter(g => typeof g === 'number').length;
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

        client.on('friendMessage', (steamID, message) => {
            this.handleMessage(accName, steamID, message, client, account);
        });

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
        }
        
        if (account.replyMessage) {
            client.chat.sendFriendMessage(steamID, account.replyMessage);
        }
    }

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

    gracefulExit() {
        console.clear();
        console.log(`\n${c.yellow}Shutting down VaporBooster...${c.reset}\n`);
        
        if (this.clients.size > 0) {
            this.clients.forEach((data, username) => {
                console.log(`${c.dim}  Logging out ${username}...${c.reset}`);
                data.client.logOff();
            });
        }
        
        setTimeout(() => {
            console.log(`\n${c.green}Goodbye!${c.reset}\n`);
            process.exit(0);
        }, 1500);
    }
}

const booster = new VaporBooster();
booster.init().catch(err => {
    console.error(`${c.red}Fatal error: ${err.message}${c.reset}`);
    process.exit(1);
});

process.on('SIGINT', () => booster.gracefulExit());
process.on('SIGTERM', () => booster.gracefulExit());