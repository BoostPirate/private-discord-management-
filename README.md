# MyBotFramework

A modular Discord bot framework for pricing lookups, wallet tracking, and job management.  
Designed to support multiple customers with per-guild Google Sheets integration.

## ✨ Features
- Pricing System – /pricing command with dynamic dropdowns from Google Sheets.
- Wallet System – add/remove balance, tip users, and check wallet balance per guild.
- Job Management – support staff can create jobs, boosters can claim them, and job status is tracked in a database.
- Multi-Customer Ready – easily run separate bots for each customer using .env files or Railway projects with different environment variables.

## 🚀 Setup
1. Clone this repo:
   git clone https://github.com/YOUR-USERNAME/my-bot-framework.git
   cd my-bot-framework

2. Install dependencies:
   npm install

3. Create your .env file:  
   Copy .env.example (if present) and fill in your values:
   DISCORD_TOKEN=YOUR_BOT_TOKEN
   SHEET_ID=YOUR_GOOGLE_SHEET_ID
   GUILD_ID=YOUR_DISCORD_SERVER_ID
   PREFIX=!

4. Run the bot:
   node src/index.js

## 🛠 Deployment
This bot can run locally or be deployed on Railway, Render, or any Node.js host.  
For multiple customers:
- Create a separate .env file or Railway project per customer.
- Redeploy with updated environment variables.

## 📌 Roadmap
- [ ] Coinbase + PayPal payment integrations
- [ ] /setup wizard to guide customers through linking Sheets & channels
- [ ] Auto-redeploy helper script for Railway
- [ ] Role-based permissions for @support and @boosters
- [ ] Ephemeral pricing embeds & paginated menus

## ⚖️ License
This project is private and proprietary.  
See LICENSE for details.
