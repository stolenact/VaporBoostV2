<<<<<<< HEAD
# 🎮 VaporBooster v2.0

```
██╗   ██╗ █████╗ ██████╗  ██████╗ ██████╗ 
██║   ██║██╔══██╗██╔══██╗██╔═══██╗██╔══██╗
██║   ██║███████║██████╔╝██║   ██║██████╔╝
╚██╗ ██╔╝██╔══██║██╔═══╝ ██║   ██║██╔══██╗
 ╚████╔╝ ██║  ██║██║     ╚██████╔╝██║  ██║
  ╚═══╝  ╚═╝  ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝
        ██████╗  ██████╗  ██████╗ ███████╗████████╗███████╗██████╗ 
        ██╔══██╗██╔═══██╗██╔═══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗
        ██████╔╝██║   ██║██║   ██║███████╗   ██║   █████╗  ██████╔╝
        ██╔══██╗██║   ██║██║   ██║╚════██║   ██║   ██╔══╝  ██╔══██╗
        ██████╔╝╚██████╔╝╚██████╔╝███████║   ██║   ███████╗██║  ██║
        ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
```

> **Advanced Steam Hour Booster** with 2FA support, beautiful ASCII UI, statistics tracking, and game database.

---

`(fork from https://github.com/valnssh/vaporBooster <3 )`


## ✨ Features

### 🚀 Core Features
- **Multi-account support** - Boost hours on unlimited accounts simultaneously
- **2FA Support** - Full Steam Guard support (Mobile App & Email)
- **Shared Secret** - Auto-generate 2FA codes with shared secret
- **Auto-reconnect** - Automatically reconnect on disconnection
- **Custom Status** - Set custom "Now Playing" status

### 📊 Statistics & Monitoring
- **Real-time Dashboard** - Live view of all boosting sessions
- **Session Statistics** - Track uptime, messages, reconnections
- **Lifetime Stats** - Historical data across all sessions
- **Per-account Tracking** - Individual stats for each account

### 🎮 Game Database
- **50+ Popular Games** - Pre-loaded database of popular Steam games
- **Search Function** - Search games by name or ID
- **Category Browser** - Browse games by category (FPS, RPG, etc.)
- **Quick Lookup** - Instantly find game IDs

### 💬 Messaging System
- **Message Logging** - Save received messages to files
- **Auto-Reply** - Automatic response to incoming messages
- **Real-time Display** - See messages in console

### 🎨 Beautiful Console UI
- **ASCII Art Banners** - Stunning colored ASCII art
- **Color-coded Output** - Easy to read logs with colors
- **Progress Indicators** - Spinners and progress bars
- **Interactive Menus** - Easy navigation
=======
# 🎮 VaporBooster v3.0

```
 _   _                        
| | | |                       
| | | | __ _ _ __   ___  _ __ 
| | | |/ _` | '_ \ / _ \| '__|
\ \_/ / (_| | |_) | (_) | |   
 \___/ \__,_| .__/ \___/|_|   
            | |  BOOSTER      
            |_|  v3.0.0       
