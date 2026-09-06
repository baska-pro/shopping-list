/**
 * Belanjaan - Google Apps Script (code.gs)
 * Web App Backend untuk Sinkronisasi Multi-Device Google Sheets
 * 
 * PANDUAN DEPLOYMENT:
 * 1. Buka https://sheets.new untuk membuat Google Spreadsheet baru.
 * 2. Beri nama Spreadsheet, misalnya "Belanjaan - Cloud Sync Database".
 * 3. Buka menu: Ekstensi (Extensions) > Apps Script.
 * 4. Hapus seluruh kode bawaan, lalu tempel (paste) seluruh kode di bawah ini.
 * 5. Klik tombol "Simpan" (ikon disket).
 * 6. Klik tombol biru "Terapkan" (Deploy) > "Penerapan Baru" (New deployment).
 * 7. Pilih Jenis: "Aplikasi Web" (Web app).
 * 8. Konfigurasi:
 *    - Deskripsi: Belanjaan Sync API v2.0
 *    - Jalankan sebagai (Execute as): Saya (email Anda)
 *    - Siapa yang memiliki akses (Who has access): Siapa saja (Anyone)
 * 9. Klik "Terapkan" (Deploy) dan berikan otorisasi izin Google saat diminta.
 * 10. Salin "URL Aplikasi Web" (akhiran /exec) dan tempelkan ke aplikasi Belanjaan
 *     di menu "Sinkronisasi Cloud" > "Google Sheets".
 */

// Konstanta Nama Sheet
const SHEET_RAW = 'SYNC_PAYLOAD';
const SHEET_ACTIVE = 'DAFTAR_AKTIF';
const SHEET_HISTORY = 'RIWAYAT_BELANJA';
const SHEET_PRICES = 'DATABASE_HARGA';

/**
 * Handle HTTP GET Request
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const action = params.action || 'get';
    const roomKey = params.roomKey || params.syncRoomKey || 'default';
    const token = params.token || '';

    if (action === 'ping') {
      return jsonResponse({
        status: 'success',
        message: 'Google Apps Script Belanjaan aktif dan siap digunakan!',
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'get') {
      const data = getStoredPayload(roomKey);
      return jsonResponse({
        status: 'success',
        roomKey: roomKey,
        data: data,
        timestamp: new Date().toISOString()
      });
    }

    return jsonResponse({
      status: 'error',
      message: 'Action tidak dikenal. Gunakan ?action=ping atau ?action=get&roomKey=...'
    }, 400);

  } catch (error) {
    return jsonResponse({
      status: 'error',
      message: error.toString()
    }, 500);
  }
}

/**
 * Handle HTTP POST Request
 */
function doPost(e) {
  try {
    let body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        body = e.parameter || {};
      }
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    const action = body.action || 'save';
    const roomKey = body.roomKey || body.syncRoomKey || 'default';
    const payload = body.payload || body.data;

    if (action === 'get') {
      const data = getStoredPayload(roomKey);
      return jsonResponse({
        status: 'success',
        roomKey: roomKey,
        data: data,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'save' || action === 'sync') {
      if (!payload) {
        return jsonResponse({
          status: 'error',
          message: 'Payload data kosong.'
        }, 400);
      }

      // 1. Simpan raw JSON ke sheet penyimpanan
      savePayloadToSheet(roomKey, payload);

      // 2. Format ulang ke sheet manusia (human-readable)
      try {
        updateHumanReadableSheets(payload);
      } catch (renderErr) {
        Logger.log('Gagal memperbarui sheet human-readable: ' + renderErr.toString());
      }

      return jsonResponse({
        status: 'success',
        message: 'Data berhasil disinkronkan ke Google Spreadsheet.',
        roomKey: roomKey,
        updatedAt: new Date().toISOString()
      });
    }

    return jsonResponse({
      status: 'error',
      message: 'Action POST tidak valid.'
    }, 400);

  } catch (error) {
    return jsonResponse({
      status: 'error',
      message: error.toString()
    }, 500);
  }
}

/**
 * Menyimpan data payload JSON per roomKey
 */
function savePayloadToSheet(roomKey, payload) {
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
    if (String(data[i][0]) === String(roomKey)) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 2, 1, 2).setValues([[now, jsonStr]]);
  } else {
    sheet.appendRow([roomKey, now, jsonStr]);
  }
}

/**
 * Mengambil payload JSON tersimpan berdasarkan roomKey
 */
function getStoredPayload(roomKey) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_RAW);
  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(roomKey)) {
      const jsonStr = data[i][2];
      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

/**
 * Update tab spreadsheet visual agar mudah dibaca & dicetak langsung oleh pengguna
 */
function updateHumanReadableSheets(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;

  // 1. Tab Daftar Belanja Aktif
  if (data.shoppingItems && Array.isArray(data.shoppingItems)) {
    let actSheet = ss.getSheetByName(SHEET_ACTIVE);
    if (!actSheet) {
      actSheet = ss.insertSheet(SHEET_ACTIVE);
    }
    actSheet.clearContents();
    actSheet.appendRow(['Status', 'Nama Barang', 'Jumlah', 'Satuan', 'Estimasi (Rp)', 'Harga Real (Rp)', 'Kategori / Tag', 'Catatan']);
    actSheet.getRange('A1:H1').setFontWeight('bold').setBackground('#dcfce7');
    actSheet.setFrozenRows(1);

    const rows = data.shoppingItems.map(item => [
      item.isChecked ? 'SELESAI' : 'BELUM',
      item.name || '',
      item.quantity !== null && item.quantity !== undefined ? item.quantity : '',
      item.unit || '',
      item.estimatedPrice || 0,
      item.realPrice || 0,
      item.groupTag || 'Lainnya',
      item.note || ''
    ]);

    if (rows.length > 0) {
      actSheet.getRange(2, 1, rows.length, 8).setValues(rows);
    }
  }

  // 2. Tab Database Harga
  if (data.priceHistory && typeof data.priceHistory === 'object') {
    let priceSheet = ss.getSheetByName(SHEET_PRICES);
    if (!priceSheet) {
      priceSheet = ss.insertSheet(SHEET_PRICES);
    }
    priceSheet.clearContents();
    priceSheet.appendRow(['Nama Barang', 'Harga Terakhir Tercatat (Rp)']);
    priceSheet.getRange('A1:B1').setFontWeight('bold').setBackground('#fef3c7');
    priceSheet.setFrozenRows(1);

    const priceRows = Object.keys(data.priceHistory).map(name => [
      name,
      data.priceHistory[name] || 0
    ]);

    if (priceRows.length > 0) {
      priceSheet.getRange(2, 1, priceRows.length, 2).setValues(priceRows);
    }
  }
}

/**
 * Helper JSON Response dengan CORS
 */
function jsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
