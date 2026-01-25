/**
 * VaporBooster - ASCII Art Banners
 * Display branded headers and logos
 * 
 * @author stolenact
 * @repository https://github.com/stolenact/VaporBooster
 */

const c = require('./colors');

const VERSION = '3.0.0';

/**
 * Display full ASCII banner
 */
function display() {
    const banner = `
${c.cyan} _   _                        ${c.reset}
${c.cyan}| | | |                       ${c.reset}
${c.cyan}| | | | __ _ _ __   ___  _ __ ${c.reset}
${c.cyan}| | | |/ _\` | '_ \\ / _ \\| '__|${c.reset}
${c.brightCyan}\\ \\_/ / (_| | |_) | (_) | |   ${c.reset}
${c.brightCyan} \\___/ \\__,_| .__/ \\___/|_|   ${c.reset}
${c.blue}            | |  ${c.white}BOOSTER${c.reset}      
${c.blue}            |_|  ${c.dim}v${VERSION}${c.reset}       
`;
    console.log(banner);
    console.log(`${c.dim}${'='.repeat(45)}${c.reset}`);
    console.log(`  ${c.cyan}Steam Hour Booster${c.reset} ${c.dim}by${c.reset} ${c.yellow}stolenact${c.reset}`);
    console.log(`  ${c.dim}https://github.com/stolenact/VaporBooster${c.reset}`);
    console.log(`${c.dim}${'='.repeat(45)}${c.reset}`);
}

/**
 * Display minimal header
 */
function displayMini() {
    console.log(`\n${c.cyan}+--------------------------------------------+${c.reset}`);
    console.log(`${c.cyan}|${c.reset}  ${c.bold}${c.brightCyan}VAPOR${c.white}BOOSTER${c.reset} ${c.dim}v${VERSION}${c.reset}             ${c.green}* Online${c.reset}  ${c.cyan}|${c.reset}`);
    console.log(`${c.cyan}+--------------------------------------------+${c.reset}`);
}

/**
 * Get version string
 */
function getVersion() {
    return VERSION;
}

/**
 * Display credits
 */
function displayCredits() {
    console.log(`\n${c.dim}${'='.repeat(45)}${c.reset}`);
    console.log(`  ${c.cyan}VaporBooster v${VERSION}${c.reset}`);
    console.log(`  ${c.dim}Made by${c.reset} ${c.yellow}stolenact${c.reset}`);
    console.log(`  ${c.dim}GitHub:${c.reset} ${c.blue}github.com/stolenact/VaporBooster${c.reset}`);
    console.log(`${c.dim}${'='.repeat(45)}${c.reset}\n`);
}

module.exports = {
    display,
    displayMini,
    getVersion,
    displayCredits,
    VERSION
};