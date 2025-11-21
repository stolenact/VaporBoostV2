const c = require('./colors');
const readline = require('readline-sync');

// Massive Steam games database
const GAMES = {
    // === FPS / SHOOTERS ===
    730: { name: 'Counter-Strike 2', cat: 'FPS', pop: true, players: '1.2M' },
    440: { name: 'Team Fortress 2', cat: 'FPS', pop: true, players: '100K' },
    578080: { name: 'PUBG: BATTLEGROUNDS', cat: 'Battle Royale', pop: true, players: '400K' },
    1172470: { name: 'Apex Legends', cat: 'Battle Royale', pop: true, players: '300K' },
    359550: { name: 'Rainbow Six Siege', cat: 'FPS', pop: true, players: '80K' },
    1938090: { name: 'Call of Duty', cat: 'FPS', pop: true, players: '100K' },
    1085660: { name: 'Destiny 2', cat: 'FPS', pop: true, players: '90K' },
    393380: { name: 'Squad', cat: 'FPS', pop: false, players: '15K' },
    107410: { name: 'Arma 3', cat: 'FPS', pop: false, players: '20K' },
    218620: { name: 'Payday 2', cat: 'FPS', pop: true, players: '40K' },
    1517290: { name: 'Battlefield 2042', cat: 'FPS', pop: false, players: '10K' },
    10180: { name: 'Call of Duty: MW2 (2009)', cat: 'FPS', pop: false, players: '2K' },
    42690: { name: 'Call of Duty: MW3', cat: 'FPS', pop: false, players: '3K' },
    236390: { name: 'War Thunder', cat: 'Simulation', pop: true, players: '80K' },
    444090: { name: 'Payday 3', cat: 'FPS', pop: false, players: '5K' },
    548430: { name: 'Deep Rock Galactic', cat: 'FPS', pop: true, players: '25K' },
    1240440: { name: 'Halo Infinite', cat: 'FPS', pop: true, players: '15K' },
    2379780: { name: 'Call of Duty: MW3 (2023)', cat: 'FPS', pop: true, players: '50K' },
    
    // === MOBA / STRATEGY ===
    570: { name: 'Dota 2', cat: 'MOBA', pop: true, players: '700K' },
    394360: { name: 'Hearts of Iron IV', cat: 'Strategy', pop: true, players: '50K' },
    281990: { name: 'Stellaris', cat: 'Strategy', pop: true, players: '35K' },
    8930: { name: 'Civilization V', cat: 'Strategy', pop: true, players: '30K' },
    289070: { name: 'Civilization VI', cat: 'Strategy', pop: true, players: '45K' },
    1158310: { name: 'Crusader Kings III', cat: 'Strategy', pop: true, players: '30K' },
    236850: { name: 'Europa Universalis IV', cat: 'Strategy', pop: false, players: '20K' },
    1466860: { name: 'Age of Empires IV', cat: 'Strategy', pop: true, players: '20K' },
    813780: { name: 'Age of Empires II DE', cat: 'Strategy', pop: true, players: '25K' },
    1086940: { name: 'Baldur\'s Gate 3', cat: 'RPG', pop: true, players: '150K' },
    
    // === RPG / ADVENTURE ===
    1245620: { name: 'Elden Ring', cat: 'RPG', pop: true, players: '100K' },
    292030: { name: 'The Witcher 3', cat: 'RPG', pop: true, players: '60K' },
    1091500: { name: 'Cyberpunk 2077', cat: 'RPG', pop: true, players: '80K' },
    489830: { name: 'Skyrim Special Edition', cat: 'RPG', pop: true, players: '40K' },
    374320: { name: 'Dark Souls III', cat: 'RPG', pop: true, players: '30K' },
    570940: { name: 'Dark Souls Remastered', cat: 'RPG', pop: false, players: '10K' },
    814380: { name: 'Sekiro', cat: 'RPG', pop: true, players: '15K' },
    1888930: { name: 'Armored Core VI', cat: 'Action', pop: true, players: '20K' },
    1826330: { name: 'Hogwarts Legacy', cat: 'RPG', pop: true, players: '30K' },
    367500: { name: 'Dragons Dogma', cat: 'RPG', pop: false, players: '10K' },
    2054970: { name: 'Dragons Dogma 2', cat: 'RPG', pop: true, players: '25K' },
    582010: { name: 'Monster Hunter World', cat: 'RPG', pop: true, players: '50K' },
    1446780: { name: 'Monster Hunter Rise', cat: 'RPG', pop: true, players: '30K' },
    
    // === SURVIVAL / SANDBOX ===
    252490: { name: 'Rust', cat: 'Survival', pop: true, players: '150K' },
    346110: { name: 'ARK: Survival Evolved', cat: 'Survival', pop: true, players: '80K' },
    2399830: { name: 'ARK: Survival Ascended', cat: 'Survival', pop: true, players: '50K' },
    304930: { name: 'Unturned', cat: 'Survival', pop: false, players: '30K' },
    251570: { name: '7 Days to Die', cat: 'Survival', pop: true, players: '40K' },
    242760: { name: 'The Forest', cat: 'Survival', pop: true, players: '30K' },
    1326470: { name: 'Sons of the Forest', cat: 'Survival', pop: true, players: '35K' },
    892970: { name: 'Valheim', cat: 'Survival', pop: true, players: '40K' },
    105600: { name: 'Terraria', cat: 'Sandbox', pop: true, players: '50K' },
    413150: { name: 'Stardew Valley', cat: 'Simulation', pop: true, players: '60K' },
    526870: { name: 'Satisfactory', cat: 'Simulation', pop: true, players: '30K' },
    427520: { name: 'Factorio', cat: 'Simulation', pop: true, players: '25K' },
    1366540: { name: 'Dyson Sphere Program', cat: 'Simulation', pop: false, players: '10K' },
    2358720: { name: 'Palworld', cat: 'Survival', pop: true, players: '200K' },
    1623730: { name: 'Palworld', cat: 'Survival', pop: true, players: '200K' },
    
    // === ACTION / OPEN WORLD ===
    1174180: { name: 'Red Dead Redemption 2', cat: 'Action', pop: true, players: '50K' },
    271590: { name: 'Grand Theft Auto V', cat: 'Action', pop: true, players: '150K' },
    1817070: { name: 'Marvel Spider-Man', cat: 'Action', pop: true, players: '25K' },
    1817190: { name: 'Marvel Spider-Man MM', cat: 'Action', pop: false, players: '10K' },
    2138710: { name: 'Marvel Spider-Man 2', cat: 'Action', pop: true, players: '20K' },
    1172620: { name: 'Sea of Thieves', cat: 'Adventure', pop: true, players: '40K' },
    275850: { name: 'No Man\'s Sky', cat: 'Exploration', pop: true, players: '20K' },
    1245040: { name: 'God of War', cat: 'Action', pop: true, players: '20K' },
    2322010: { name: 'God of War Ragnarok', cat: 'Action', pop: true, players: '30K' },
    1593500: { name: 'Ghost of Tsushima', cat: 'Action', pop: true, players: '30K' },
    1942280: { name: 'Horizon Forbidden West', cat: 'Action', pop: true, players: '15K' },
    1151640: { name: 'Horizon Zero Dawn', cat: 'Action', pop: true, players: '15K' },
    
    // === HORROR ===
    381210: { name: 'Dead by Daylight', cat: 'Horror', pop: true, players: '60K' },
    739630: { name: 'Phasmophobia', cat: 'Horror', pop: true, players: '30K' },
    1966720: { name: 'Lethal Company', cat: 'Horror', pop: true, players: '100K' },
    2050650: { name: 'Resident Evil 4', cat: 'Horror', pop: true, players: '15K' },
    418370: { name: 'Resident Evil 7', cat: 'Horror', pop: true, players: '10K' },
    883710: { name: 'Resident Evil 2', cat: 'Horror', pop: true, players: '15K' },
    952060: { name: 'Resident Evil 3', cat: 'Horror', pop: false, players: '5K' },
    1196590: { name: 'Resident Evil Village', cat: 'Horror', pop: true, players: '10K' },
    
    // === RACING / SPORTS ===
    1293830: { name: 'Forza Horizon 5', cat: 'Racing', pop: true, players: '35K' },
    2440510: { name: 'Forza Motorsport', cat: 'Racing', pop: true, players: '10K' },
    244210: { name: 'Assetto Corsa', cat: 'Racing', pop: true, players: '15K' },
    805550: { name: 'Assetto Corsa Competizione', cat: 'Racing', pop: true, players: '10K' },
    252950: { name: 'Rocket League', cat: 'Sports', pop: true, players: '100K' },
    2369390: { name: 'EA Sports FC 24', cat: 'Sports', pop: true, players: '30K' },
    1811260: { name: 'EA Sports FC 25', cat: 'Sports', pop: true, players: '40K' },
    1551360: { name: 'Forza Horizon 4', cat: 'Racing', pop: true, players: '20K' },
    
    // === PARTY / CASUAL ===
    945360: { name: 'Among Us', cat: 'Party', pop: true, players: '20K' },
    1599340: { name: 'Lost Ark', cat: 'MMORPG', pop: true, players: '50K' },
    431960: { name: 'Wallpaper Engine', cat: 'Utility', pop: true, players: '80K' },
    1284210: { name: 'It Takes Two', cat: 'Co-op', pop: true, players: '15K' },
    814380: { name: 'Sekiro', cat: 'Action', pop: true, players: '20K' },
    588650: { name: 'Dead Cells', cat: 'Roguelike', pop: true, players: '15K' },
    250900: { name: 'Binding of Isaac Rebirth', cat: 'Roguelike', pop: true, players: '20K' },
    1145360: { name: 'Hades', cat: 'Roguelike', pop: true, players: '20K' },
    2776900: { name: 'Hades II', cat: 'Roguelike', pop: true, players: '50K' },
    367520: { name: 'Hollow Knight', cat: 'Metroidvania', pop: true, players: '15K' },
    
    // === INDIE / OTHER ===
    620: { name: 'Portal 2', cat: 'Puzzle', pop: true, players: '15K' },
    400: { name: 'Portal', cat: 'Puzzle', pop: true, players: '5K' },
    220: { name: 'Half-Life 2', cat: 'FPS', pop: true, players: '10K' },
    70: { name: 'Half-Life', cat: 'FPS', pop: true, players: '5K' },
    546560: { name: 'Half-Life: Alyx', cat: 'VR', pop: true, players: '3K' },
    4000: { name: 'Garry\'s Mod', cat: 'Sandbox', pop: true, players: '40K' },
    255710: { name: 'Cities: Skylines', cat: 'Simulation', pop: true, players: '30K' },
    949230: { name: 'Cities: Skylines II', cat: 'Simulation', pop: false, players: '10K' },
    294100: { name: 'RimWorld', cat: 'Simulation', pop: true, players: '30K' },
    1149460: { name: 'Raft', cat: 'Survival', pop: true, players: '15K' },
    1222670: { name: 'The Sims 4', cat: 'Simulation', pop: true, players: '40K' },
};

