/**
 * Google Sheets (Google Apps Script) sync service.
 */

import { SyncPayload } from '../types';

export interface SheetsTestResult {
  success: boolean;
  message: string;
}

function normalizeScriptUrl(scriptUrl: string): string {
  const cleanUrl = scriptUrl.trim();
  if (!cleanUrl.startsWith('https://script.google.com/macros/s/') || !cleanUrl.endsWith('/exec')) {
    throw new Error('URL Google Apps Script harus berformat https://script.google.com/macros/s/.../exec');
  }
  return cleanUrl;
}

export async function testGoogleSheetsConnection(scriptUrl: string): Promise<SheetsTestResult> {
  if (!scriptUrl?.trim()) {
    return { success: false, message: 'URL Google Apps Script belum diisi.' };
  }

  try {
    const cleanUrl = normalizeScriptUrl(scriptUrl);
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const response = await fetch(`${cleanUrl}${separator}action=ping&_t=${Date.now()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Koneksi gagal (HTTP ${response.status}). Periksa deployment Google Apps Script.`,
      };
    }

    const result = await response.json();
    return result.status === 'success'
      ? { success: true, message: 'Berhasil terhubung ke Google Apps Script.' }
      : { success: false, message: result.message || 'Google Apps Script tidak memberikan respons yang valid.' };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal menghubungi Google Apps Script.',
    };
  }
}

export async function pushToGoogleSheets(
  scriptUrl: string,
  roomKey: string,
  payload: SyncPayload,
  authToken?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const cleanUrl = normalizeScriptUrl(scriptUrl);
    const response = await fetch(cleanUrl, {
      method: 'POST',
      body: JSON.stringify({
        action: 'save',
        roomKey: roomKey.trim(),
        token: authToken?.trim() || '',
        payload,
      }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message || 'Gagal menyimpan ke Google Spreadsheet.');

    return { success: true, message: 'Data berhasil disimpan ke Google Spreadsheet.' };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal mengirim data ke Google Spreadsheet.',
    };
  }
}

export async function pullFromGoogleSheets(
  scriptUrl: string,
  roomKey: string,
  authToken?: string
): Promise<{ success: boolean; data?: SyncPayload | null; message: string }> {
  try {
    const cleanUrl = normalizeScriptUrl(scriptUrl);
    const response = await fetch(cleanUrl, {
      method: 'POST',
      body: JSON.stringify({
        action: 'get',
        roomKey: roomKey.trim(),
        token: authToken?.trim() || '',
      }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message || 'Gagal mengambil data dari Google Spreadsheet.');

    return {
      success: true,
      data: result.data || null,
      message: result.data ? 'Data berhasil dimuat dari Google Spreadsheet.' : 'Data di Google Spreadsheet masih kosong.',
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Gagal mengambil data dari Google Spreadsheet.',
    };
  }
}
