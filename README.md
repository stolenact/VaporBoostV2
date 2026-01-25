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

> **Advanced Steam Hour Booster** with enterprise security, QR login, invisible mode, and comprehensive statistics.

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Author](https://img.shields.io/badge/Author-stolenact-blue.svg)](https://github.com/stolenact)

---

## ⚠️ IMPORTANT LEGAL DISCLAIMER

**READ THIS BEFORE USING**

This software is provided for **educational purposes only**. Using this tool **WILL violate**:
- Steam's Terms of Service
- Steam Subscriber Agreement  
- Potentially anti-cheat policies

**By using this software you acknowledge:**
- ⚠️ Your Steam account(s) **may be permanently banned**
- ⚠️ You use this tool **entirely at your own risk**
- ⚠️ The author (stolenact) bears **NO responsibility** for any consequences
- ⚠️ You have read and understood Steam's Terms of Service

**STRONGLY RECOMMENDED**: Use test/alt accounts only!

---

## ✨ Key Features

### 🔒 Security First
- **AES-256-GCM Encryption** for sensitive data
- **Input validation** and sanitization throughout
- **Rate limiting** prevents Steam API abuse
- **Secure file permissions** (600/700 automatically set)
- **No hardcoded secrets** - environment variables supported
- **Prototype pollution** protection

### 🚀 Advanced Features  
- **Multi-account** simultaneous boosting
- **Invisible mode** (boost while appearing offline)
- **QR/App login** support (scan QR or approve in Steam app) ✅ **WORKING!**
- **Auto-reconnect** with exponential backoff
- **Real-time statistics** tracking
- **Message logging** and auto-reply
- **State persistence** across restarts
- **Automatic backups** with rotation

### 🐛 All Known Bugs FIXED
- ✅ QR login now fully functional
- ✅ Table UI works with 9+ accounts (pagination)
- ✅ Long usernames display correctly
- ✅ No more random "?" characters (pure ASCII)
- ✅ Statistics page completely fixed
- ✅ False "active state" bug resolved
- ✅ Settings save properly without freezing

---

## 📦 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- npm (comes with Node.js)
- Steam account(s) - **USE ALT ACCOUNTS!**

### Installation

```bash
# Clone repository
git clone https://github.com/stolenact/VaporBooster.git
cd VaporBooster

# Install dependencies
npm install

# Copy environment template (optional)
cp .env.example .env

# Start application
npm start
```

### First Run

The application will:
1. Show legal disclaimer (you must accept)
2. Guide you through adding your first account
3. Start boosting immediately

---

## ⚙️ Configuration

### Adding Accounts

**Method 1: Setup Wizard** (Recommended)
```
npm start
→ Select [3] Add New Account
→ Follow prompts
```

**Method 2: Manual** (`config/accounts.json`)

```json
[
    {
        "username": "your_username",
        "password": "your_password",
        "sharedSecret": "",
        "invisible": true,
        "gamesAndStatus": ["Custom Status", 730, 440, 570],
        "replyMessage": "AFK - Boosting hours",
        "saveMessages": true
    }
]
```

**Security Note:**
```bash
# Set secure permissions (Unix/Linux/Mac)
chmod 600 config/accounts.json
```

### Configuration Fields

| Field | Type | Description |
|-------|------|-------------|
| `username` | string | Steam username |
| `password` | string | Steam password (supports 256+ chars) |
| `sharedSecret` | string | 2FA shared secret for auto-codes |
| `invisible` | boolean | Boost while appearing offline |
| `gamesAndStatus` | array | Custom status + game IDs |
| `replyMessage` | string | Auto-reply to messages |
| `saveMessages` | boolean | Log messages to file |

### Settings

Access via menu option `[6] Settings`:

- **Auto-reconnect**: Auto-reconnect on disconnection
- **Invisible mode**: Default invisible for all accounts
- **Save messages**: Log friend messages
- **Debug mode**: Extended logging
- **Startup delay**: Delay between account logins (1000-10000ms)

---

## 🎮 Finding Game IDs

Game IDs are in the Steam store URL:

```
https://store.steampowered.com/app/730/Counter-Strike_2/
                                  ^^^^^
                                  GameID
```

### Popular Game IDs

| Game | ID | Game | ID |
|------|-----|------|-----|
| Counter-Strike 2 | 730 | GTA V | 271590 |
| Dota 2 | 570 | Apex Legends | 1172470 |
| Team Fortress 2 | 440 | Elden Ring | 1245620 |
| PUBG | 578080 | Rust | 252490 |
| Palworld | 2358720 | Valheim | 892970 |

---

## 🖥️ Usage

### Main Menu

```
+============================================================+
|              VAPOR BOOSTER - MAIN MENU                     |
+============================================================+
|                                                            |
|  [1] Start All Accounts (2 total)                          |
|  [2] Start Single Account                                  |
|  [3] Add New Account                                       |
|  [4] Manage Accounts                                       |
|  [5] View Statistics                                       |
|  [6] Settings                                              |
|  [7] Export Backup                                         |
|                                                            |
|  [0] Exit                                                  |
|                                                            |
+============================================================+
```

### While Boosting

Press keys for actions:
- **M** - Return to menu
- **S** - View statistics
- **Q** - Quit application

### Login Methods

1. **Password only** - Enter password when prompted
2. **Password + 2FA (manual)** - Enter code from email/app
3. **Password + Shared Secret** - Auto-generates codes
4. **QR/App Approval** - Choose option 2, scan QR or approve in app ✅

---

## 🔐 Security Best Practices

### 1. Enable Encryption

```bash
# Generate encryption key
openssl rand -hex 32 > .encryption-key
chmod 600 .encryption-key
```

### 2. File Permissions

```bash
chmod 600 config/accounts.json
chmod 600 .env
chmod 700 accounts_data/
chmod 700 data/
```

### 3. Environment Variables

Instead of storing in config files:
```bash
export STEAM_USERNAME=myuser
export STEAM_PASSWORD=mypass
```

### 4. Regular Updates

```bash
npm update
npm audit fix
```

### 5. Monitor Logs

```bash
tail -f logs/vapor_$(date +%Y-%m-%d).log
```

---

## 🐛 Troubleshooting

### Common Issues

**"Invalid Password"**
- Double-check credentials
- Try logging in through Steam website first
- Check for typos/special characters

**"Rate Limited"**
- Wait 30 minutes before retrying
- Reduce concurrent logins in settings
- Increase startup delay

**"Steam Guard Required"**
- Add shared secret for auto-codes
- Use QR/app approval method
- Or enter code manually

**UI Looks Broken**
- Increase terminal width to 80+ columns
- Use modern terminal (Windows Terminal, iTerm2)
- Check terminal supports UTF-8

**Memory Issues**
- Reduce concurrent accounts
- Check for memory leaks: `node --expose-gc src/accountHandler.js`
- Monitor with Task Manager/htop

### Debug Mode

Enable in Settings menu or:
```bash
# Set in .env
DEBUG=true
LOG_LEVEL=debug
```

---

## 📊 Statistics

Track your boosting progress:
- **Current session**: Uptime, active accounts, hours gained
- **Lifetime**: Total sessions, total hours, total messages
- **Per-account**: Individual time, games, status

Statistics auto-save and persist across restarts.

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📝 Development

### Setup

```bash
npm install
npm run dev  # Watch mode with auto-reload
```

### Scripts

```bash
npm test          # Run tests
npm run lint      # Check code style
npm run format    # Format code
npm run validate  # Run all checks
npm run backup    # Create backup
```

### Testing

```bash
npm test              # All tests
npm run test:watch   # Watch mode
npm run test:unit    # Unit tests only
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

**Additional Terms:**
- Educational use only
- No warranty provided
- Use at own risk
- May violate Steam ToS

---

## 🙏 Acknowledgments

- [node-steam-user](https://github.com/DoctorMcKay/node-steam-user) - Steam client
- [steam-totp](https://github.com/DoctorMcKay/node-steam-totp) - 2FA codes
- [fork](https://github.com/valnssh/vaporbooster)
- - All contributors and testers

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/stolenact/VaporBooster/issues)
- **Discussions**: [GitHub Discussions](https://github.com/stolenact/VaporBooster/discussions)
- **Email**: realzqpwi@gmail.com
- **Author**: [stolenact](https://github.com/stolenact)

---

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

### v3.0.0 Highlights
- ✅ All 6 critical bugs fixed
- ✅ QR login fully working
- ✅ Production-ready security
- ✅ Complete UI overhaul
- ✅ Comprehensive documentation

---

## ⭐ Star the Project

If you find this useful, please star the repository!

[![Star History Chart](https://api.star-history.com/svg?repos=stolenact/VaporBooster&type=Date)](https://star-history.com/#stolenact/VaporBooster&Date)

---

**Made by [stolenact](https://github.com/stolenact) with ❤️**

*Remember: Use responsibly. You've been warned!*