const { getSheetsClient } = require("./auth");

/**
 * Accounts tab layout:
 * A = Account ID
 * B = Uploader ID
 * C = Description
 * D = Price
 * E = Status (Available/Sold)
 * F = Image (optional)
 */
async function getAccounts() {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
        range: "Accounts!A:F"
    });

    const rows = res.data.values || [];
    return rows.slice(1).map(row => ({
        id: row[0],
        uploaderId: row[1],
        description: row[2],
        price: Number(row[3] || 0),
        status: row[4] || "Available",
        image: row[5] || null
    }));
}

async function addAccount(account) {
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
        range: "Accounts!A:F",
        valueInputOption: "RAW",
        requestBody: {
            values: [[
                account.id,
                account.uploaderId,
                account.description,
                account.price,
                account.status,
                account.image || ""
            ]]
        }
    });
}

async function updateAccount(accountId, updates) {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
        range: "Accounts!A:F"
    });

    const rows = res.data.values || [];
    const idx = rows.findIndex(row => row[0] === accountId);
    if (idx === -1) return false;

    const account = rows[idx];
    const updated = {
        id: account[0],
        uploaderId: account[1],
        description: updates.description ?? account[2],
        price: updates.price ?? account[3],
        status: updates.status ?? account[4],
        image: updates.image ?? account[5]
    };

    await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
        range: `Accounts!A${idx + 1}:F${idx + 1}`,
        valueInputOption: "RAW",
        requestBody: {
            values: [[
                updated.id,
                updated.uploaderId,
                updated.description,
                updated.price,
                updated.status,
                updated.image
            ]]
        }
    });

    return true;
}

module.exports = { getAccounts, addAccount, updateAccount };