class GameDatabase {
    constructor() {
        this.games = GAMES;
        this.categories = this.getCategories();
    }

    getCategories() {
        const cats = new Set();
        Object.values(this.games).forEach(g => cats.add(g.cat));
        return Array.from(cats).sort();
    }

    search(query) {
        const q = query.toLowerCase();
        const results = [];
        
        for (const [id, game] of Object.entries(this.games)) {
            if (game.name.toLowerCase().includes(q) || id.includes(q)) {
                results.push({ id: parseInt(id), ...game });
            }
        }
        
        return results.sort((a, b) => (b.pop ? 1 : 0) - (a.pop ? 1 : 0));
    }

    getByCategory(category) {
        const results = [];
        for (const [id, game] of Object.entries(this.games)) {
            if (game.cat === category) {
                results.push({ id: parseInt(id), ...game });
            }
        }
        return results.sort((a, b) => a.name.localeCompare(b.name));
    }

    getPopular() {
        const results = [];
        for (const [id, game] of Object.entries(this.games)) {
            if (game.pop) {
                results.push({ id: parseInt(id), ...game });
            }
        }
        return results.sort((a, b) => a.name.localeCompare(b.name));
    }

    getGame(id) {
        return this.games[id] ? { id: parseInt(id), ...this.games[id] } : null;
    }

