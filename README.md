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

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vaporbooster.git
cd vaporbooster

# Install dependencies
npm install

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

---

## 📁 Project Structure

```
vaporbooster/
├── src/
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
```

---

## 🔒 Security Notes

- Passwords are stored locally in `config/accounts.json`
- Never share your configuration files
- Use shared secrets instead of manual 2FA when possible
- Session tokens are stored in `accounts_data/`

---

## ⚠️ Disclaimer

This tool is for educational purposes only. Use at your own risk. Boosting hours may violate Steam's Terms of Service.

---

## 📄 License

MIT License - See LICENSE file for details.

---

**Made with ❤️ for the Steam community**