```

> **Advanced Steam Hour Booster** - Multi-account support, invisible mode, 2FA/QR login, real-time statistics, and PM2 production support.

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Steam](https://img.shields.io/badge/Steam-API-black.svg)](https://steamcommunity.com/)

---

## ✨ Features

### Core Features
- **Multi-account boosting** - Boost unlimited accounts simultaneously
- **Invisible mode** - Boost hours while appearing offline
- **2FA Support** - Shared secret auto-generation or manual code entry
- **QR Login** - Approve login from Steam mobile app
- **Auto-reconnect** - Automatic reconnection on disconnection
- **Custom status** - Set "Now Playing" custom text

### New in v3.0
- **Improved UI** - Fixed-width menus that work in any terminal
- **PM2 Support** - Production-ready with ecosystem config
- **Better password handling** - Support for 64+ character passwords
- **Live sidebar** - See active sessions while navigating menus
- **Session statistics** - Track hours, messages, errors in real-time
- **Lifetime stats** - Historical data across all sessions
- **Duplicate prevention** - Can't add same account twice
- **Input validation** - Proper error handling for all inputs
>>>>>>> 894d41f (Updated V3 pre-release)

---

## 📦 Installation

<<<<<<< HEAD
```bash
# Clone the repository
git clone https://github.com/stolenact/vaporboosterv2.git
cd vaporboosterv2
=======
### Prerequisites
- [Node.js](https://nodejs.org/) v16.0.0 or higher
- npm (comes with Node.js)
- (Optional) [PM2](https://pm2.keymetrics.io/) for production

### Quick Start

```bash
# Clone the repository
git clone https://github.com/stolenact/vaporbooster.git
cd vaporbooster
>>>>>>> 894d41f (Updated V3 pre-release)

# Install dependencies
npm install

<<<<<<< HEAD
# Start the booster
npm start
```

---

## ⚙️ Configuration

### Quick Setup (Recommended)
Run the setup wizard on first launch - it will guide you through adding your first account.

### Manual Configuration
Edit `config/accounts.json`:

```json
[
    {
        "username": "your_username",
        "password": "your_password",
        "sharedSecret": "",
        "enableStatus": true,
        "gamesAndStatus": ["🎮 Boosting", 730, 440, 570],
        "replyMessage": "AFK - Will respond later!",
        "receiveMessages": true,
        "saveMessages": true
    }
]
```

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `username` | string | Steam account username |
| `password` | string | Steam account password |
| `sharedSecret` | string | 2FA shared secret (optional) |
| `enableStatus` | boolean | Show online status (false = invisible) |
| `gamesAndStatus` | array | Games to boost + custom status |
| `replyMessage` | string | Auto-reply message (empty = disabled) |
| `receiveMessages` | boolean | Log received messages |
| `saveMessages` | boolean | Save messages to file |

---

## 🎯 Popular Game IDs

| Game | ID |
|------|-----|
| Counter-Strike 2 | 730 |
| Team Fortress 2 | 440 |
| Dota 2 | 570 |
| PUBG | 578080 |
| Rust | 252490 |
| GTA V | 271590 |
| Apex Legends | 1172470 |
| Elden Ring | 1245620 |

*Use the built-in Game Database Browser for 50+ more games!*

---

## 🖥️ Usage

### Main Menu
```
╔════════════════════════════════════════════════════════════╗
║              VAPOR BOOSTER - MAIN MENU                     ║
╠════════════════════════════════════════════════════════════╣
║  [1] Start All Accounts                                    ║
║  [2] Start Single Account                                  ║
║  [3] Account Manager                                       ║
║  [4] Game Database Browser                                 ║
║  [5] Statistics Dashboard                                  ║
║  [6] Settings                                              ║
║  [7] Setup Wizard                                          ║
║  [0] Exit                                                  ║
╚════════════════════════════════════════════════════════════╝
```

### Keyboard Shortcuts (While Boosting)
- `Q` - Quit and logout all accounts
- `M` - Return to main menu
- `S` - View statistics dashboard
- `R` - Refresh display

=======
# Start the application
npm start
```

### PM2 Installation (Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
npm run pm2:start

# View logs
npm run pm2:logs

# Stop
npm run pm2:stop
```

>>>>>>> 894d41f (Updated V3 pre-release)
---

## 📁 Project Structure

```
vaporbooster/
├── src/
<<<<<<< HEAD
│   └── accountHandler.js    # Main application
├── utils/
│   ├── colors.js           # ANSI color codes
│   ├── logger.js           # Logging system
│   ├── banner.js           # ASCII art banners
│   ├── configManager.js    # Configuration handler
│   ├── stats.js            # Statistics tracking
│   └── gameDatabase.js     # Game ID database
├── config/
│   ├── accounts.json       # Account configuration
│   └── settings.json       # App settings
├── logs/                   # Log files
├── messages/               # Saved messages
├── accounts_data/          # Steam session data
└── package.json
=======
│   └── accountHandler.js     # Main application entry
├── utils/
│   ├── colors.js             # ANSI color codes
│   ├── logger.js             # Logging system
│   ├── banner.js             # ASCII art banners
│   ├── configManager.js      # Config handling
│   ├── stats.js              # Statistics tracking
│   └── ui.js                 # UI components
├── config/
│   ├── accounts.json         # Your accounts (gitignored)
│   ├── accounts.example.json # Example config
│   └── settings.json         # App settings
├── logs/                     # Log files
├── messages/                 # Saved chat messages
├── accounts_data/            # Steam session data
├── ecosystem.config.js       # PM2 configuration
├── package.json
└── README.md
>>>>>>> 894d41f (Updated V3 pre-release)
```

---

<<<<<<< HEAD
## 🔒 Security Notes

- Passwords are stored locally in `config/accounts.json`
- Never share your configuration files
- Use shared secrets instead of manual 2FA when possible
- Session tokens are stored in `accounts_data/`

---

## ⚠️ Disclaimer

This tool is for educational purposes only. Use at your own risk. Boosting hours may violate Steam's Terms of Service.
=======
## ⚙️ Configuration

### Adding Accounts

**Option 1: Setup Wizard (Recommended)**
```
Run the app and select option [3] Add New Account
```

**Option 2: Manual Configuration**

Create `config/accounts.json`:

```json
[
    {
        "username": "your_username",
        "password": "your_password",
        "sharedSecret": "",
        "invisible": true,
        "gamesAndStatus": ["Custom Status", 730, 440],
        "replyMessage": "AFK",
        "saveMessages": true
    }
]
```

### Configuration Options

| Field | Type | Description |
|-------|------|-------------|
| `username` | string | Steam account username |
| `password` | string | Steam account password (supports 64+ chars) |
| `sharedSecret` | string | 2FA shared secret for auto-code generation |
| `invisible` | boolean | `true` = boost while appearing offline |
| `gamesAndStatus` | array | First string = status, rest = game IDs |
| `replyMessage` | string | Auto-reply to messages (empty = disabled) |
| `saveMessages` | boolean | Save received messages to file |

### Settings

Edit via the Settings menu or `config/settings.json`:

```json
{
    "autoReconnect": true,
    "invisibleMode": false,
    "saveMessages": true,
    "debug": false,
    "startupDelay": 2000
}
```

---

## 🎮 Finding Game IDs

Game IDs are found in the Steam store URL:

```
https://store.steampowered.com/app/730/Counter-Strike_2/
                                    ^^^
                                  Game ID
```

### Popular Game IDs

| Game | ID |
|------|-----|
| Counter-Strike 2 | 730 |
| Dota 2 | 570 |
| Team Fortress 2 | 440 |
| PUBG | 578080 |
| Rust | 252490 |
| GTA V | 271590 |
| Apex Legends | 1172470 |
| Elden Ring | 1245620 |
| Palworld | 2358720 |

---

## 🖥️ Usage

### Main Menu

```
┌────────────────────────────────────────────────┐
│ MAIN MENU                                      │
├────────────────────────────────────────────────┤
│                                                │
│  [1] Start All Accounts (2)                    │
│  [2] Start Single Account                      │
│  [3] Add New Account                           │
│  [4] Manage Accounts                           │
│  [5] View Statistics                           │
│  [6] Settings                                  │
│                                                │
│  [0] Exit                                      │
│                                                │
└────────────────────────────────────────────────┘
```

### Keyboard Shortcuts (While Boosting)

| Key | Action |
|-----|--------|
| `M` | Return to main menu |
| `S` | View statistics |
| `Q` | Quit application |

### Login Methods

1. **Password + 2FA Code** - Enter code manually when prompted
2. **Password + Shared Secret** - Auto-generates 2FA codes
3. **Steam App Approval** - Type `wait` when prompted, then approve in Steam app

---

## 🔒 Security

### Best Practices

1. **Never share** your `config/accounts.json` file
2. **Use `.gitignore`** to exclude sensitive files (already configured)
3. **Shared secrets** are more secure than manual 2FA
4. **Export feature** doesn't include passwords

### File Permissions

```bash
# Linux/Mac - Restrict config access
chmod 600 config/accounts.json
```

---

## 🚀 PM2 Production Usage

### Commands

```bash
# Start
pm2 start ecosystem.config.js

# Status
pm2 status

# Logs
pm2 logs vaporbooster

# Restart
pm2 restart vaporbooster

# Stop
pm2 stop vaporbooster

# Delete from PM2
pm2 delete vaporbooster

# Auto-start on boot
pm2 startup
pm2 save
```

### Monitoring

```bash
# Real-time monitoring
pm2 monit

# Web dashboard
pm2 plus
```

---

## 🐛 Troubleshooting

### Common Issues

**"Invalid Password"**
- Check password is correct
- Check for special characters that might need escaping

**"Rate Limited"**
- Wait 30 minutes before trying again
- Don't restart the app repeatedly

**"Steam Guard Required"**
- Add shared secret for automatic codes
- Or enter code manually when prompted

**Menu looks broken**
- Increase terminal width to at least 50 characters
- Use a modern terminal (Windows Terminal, iTerm2, etc.)

### Debug Mode

Enable debug logging in Settings menu or:

```json
// config/settings.json
{
    "debug": true
}
```

---

## 📝 Changelog

### v3.0.0
- Complete rewrite with improved architecture
- Fixed-width UI for better compatibility
- PM2 support for production deployment
- Invisible boosting mode
- Improved password handling (64+ chars)
- Live session sidebar
- Better statistics tracking
- Duplicate account prevention
- Input validation throughout

### v2.0.0
- Multi-account support
- 2FA support
- Statistics dashboard
- Message logging

### v1.0.0
- Initial release
>>>>>>> 894d41f (Updated V3 pre-release)

---

## 📄 License

<<<<<<< HEAD
MIT License - See LICENSE file for details.

---

**Made with ❤️ for the Steam community**
=======
MIT License - See [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

This software is for educational purposes only. Using this tool may violate Steam's Terms of Service. Use at your own risk. The authors are not responsible for any consequences resulting from the use of this software.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

**Made with ❤️ for the Steam community**
>>>>>>> 894d41f (Updated V3 pre-release)
