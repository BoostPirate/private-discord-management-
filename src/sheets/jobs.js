const { getSheetsClient } = require("./auth");
const SPREADSHEET_ID = process.env.MANAGEMENT_SHEET_ID;

// Add a new job
async function addJob(job) {
    const sheets = await getSheetsClient();

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Jobs!A:H", // adjust if you have more columns
        valueInputOption: "RAW",
        requestBody: {
            values: [
                [
                    job.id,
                    job.customer,
                    job.value,
                    job.deposit,
                    job.description,
                    job.image || "",
                    job.status,
                    job.channel_id
                ]
            ]
        }
    });
}

// Update an existing job
async function updateJob(jobId, updates) {
    const sheets = await getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Jobs!A:H",
    });

    const rows = res.data.values || [];
    const headers = rows[0];
    const jobIndex = rows.findIndex(r => r[0] === jobId);

    if (jobIndex === -1) throw new Error("Job not found");

    const jobRow = rows[jobIndex];
    headers.forEach((header, i) => {
        if (updates[header.toLowerCase()]) {
            jobRow[i] = updates[header.toLowerCase()];
        }
    });

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Jobs!A${jobIndex + 1}:H${jobIndex + 1}`,
        valueInputOption: "RAW",
        requestBody: { values: [jobRow] }
    });

    return true;
}

// Get a single job
async function getJob(jobId) {
    const sheets = await getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Jobs!A:H",
    });

    const rows = res.data.values || [];
    const headers = rows[0];
    const jobRow = rows.find(r => r[0] === jobId);

    if (!jobRow) throw new Error("Job not found");

    const job = {};
    headers.forEach((h, i) => {
        job[h.toLowerCase()] = jobRow[i];
    });

    return job;
}

module.exports = { addJob, updateJob, getJob };