    browse(callback) {
        this.mainCallback = callback;
        this.showBrowserMenu();
    }

    showBrowserMenu(errorMsg = null) {
        console.clear();
        
        const totalGames = Object.keys(this.games).length;
        const totalCats = this.categories.length;
        
        console.log(`
${c.cyan}+============================================================+${c.reset}
${c.cyan}|${c.reset}              ${c.bold}GAME DATABASE BROWSER${c.reset}                       ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}           ${c.dim}${totalGames} games in ${totalCats} categories${c.reset}                       ${c.cyan}|${c.reset}
${c.cyan}+============================================================+${c.reset}
${c.cyan}|${c.reset}                                                            ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}  ${c.green}[1]${c.reset} Search by Name                                      ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}  ${c.green}[2]${c.reset} Browse by Category                                  ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}  ${c.green}[3]${c.reset} Popular Games                                       ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}  ${c.green}[4]${c.reset} Lookup by ID                                        ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}  ${c.green}[5]${c.reset} Show All Games                                      ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}                                                            ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}  ${c.red}[0]${c.reset} Back to Main Menu                                   ${c.cyan}|${c.reset}
${c.cyan}|${c.reset}                                                            ${c.cyan}|${c.reset}
${c.cyan}+============================================================+${c.reset}`);

        if (errorMsg) {
            console.log(`\n${c.red}  ! ${errorMsg}${c.reset}`);
        }
        
        const choice = readline.question(`\n${c.cyan}Select [0-5]: ${c.reset}`).trim();
        
        switch(choice) {
            case '1': this.searchUI(); break;
            case '2': this.categoryUI(); break;
            case '3': this.displayGames(this.getPopular(), 'Popular Games'); break;
            case '4': this.lookupUI(); break;
            case '5': this.displayAllGames(); break;
            case '0': 
                if (this.mainCallback) this.mainCallback();
                return;
            default:
                this.showBrowserMenu('Invalid option! Please select 0-5');
        }
    }

