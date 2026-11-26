// Google Apps Script: adds each new ELCOMDAIS member as a row in this Google Sheet.
// Setup: see the steps in the chat / README. Paste this into Extensions > Apps Script of the Sheet.

const HEADERS = ['Joined', 'Name', 'Reg No', 'Year', 'Section', 'Branch', 'Email'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SECTIONS = ['A', 'B', 'C'];
const BRANCHES = ['B.Tech ECE', 'E&CS'];

// Stop spreadsheet formulas (=, +, -, @) from running when the sheet is opened.
function safe(v) {
  const t = String(v).trim().slice(0, 100);
  return /^[=+@-]/.test(t) ? "'" + t : t;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const regno = String(d.regno || '').trim();
    const email = String(d.email || '').trim().toLowerCase();
    if (!/^[a-z0-9._-]+@sastra\.ac\.in$/.test(email) || !/^[A-Za-z0-9]{3,20}$/.test(regno) || String(d.name || '').trim().length < 2 ||
        YEARS.indexOf(d.year) < 0 || SECTIONS.indexOf(d.section) < 0 || BRANCHES.indexOf(d.branch) < 0) {
      return ContentService.createTextOutput('invalid');
    }
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    // Skip duplicates by register number (column C).
    const existing = sheet.getRange(2, 3, Math.max(sheet.getLastRow() - 1, 1), 1).getValues().flat();
    if (existing.map(v => String(v).toLowerCase()).indexOf(regno.toLowerCase()) >= 0) {
      return ContentService.createTextOutput('duplicate');
    }
    sheet.appendRow([new Date(), safe(d.name), regno, d.year, d.section, d.branch, email]);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}
