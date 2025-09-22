const { getSheetsClient } = require("./auth");

/**
 * Config tab layout:
 * A = Key
 * B = Value
 *
 * Example rows:
 * discount_threshold_1   100000000   // 100m spent = role
 * discount_role_1        1234567890  // Discord role ID
 * deposit_requirement    50000000    // 50m deposit required
 */
async function getConfig() {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
        range: "Config!A:B"
    });

    const rows = res.data.values || [];
    const config = {};
    for (const row of rows.slice(1)) {
        config[row[0]] = row[1];
    }
    return config;
}

async function setConfig(key, value) {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
        range: "Config!A:B"
    });

    const rows = res.data.values || [];
    const idx = rows.findIndex(row => row[0] === key);

    if (idx === -1) {
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
            range: "Config!A:B",
            valueInputOption: "RAW",
            requestBody: { values: [[key, value]] }
        });
    } else {
        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
            range: `Config!B${idx + 1}`,
            valueInputOption: "RAW",
            requestBody: { values: [[value]] }
        });
    }
}

module.exports = { getConfig, setConfig };
