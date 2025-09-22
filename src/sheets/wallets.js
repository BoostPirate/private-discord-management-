const { getSheetsClient } = require("./auth");
const { getConfig } = require("./config");
const { Client } = require("discord.js");

async function getWallet(userId) {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
        range: "Wallets!A:C"
    });

    const rows = res.data.values || [];
    const idx = rows.findIndex(row => row[0] === userId);

    if (idx === -1) return { balance: 0, spent: 0 };
    return {
        balance: Number(rows[idx][1] || 0),
        spent: Number(rows[idx][2] || 0)
    };
}

async function setWallet(userId, balance, spent = 0, guild = null) {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
        range: "Wallets!A:C"
    });

    const rows = res.data.values || [];
    const idx = rows.findIndex(row => row[0] === userId);

    if (idx === -1) {
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
            range: "Wallets!A:C",
            valueInputOption: "RAW",
            requestBody: { values: [[userId, balance, spent]] }
        });
    } else {
        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
            range: `Wallets!B${idx + 1}:C${idx + 1}`,
            valueInputOption: "RAW",
            requestBody: { values: [[balance, spent]] }
        });
    }

    // ✅ Apply discounts & roles if guild is provided
    if (guild) {
        const config = await getConfig();
        const thresholds = Object.keys(config)
            .filter(k => k.startsWith("discount_threshold"))
            .map(k => ({
                threshold: Number(config[k]),
                role: config[`discount_role_${k.split("_").pop()}`]
            }))
            .sort((a, b) => b.threshold - a.threshold);

        for (const t of thresholds) {
            if (spent >= t.threshold && t.role) {
                const member = await guild.members.fetch(userId).catch(() => null);
                if (member && !member.roles.cache.has(t.role)) {
                    await member.roles.add(t.role).catch(() => null);
                }
                break;
            }
        }
    }
}

module.exports = { getWallet, setWallet };