    searchUI() {
        console.clear();
        console.log(`\n${c.cyan}+--- SEARCH GAMES ---+${c.reset}\n`);
        
        const query = readline.question(`${c.cyan}Enter game name: ${c.reset}`).trim();
        
        if (!query) {
            return this.showBrowserMenu('Search query cannot be empty!');
        }
        
        const results = this.search(query);
        
        if (results.length === 0) {
            console.log(`\n${c.yellow}No games found matching "${query}"${c.reset}`);
            console.log(`${c.dim}Tip: Try a shorter search term${c.reset}`);
            readline.question(`\n${c.dim}Press Enter to continue...${c.reset}`);
            return this.showBrowserMenu();
        }
        
        this.displayGames(results, `Search: "${query}"`);
    }

    categoryUI() {
        console.clear();
        console.log(`\n${c.cyan}+--- SELECT CATEGORY ---+${c.reset}\n`);
        
        this.categories.forEach((cat, i) => {
            const count = this.getByCategory(cat).length;
            console.log(`  ${c.yellow}[${(i + 1).toString().padStart(2)}]${c.reset} ${cat.padEnd(20)} ${c.dim}(${count} games)${c.reset}`);
        });
        
        console.log(`\n  ${c.dim}[0] Back${c.reset}\n`);
        
        const choice = readline.question(`${c.cyan}Select category: ${c.reset}`).trim();
        const num = parseInt(choice);
        
        if (choice === '0') return this.showBrowserMenu();
        if (isNaN(num) || num < 1 || num > this.categories.length) {
            return this.categoryUI();
        }
        
        const category = this.categories[num - 1];
        this.displayGames(this.getByCategory(category), category);
    }

