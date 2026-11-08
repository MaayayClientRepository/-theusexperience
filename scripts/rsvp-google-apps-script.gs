/**
 * Kalyanam v2: collect RSVPs in a Google Sheet. (site: content/rsvp.js)
 *
 * STEP 1  Create a Google Sheet (sheets.new). Name it e.g. "Wedding RSVPs".
 * STEP 2  In the sheet: Extensions -> Apps Script. Delete the sample code, paste THIS WHOLE FILE, click Save.
 * STEP 3  Deploy -> New deployment -> (gear icon) Web app.
 *           Execute as:      Me
 *           Who has access:  Anyone
 *         Click Deploy, approve the permissions (Advanced -> "Go to ... (unsafe)" is normal for your own script;
 *         it will ask to send email as you, which is how the notifications work),
 *         and COPY the "Web app" URL (it ends with /exec).
 * STEP 4  In content/rsvp.js set   provider: 'googleSheets'   and paste the URL into   googleSheetsUrl.
 * STEP 5  Open the site, send a test RSVP. A row appears in the sheet (the header row is created automatically).
 *
 * If you edit this script later: Deploy -> Manage deployments -> pencil -> Version: New version -> Deploy.
 */

var SHEET_NAME = 'RSVPs';
var NOTIFY_EMAIL = 'premmerp21@gmail.com';   // gets one email per RSVP

// Column order. Add a field here and it appears in the sheet (unknown fields are ignored, missing ones left blank).
var COLUMNS = [
  'timestamp', 'name', 'phone', 'attending', 'guestCount', 'guestNames', 'note', 'page'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var data = parseBody_(e);
    if (data.website) return json_({ ok: true });   // honeypot filled: a bot. Pretend success, store nothing.
    lock.waitLock(10000);                           // two RSVPs at the same instant must not overwrite each other
    var sheet = getSheet_();
    var row = COLUMNS.map(function (key) {
      if (key === 'timestamp') return new Date();
      var v = data[key];
      if (v === undefined || v === null) return '';
      if (Array.isArray(v)) return v.join(', ');
      return String(v);
    });
    sheet.appendRow(row);
    notify_(data, sheet);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

// One email per RSVP, with a running headcount. A failed email never loses the RSVP (it is already in the sheet).
function notify_(data, sheet) {
  try {
    var coming = data.attending === 'Yes';
    var total = 0;
    var rows = sheet.getDataRange().getValues();
    var iAtt = COLUMNS.indexOf('attending'), iCnt = COLUMNS.indexOf('guestCount');
    for (var r = 1; r < rows.length; r++) {
      if (rows[r][iAtt] === 'Yes') total += Number(rows[r][iCnt]) || 0;
    }
    var lines = COLUMNS.filter(function (k) { return k !== 'timestamp' && k !== 'page' && data[k]; })
      .map(function (k) { return k + ': ' + data[k]; });
    lines.push('', 'Total guests confirmed so far: ' + total, 'Sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
    MailApp.sendEmail(
      NOTIFY_EMAIL,
      'New RSVP: ' + (data.name || 'Someone') + (coming ? ' is coming (' + (data.guestCount || 1) + ')' : ' cannot make it'),
      lines.join('\n')
    );
  } catch (ignore) { /* mail quota or permission problem: the row is saved regardless */ }
}

// Opening the /exec URL in a browser: a friendly check that the deployment works.
function doGet() {
  return json_({ ok: true, message: 'Kalyanam RSVP endpoint is alive. Send RSVPs with POST.' });
}

// Accepts JSON, text/plain containing JSON, or normal form-encoded bodies.
function parseBody_(e) {
  var body = e && e.postData && e.postData.contents ? e.postData.contents : '';
  if (body) {
    try { return JSON.parse(body); } catch (ignore) { /* not JSON: fall through to form fields */ }
  }
  return (e && e.parameter) || {};
}

// Finds (or creates) the "RSVPs" tab and writes the bold header row the first time.
function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold').setBackground('#F4DC97');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
