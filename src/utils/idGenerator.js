/**
 * Generates a unique ID for accounts.
 * Example: If uploader is IceH -> "I00001"
 */
async function generateAccountId(uploaderName, existingAccounts) {
    const prefix = uploaderName.charAt(0).toUpperCase();
    const existingIds = existingAccounts
        .filter(acc => acc.id.startsWith(prefix))
        .map(acc => parseInt(acc.id.substring(1), 10))
        .filter(n => !isNaN(n));

    const nextNum = existingIds.length ? Math.max(...existingIds) + 1 : 1;
    return prefix + String(nextNum).padStart(5, "0");
}

module.exports = { generateAccountId };
