const { getSheetsClient } = require("./auth");

/**
 * Fetches pricing options from the Pricing sheet.
 * Assumes columns:
 * A = Service name
 * B = Price
 */
async function getPricingOptions() {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.PRICING_SHEET_ID,
        range: "Pricing!A:B" // adjust if your sheet uses a different tab name
    });

    const rows = res.data.values || [];
    if (rows.length <= 1) return []; // no data or only header row

    // Skip first row (header)
    return rows.slice(1).map(row => ({
        name: row[0],
        price: row[1]
    }));
}

module.exports = { getPricingOptions };

