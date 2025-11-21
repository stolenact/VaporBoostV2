const c = require('./colors');

const VERSION = '2.0.0';

module.exports = {
    display() {
        const banner = `
${c.cyan}██╗   ██╗ █████╗ ██████╗  ██████╗ ██████╗ ${c.reset}
${c.cyan}██║   ██║██╔══██╗██╔══██╗██╔═══██╗██╔══██╗${c.reset}
${c.brightCyan}██║   ██║███████║██████╔╝██║   ██║██████╔╝${c.reset}
${c.brightCyan}╚██╗ ██╔╝██╔══██║██╔═══╝ ██║   ██║██╔══██╗${c.reset}
${c.blue} ╚████╔╝ ██║  ██║██║     ╚██████╔╝██║  ██║${c.reset}
${c.blue}  ╚═══╝  ╚═╝  ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝${c.reset}
                                          
${c.white}██████╗  ██████╗  ██████╗ ███████╗████████╗███████╗██████╗ ${c.reset}
${c.white}██╔══██╗██╔═══██╗██╔═══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗${c.reset}
${c.gray}██████╔╝██║   ██║██║   ██║███████╗   ██║   █████╗  ██████╔╝${c.reset}
${c.gray}██╔══██╗██║   ██║██║   ██║╚════██║   ██║   ██╔══╝  ██╔══██╗${c.reset}
${c.dim}██████╔╝╚██████╔╝╚██████╔╝███████║   ██║   ███████╗██║  ██║${c.reset}
${c.dim}╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝${c.reset}
`;
        console.log(banner);
        console.log(`${c.dim}═══════════════════════════════════════════════════════════${c.reset}`);
        console.log(`  ${c.cyan}Version:${c.reset} ${c.yellow}${VERSION}${c.reset}  ${c.dim}│${c.reset}  ${c.cyan}Steam Hour Booster${c.reset}  ${c.dim}│${c.reset}  ${c.green}Ready${c.reset}`);
        console.log(`${c.dim}═══════════════════════════════════════════════════════════${c.reset}`);
    },

    displayMini() {
        console.log(`\n${c.cyan}╔═══════════════════════════════════════════════════════════╗${c.reset}`);
        console.log(`${c.cyan}║${c.reset}  ${c.bold}${c.brightCyan}VAPOR${c.reset}${c.white}BOOSTER${c.reset} ${c.dim}v${VERSION}${c.reset}                 ${c.green}● Online${c.reset}         ${c.cyan}║${c.reset}`);
        console.log(`${c.cyan}╚═══════════════════════════════════════════════════════════╝${c.reset}`);
    },

    displayLoading() {
        const frames = [
            `${c.cyan}[    ]${c.reset} Loading...`,
            `${c.cyan}[=   ]${c.reset} Loading...`,
            `${c.cyan}[==  ]${c.reset} Loading...`,
            `${c.cyan}[=== ]${c.reset} Loading...`,
            `${c.cyan}[====]${c.reset} Loading...`,
            `${c.cyan}[ ===]${c.reset} Loading...`,
            `${c.cyan}[  ==]${c.reset} Loading...`,
            `${c.cyan}[   =]${c.reset} Loading...`,
        ];
        
        let i = 0;
        const interval = setInterval(() => {
            process.stdout.write(`\r${frames[i]}`);
            i = (i + 1) % frames.length;
        }, 100);
        
        return () => {
            clearInterval(interval);
            process.stdout.write(`\r${c.green}[DONE]${c.reset} Loaded!   \n`);
        };
    },

    steamLogo() {
        return `
${c.blue}        ▄▄▄▄▄▄▄▄▄▄▄▄▄        ${c.reset}
${c.blue}      ▄█████████████████▄    ${c.reset}
${c.blue}    ▄███████████████████████▄${c.reset}
${c.brightBlue}   ████████████████████████████${c.reset}
${c.brightBlue}  ██████████████████████████████${c.reset}
${c.brightBlue}  ████████${c.white}▀▀▀▀▀▀▀▀${c.brightBlue}████████████${c.reset}
${c.cyan}  ███████${c.white}██████████${c.cyan}███████████${c.reset}
${c.cyan}  ███████${c.white}██████████${c.cyan}███████████${c.reset}
${c.cyan}  ████████${c.white}▄▄▄▄▄▄▄▄${c.cyan}████████████${c.reset}
${c.brightCyan}   ████████████████████████████${c.reset}
${c.brightCyan}    ██████████████████████████${c.reset}
${c.brightCyan}      ████████████████████████${c.reset}
${c.white}        ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀    ${c.reset}
`;
    },

    credits() {
        console.log(`
${c.dim}────────────────────────────────────────${c.reset}
${c.cyan}  VaporBooster v${VERSION}${c.reset}
${c.dim}  Enhanced Steam Hour Booster${c.reset}
${c.dim}  NodeJS ${process.version}${c.reset}
${c.dim}────────────────────────────────────────${c.reset}
`);
    }
};