    lookupUI() {
        console.clear();
        console.log(`\n${c.cyan}+--- LOOKUP GAME BY ID ---+${c.reset}\n`);
        
        const id = readline.question(`${c.cyan}Enter game ID: ${c.reset}`).trim();
        const num = parseInt(id);
        
        if (isNaN(num) || num < 1) {
            console.log(`\n${c.red}Invalid game ID!${c.reset}`);
            readline.question(`\n${c.dim}Press Enter to continue...${c.reset}`);
            return this.showBrowserMenu();
        }
        
        const game = this.getGame(num);
        
        console.clear();
        
        if (game) {
            console.log(`
${c.green}+==========================================+${c.reset}
${c.green}|${c.reset} ${c.bold}${game.name.substring(0, 40).padEnd(40)}${c.reset} ${c.green}|${c.reset}
${c.green}+==========================================+${c.reset}
${c.green}|${c.reset} ID:        ${c.yellow}${String(game.id).padEnd(28)}${c.reset} ${c.green}|${c.reset}
${c.green}|${c.reset} Category:  ${c.cyan}${game.cat.padEnd(28)}${c.reset} ${c.green}|${c.reset}
${c.green}|${c.reset} Popular:   ${game.pop ? c.green + 'Yes' : c.red + 'No '}${c.reset}${' '.repeat(25)} ${c.green}|${c.reset}
${c.green}|${c.reset} Players:   ${c.magenta}~${(game.players || 'N/A').padEnd(27)}${c.reset} ${c.green}|${c.reset}
${c.green}+==========================================+${c.reset}
`);
        } else {
            console.log(`\n${c.yellow}Game ID ${num} not in database${c.reset}`);
            console.log(`${c.dim}Note: This ID might still be valid on Steam!${c.reset}`);
            console.log(`${c.dim}You can use any valid Steam App ID for boosting.${c.reset}`);
        }
        
        readline.question(`\n${c.dim}Press Enter to continue...${c.reset}`);
        this.showBrowserMenu();
    }

    displayGames(games, title) {
        const pageSize = 15;
        let page = 0;
        const totalPages = Math.ceil(games.length / pageSize);
        
        const showPage = () => {
            console.clear();
            
            console.log(`\n${c.cyan}+================================================================+${c.reset}`);
            console.log(`${c.cyan}|${c.reset} ${c.bold}${title.padEnd(40)}${c.reset} ${c.dim}Page ${page + 1}/${totalPages}${c.reset}        ${c.cyan}|${c.reset}`);
            console.log(`${c.cyan}+================================================================+${c.reset}`);
            console.log(`${c.cyan}|${c.reset}  ${c.dim}ID${c.reset}       | ${c.dim}Name${c.reset}                             | ${c.dim}Category${c.reset}   ${c.cyan}|${c.reset}`);
            console.log(`${c.cyan}+----------+----------------------------------+------------+${c.reset}`);
            
            const start = page * pageSize;
            const end = Math.min(start + pageSize, games.length);
            
            for (let i = start; i < end; i++) {
                const g = games[i];
                const pop = g.pop ? `${c.yellow}*${c.reset}` : ' ';
                const idStr = String(g.id).padEnd(7);
                const nameStr = g.name.substring(0, 32).padEnd(32);
                const catStr = g.cat.substring(0, 10).padEnd(10);
                console.log(`${c.cyan}|${c.reset} ${pop}${c.green}${idStr}${c.reset} | ${nameStr} | ${c.dim}${catStr}${c.reset} ${c.cyan}|${c.reset}`);
            }
            
            console.log(`${c.cyan}+================================================================+${c.reset}`);
            console.log(`${c.dim}  [N] Next   [P] Previous   [B] Back   ${c.yellow}*${c.reset}${c.dim} = Popular${c.reset}`);
            
            const action = readline.question(`\n${c.cyan}> ${c.reset}`).toLowerCase().trim();
            
            if (action === 'n' && page < totalPages - 1) {
                page++;
                showPage();
            } else if (action === 'p' && page > 0) {
                page--;
                showPage();
            } else if (action === 'b' || action === '0') {
                this.showBrowserMenu();
            } else {
                showPage();
            }
        };
        
        showPage();
    }

    displayAllGames() {
        const all = Object.entries(this.games).map(([id, g]) => ({
            id: parseInt(id),
            ...g
        })).sort((a, b) => a.name.localeCompare(b.name));
        
        this.displayGames(all, `All Games (${all.length} total)`);
    }
}

module.exports = new GameDatabase();