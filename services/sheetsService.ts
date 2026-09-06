/**
 * Google Sheets (Google Apps Script) Sync Service
 */

import { SyncPayload } from '../types';

export interface SheetsTestResult {
  success: boolean;
  message: string;
}

export async function testGoogleSheetsConnection(scriptUrl: string): Promise<SheetsTestResult> {
  if (!scriptUrl || !scriptUrl.trim()) {
    return { success: false, message: 'URL Google Apps Script belum diisi.' };
  }

  const cleanUrl = scriptUrl.trim();
  if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
    return { 
      success: false, 
      message: 'Format URL tidak valid. Harus diawali dengan https://script.google.com/macros/s/.../exec' 
    };
  }

  try {
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const pingUrl = `${cleanUrl}${separator}action=ping&_t=${Date.now()}`;
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      return { 
        success: false, 
        message: `Koneksi gagal (HTTP ${response.status}: ${response.statusText}). Pastikan deployment berakses "Anyone".` 
      };
    }

    const json = await response.json();
    if (json.status === 'success' || json.message) {
      return { 
        success: true, 
        message: 'Berhasil terhubung ke Google Spreadsheet via Google Apps Script!' 
      };
    }

    return { 
      success: true, 
      message: 'Tersambung ke Google Apps Script.' 
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal menghubungi Google Apps Script. Periksa koneksi internet & izin deployment.'
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
    const cleanUrl = scriptUrl.trim();
    // Use text/plain to avoid CORS preflight issues with Google Apps Script
    const response = await fetch(cleanUrl, {
      method: 'POST',
      body: JSON.stringify({
        action: 'save',
        roomKey: roomKey.trim(),
        token: authToken || '',
        payload: payload,
      }),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.status === 'error') {
      throw new Error(result.message || 'Gagal menyimpan ke Google Spreadsheet');
    }

    return {
      success: true,
      message: 'Data berhasil disimpan ke Google Spreadsheet!'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal mengirim data ke Google Spreadsheet.'
    };
  }
}

export async function pullFromGoogleSheets(
  scriptUrl: string,
  roomKey: string,
  authToken?: string
): Promise<{ success: boolean; data?: SyncPayload | null; message: string }> {
  try {
    const cleanUrl = scriptUrl.trim();
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const fetchUrl = `${cleanUrl}${separator}action=get&roomKey=${encodeURIComponent(roomKey.trim())}&token=${encodeURIComponent(authToken || '')}&_t=${Date.now()}`;
    
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.status === 'error') {
      throw new Error(result.message || 'Gagal mengambil data dari Google Spreadsheet');
    }

    return {
      success: true,
      data: result.data || null,
      message: result.data ? 'Data berhasil dimuat dari Google Spreadsheet.' : 'Data di Google Spreadsheet masih kosong.'
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error?.message || 'Gagal mengambil data dari Google Spreadsheet.'
    };
  }
}
