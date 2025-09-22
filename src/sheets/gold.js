const { getSheetsClient } = require("./auth");

/**
 * Gold Sales tab layout:
 * A = Sale ID
 * B = Customer ID
 * C = Mule Name
 * D = Amount
 * E = World
 * F = Notes
 * G = Timestamp
 *
 * Mules tab layout:
 * A = Mule Name
 * B = Stock
 * C = Combat Level
 * D = World
 * E = Last Trade
 */
async function getGoldSales() {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
        range: "GoldSales!A:G"
    });

    const rows = res.data.values || [];
    return rows.slice(1).map(row => ({
        id: row[0],
        customerId: row[1],
        mule: row[2],
        amount: Number(row[3] || 0),
        world: row[4] || "",
        notes: row[5] || "",
        timestamp: row[6] || ""
    }));
}

async function addGoldSale(sale) {
    const sheets = await getSheetsClient();
    const timestamp = new Date().toISOString();

    // Log sale
    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
        range: "GoldSales!A:G",
        valueInputOption: "RAW",
        requestBody: {
            values: [[
                sale.id,
                sale.customerId,
                sale.mule,
                sale.amount,
                sale.world,
                sale.notes || "",
                timestamp
            ]]
        }
    });

    // Update mule stock
    const muleRes = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
        range: "Mules!A:E"
    });

    const rows = muleRes.data.values || [];
    const idx = rows.findIndex(row => row[0] === sale.mule);

    if (idx !== -1) {
        const mule = rows[idx];
        const currentStock = Number(mule[1] || 0);
        const newStock = currentStock - sale.amount;

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
            range: `Mules!B${idx + 1}:E${idx + 1}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[
                    newStock,
                    mule[2] || "",
                    sale.world || mule[3] || "",
                    `${sale.amount} at ${timestamp}`
                ]]
            }
        });
    }
}

async function getMules() {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
        range: "Mules!A:E"
    });

    const rows = res.data.values || [];
    return rows.slice(1).map(row => ({
        name: row[0],
        stock: Number(row[1] || 0),
        combat: row[2] || "",
        world: row[3] || "",
        lastTrade: row[4] || ""
    }));
}

async function setMuleStock(muleName, stock) {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
        range: "Mules!A:E"
    });

    const rows = res.data.values || [];
    const idx = rows.findIndex(row => row[0] === muleName);

    if (idx !== -1) {
        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.MANAGEMENT_SHEET_ID,
            range: `Mules!B${idx + 1}`,
            valueInputOption: "RAW",
            requestBody: { values: [[stock]] }
        });
    }
}

module.exports = { getGoldSales, addGoldSale, getMules, setMuleStock };
