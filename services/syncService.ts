/**
 * Central Cloud Sync Orchestrator
 */

import { CloudSyncConfig, SyncPayload, ShoppingItem, ShoppingSession, Recipe } from '../types';
import { APP_CONFIG, DEFAULT_CLOUD_SYNC_CONFIG } from '../config';
import { pushToGoogleSheets, pullFromGoogleSheets, testGoogleSheetsConnection } from './sheetsService';
import { pushToSupabase, pullFromSupabase, testSupabaseConnection } from './supabaseService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mengambil atau membuat ID Perangkat unik
 */
export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(APP_CONFIG.storageKeys.deviceId);
    if (!id) {
      id = 'device_' + uuidv4().substring(0, 8);
      localStorage.setItem(APP_CONFIG.storageKeys.deviceId, id);
    }
    return id;
  } catch {
    return 'device_unknown';
  }
}

/**
 * Membaca konfigurasi Cloud Sync dari localStorage
 */
export function loadCloudSyncConfig(): CloudSyncConfig {
  try {
    const raw = localStorage.getItem(APP_CONFIG.storageKeys.cloudSyncConfig);
    if (!raw) return { ...DEFAULT_CLOUD_SYNC_CONFIG };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CLOUD_SYNC_CONFIG,
      ...parsed,
      googleSheets: {
        ...DEFAULT_CLOUD_SYNC_CONFIG.googleSheets,
        ...(parsed.googleSheets || {})
      },
      supabase: {
        ...DEFAULT_CLOUD_SYNC_CONFIG.supabase,
        ...(parsed.supabase || {})
      }
    };
  } catch {
    return { ...DEFAULT_CLOUD_SYNC_CONFIG };
  }
}

/**
 * Menyimpan konfigurasi Cloud Sync ke localStorage
 */
export function saveCloudSyncConfig(config: CloudSyncConfig): void {
  try {
    localStorage.setItem(APP_CONFIG.storageKeys.cloudSyncConfig, JSON.stringify(config));
  } catch (err) {
    console.error('Gagal menyimpan konfigurasi Cloud Sync:', err);
  }
}

/**
 * Membentuk payload lengkap untuk sinkronisasi cloud
 */
export function buildSyncPayload(params: {
  listTitle: string;
  shoppingItems: ShoppingItem[];
  history: ShoppingSession[];
  priceHistory: { [name: string]: number };
  customRecipes?: Recipe[];
}): SyncPayload {
  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    deviceId: getDeviceId(),
    listTitle: params.listTitle || 'Daftar Belanja',
    shoppingItems: params.shoppingItems || [],
    history: params.history || [],
    priceHistory: params.priceHistory || {},
    customRecipes: params.customRecipes || [],
  };
}

/**
 * Menguji koneksi berdasarkan provider yang dipilih
 */
export async function testProviderConnection(config: CloudSyncConfig): Promise<{ success: boolean; message: string }> {
  if (config.provider === 'none') {
    return { success: true, message: 'Mode lokal offline aktif. Tidak memerlukan koneksi cloud.' };
  }

  if (config.provider === 'google-sheets') {
    return testGoogleSheetsConnection(config.googleSheets.scriptUrl);
  }

  if (config.provider === 'supabase') {
    return testSupabaseConnection(
      config.supabase.url,
      config.supabase.anonKey,
      config.supabase.tableName
    );
  }

  return { success: false, message: 'Provider sinkronisasi tidak valid.' };
}

/**
 * Mengirim data ke Cloud (Push)
 */
export async function pushDataToCloud(
  config: CloudSyncConfig,
  payload: SyncPayload
): Promise<{ success: boolean; message: string }> {
  if (config.provider === 'none') {
    return { success: false, message: 'Penyimpanan cloud dinonaktifkan.' };
  }

  const roomKey = (config.syncRoomKey || APP_CONFIG.defaultRoomKey).trim();

  if (config.provider === 'google-sheets') {
    const res = await pushToGoogleSheets(
      config.googleSheets.scriptUrl,
      roomKey,
      payload,
      config.googleSheets.authToken
    );
    return res;
  }

  if (config.provider === 'supabase') {
    const res = await pushToSupabase(
      config.supabase.url,
      config.supabase.anonKey,
      config.supabase.tableName || APP_CONFIG.defaultSupabaseTable,
      roomKey,
      payload
    );
    return res;
  }

  return { success: false, message: 'Provider sinkronisasi tidak didukung.' };
}

/**
 * Mengambil data dari Cloud (Pull)
 */
export async function pullDataFromCloud(
  config: CloudSyncConfig
): Promise<{ success: boolean; data?: SyncPayload | null; message: string }> {
  if (config.provider === 'none') {
    return { success: false, message: 'Penyimpanan cloud dinonaktifkan.' };
  }

  const roomKey = (config.syncRoomKey || APP_CONFIG.defaultRoomKey).trim();

  if (config.provider === 'google-sheets') {
    return pullFromGoogleSheets(
      config.googleSheets.scriptUrl,
      roomKey,
      config.googleSheets.authToken
    );
  }

  if (config.provider === 'supabase') {
    return pullFromSupabase(
      config.supabase.url,
      config.supabase.anonKey,
      config.supabase.tableName || APP_CONFIG.defaultSupabaseTable,
      roomKey
    );
  }

  return { success: false, message: 'Provider sinkronisasi tidak didukung.' };
}
