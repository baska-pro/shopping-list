/**
 * Belanjaan - Google Apps Script backend
 * Version 2.1.0
 *
 * Deployment:
 * 1. Create a Google Spreadsheet.
 * 2. Extensions > Apps Script.
 * 3. Paste this file into Code.gs.
 * 4. Optional but recommended: Project Settings > Script Properties,
 *    add BELANJAAN_SYNC_TOKEN with a long random value.
 * 5. Deploy > New deployment > Web app.
 * 6. Execute as: Me. Access: Anyone.
 * 7. Paste the /exec URL into Belanjaan and use the same token when configured.
 */

const SHEET_RAW = 'SYNC_PAYLOAD';
const SHEET_ACTIVE = 'DAFTAR_AKTIF';
const SHEET_PRICES = 'DATABASE_HARGA';
const TOKEN_PROPERTY = 'BELANJAAN_SYNC_TOKEN';

function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const action = params.action || 'ping';

    if (action !== 'ping') {
      return jsonResponse({ status: 'error', message: 'Gunakan POST untuk operasi data.' });
    }

    return jsonResponse({
      status: 'success',
      message: 'Belanjaan Sync API aktif.',
      version: '2.1.0',
      protected: Boolean(getConfiguredToken_()),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return jsonResponse({ status: 'error', message: String(error) });
  }
}

function doPost(e) {
  try {
    const body = parseBody_(e);
    const action = body.action || 'save';
    const roomKey = String(body.roomKey || body.syncRoomKey || '').trim();
    const token = String(body.token || '').trim();

    if (!isAuthorized_(token)) {
      return jsonResponse({ status: 'error', message: 'Token sinkronisasi tidak valid.' });
    }

    if (!roomKey || roomKey.length < 8) {
      return jsonResponse({ status: 'error', message: 'Room Key minimal 8 karakter.' });
    }

    if (action === 'get') {
      return jsonResponse({
        status: 'success',
        roomKey: roomKey,
        data: getStoredPayload_(roomKey),
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'save' || action === 'sync') {
      const payload = body.payload || body.data;
      if (!payload) {
        return jsonResponse({ status: 'error', message: 'Payload data kosong.' });
      }

      savePayloadToSheet_(roomKey, payload);
      updateHumanReadableSheets_(payload);

      return jsonResponse({
        status: 'success',
        message: 'Data berhasil disinkronkan ke Google Spreadsheet.',
        roomKey: roomKey,
        updatedAt: new Date().toISOString()
      });
    }

    return jsonResponse({ status: 'error', message: 'Action POST tidak valid.' });
  } catch (error) {
    return jsonResponse({ status: 'error', message: String(error) });
  }
}

function parseBody_(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (error) {
      return e.parameter || {};
    }
  }
  return (e && e.parameter) || {};
}

function getConfiguredToken_() {
  return String(PropertiesService.getScriptProperties().getProperty(TOKEN_PROPERTY) || '').trim();
}

function isAuthorized_(providedToken) {
  const expected = getConfiguredToken_();
  if (!expected) return true;
  return String(providedToken || '') === expected;
}

function savePayloadToSheet_(roomKey, payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_RAW);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_RAW);
      sheet.appendRow(['Room_Key', 'Updated_At', 'Payload_JSON']);
      sheet.setFrozenRows(1);
      sheet.getRange('A1:C1').setFontWeight('bold').setBackground('#f3f4f6');
    }

    const data = sheet.getDataRange().getValues();
    const jsonStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const now = new Date().toISOString();
    let rowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === roomKey) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 2, 1, 2).setValues([[now, jsonStr]]);
    } else {
      sheet.appendRow([roomKey, now, jsonStr]);
    }
  } finally {
    lock.releaseLock();
  }
}

function getStoredPayload_(roomKey) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_RAW);
  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === roomKey) {
      try {
        return JSON.parse(String(data[i][2] || 'null'));
      } catch (error) {
        return null;
      }
    }
  }
  return null;
}

function updateHumanReadableSheets_(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;

  if (Array.isArray(data.shoppingItems)) {
    let sheet = ss.getSheetByName(SHEET_ACTIVE) || ss.insertSheet(SHEET_ACTIVE);
    sheet.clearContents();
    sheet.appendRow(['Status', 'Nama Barang', 'Jumlah', 'Satuan', 'Estimasi (Rp)', 'Harga Real (Rp)', 'Kategori / Tag', 'Catatan']);
    sheet.getRange('A1:H1').setFontWeight('bold').setBackground('#dcfce7');
    sheet.setFrozenRows(1);

    const rows = data.shoppingItems.map(function(item) {
      return [
        item.isChecked ? 'SELESAI' : 'BELUM',
        item.name || '',
        item.quantity !== null && item.quantity !== undefined ? item.quantity : '',
        item.unit || '',
        item.estimatedPrice || 0,
        item.realPrice || 0,
        item.groupTag || 'Lainnya',
        item.note || ''
      ];
    });

    if (rows.length) sheet.getRange(2, 1, rows.length, 8).setValues(rows);
  }

  if (data.priceHistory && typeof data.priceHistory === 'object') {
    let sheet = ss.getSheetByName(SHEET_PRICES) || ss.insertSheet(SHEET_PRICES);
    sheet.clearContents();
    sheet.appendRow(['Nama Barang', 'Harga Terakhir Tercatat (Rp)']);
    sheet.getRange('A1:B1').setFontWeight('bold').setBackground('#fef3c7');
    sheet.setFrozenRows(1);

    const rows = Object.keys(data.priceHistory).map(function(name) {
      return [name, data.priceHistory[name] || 0];
    });
    if (rows.length) sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
