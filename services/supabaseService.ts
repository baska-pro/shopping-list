/**
 * Supabase Multi-Device Sync Service
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SyncPayload } from '../types';

let cachedClient: { url: string; key: string; client: SupabaseClient } | null = null;

export function getSupabaseClient(url: string, anonKey: string): SupabaseClient {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (cachedClient && cachedClient.url === cleanUrl && cachedClient.key === cleanKey) {
    return cachedClient.client;
  }

  const client = createClient(cleanUrl, cleanKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  cachedClient = { url: cleanUrl, key: cleanKey, client };
  return client;
}

export async function testSupabaseConnection(
  url: string,
  anonKey: string,
  tableName: string = 'shopping_sync'
): Promise<{ success: boolean; message: string }> {
  if (!url || !url.trim()) {
    return { success: false, message: 'URL Supabase belum diisi.' };
  }
  if (!anonKey || !anonKey.trim()) {
    return { success: false, message: 'Supabase Anon Key belum diisi.' };
  }

  try {
    const supabase = getSupabaseClient(url, anonKey);
    // Simple query to verify table and credentials
    const { error } = await supabase
      .from(tableName || 'shopping_sync')
      .select('id')
      .limit(1);

    if (error) {
      // If table doesn't exist
      if (error.code === '42P01') {
        return {
          success: false,
          message: `Tabel "${tableName}" belum dibuat di Supabase. Silakan jalankan script SQL pembuatan tabel di menu SQL Editor Supabase.`
        };
      }
      return {
        success: false,
        message: `Koneksi Supabase gagal: ${error.message} (Kode: ${error.code})`
      };
    }

    return {
      success: true,
      message: 'Berhasil terhubung ke database Supabase!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Gagal menghubungi Supabase. Periksa URL dan Anon Key.'
    };
  }
}

export async function pushToSupabase(
  url: string,
  anonKey: string,
  tableName: string = 'shopping_sync',
  roomKey: string,
  payload: SyncPayload
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = getSupabaseClient(url, anonKey);
    const tbl = tableName || 'shopping_sync';
    const cleanRoomKey = roomKey.trim();

    const { error } = await supabase
      .from(tbl)
      .upsert({
        id: cleanRoomKey,
        updated_at: new Date().toISOString(),
        payload: payload,
      }, { onConflict: 'id' });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Data berhasil disinkronkan ke Supabase!'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal menyimpan data ke Supabase.'
    };
  }
}

export async function pullFromSupabase(
  url: string,
  anonKey: string,
  tableName: string = 'shopping_sync',
  roomKey: string
): Promise<{ success: boolean; data?: SyncPayload | null; message: string }> {
  try {
    const supabase = getSupabaseClient(url, anonKey);
    const tbl = tableName || 'shopping_sync';
    const cleanRoomKey = roomKey.trim();

    const { data, error } = await supabase
      .from(tbl)
      .select('payload, updated_at')
      .eq('id', cleanRoomKey)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data || !data.payload) {
      return {
        success: true,
        data: null,
        message: 'Belum ada data tersimpan di Supabase untuk Room ID ini.'
      };
    }

    return {
      success: true,
      data: data.payload as SyncPayload,
      message: 'Data berhasil dimuat dari Supabase.'
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error?.message || 'Gagal mengambil data dari Supabase.'
    };
  }
}
