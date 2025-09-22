const { getSheetsClient } = require("./auth");

/**
 * Boosters tab layout:
 * A = Discord User ID
 * B = Deposit
 * C = Status (Active/Inactive)
 */
async function getBoosters() {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
        range: "Boosters!A:C"
    });

    const rows = res.data.values || [];
    return rows.slice(1).map(row => ({
        id: row[0],
        deposit: Number(row[1] || 0),
        status: row[2] || "Inactive"
    }));
}

async function setBooster(userId, deposit = 0, status = "Active") {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
        range: "Boosters!A:C"
    });

    const rows = res.data.values || [];
    const idx = rows.findIndex(row => row[0] === userId);

    if (idx === -1) {
        // Append new booster
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
            range: "Boosters!A:C",
            valueInputOption: "RAW",
            requestBody: { values: [[userId, deposit, status]] }
        });
    } else {
        // Update existing booster
        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
            range: `Boosters!B${idx + 1}:C${idx + 1}`,
            valueInputOption: "RAW",
            requestBody: { values: [[deposit, status]] }
        });
    }
}

module.exports = { getBoosters, setBooster };
