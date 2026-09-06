/**
 * Supabase multi-device sync service.
 *
 * Direct table access is intentionally avoided. The database exposes two RPC
 * functions only, while room keys are hashed in the browser before transit.
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

async function hashRoomKey(roomKey: string): Promise<string> {
  const clean = roomKey.trim();
  if (clean.length < 12) {
    throw new Error('Room Key minimal 12 karakter agar lebih sulit ditebak.');
  }

  const bytes = new TextEncoder().encode(clean);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map(value => value.toString(16).padStart(2, '0'))
    .join('');
}

export async function testSupabaseConnection(
  url: string,
  anonKey: string,
  _tableName: string = 'shopping_sync'
): Promise<{ success: boolean; message: string }> {
  if (!url?.trim()) {
    return { success: false, message: 'URL Supabase belum diisi.' };
  }
  if (!anonKey?.trim()) {
    return { success: false, message: 'Supabase Anon Key belum diisi.' };
  }

  try {
    const supabase = getSupabaseClient(url, anonKey);
    const healthRoom = await hashRoomKey('belanjaan-health-check');
    const { error } = await supabase.rpc('shopping_sync_pull', {
      p_room_id: healthRoom,
    });

    if (error) {
      return {
        success: false,
        message: `Koneksi Supabase belum siap: ${error.message}. Jalankan supabase_schema.sql terbaru di SQL Editor.`,
      };
    }

    return {
      success: true,
      message: 'Berhasil terhubung ke Supabase dengan RPC sync yang aman.',
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal menghubungi Supabase.',
    };
  }
}

export async function pushToSupabase(
  url: string,
  anonKey: string,
  _tableName: string = 'shopping_sync',
  roomKey: string,
  payload: SyncPayload
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = getSupabaseClient(url, anonKey);
    const roomId = await hashRoomKey(roomKey);

    const { error } = await supabase.rpc('shopping_sync_push', {
      p_room_id: roomId,
      p_payload: payload,
    });

    if (error) throw error;

    return {
      success: true,
      message: 'Data berhasil disinkronkan ke Supabase.',
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal menyimpan data ke Supabase.',
    };
  }
}

export async function pullFromSupabase(
  url: string,
  anonKey: string,
  _tableName: string = 'shopping_sync',
  roomKey: string
): Promise<{ success: boolean; data?: SyncPayload | null; message: string }> {
  try {
    const supabase = getSupabaseClient(url, anonKey);
    const roomId = await hashRoomKey(roomKey);

    const { data, error } = await supabase.rpc('shopping_sync_pull', {
      p_room_id: roomId,
    });

    if (error) throw error;

    if (!data) {
      return {
        success: true,
        data: null,
        message: 'Belum ada data tersimpan untuk Room Key ini.',
      };
    }

    return {
      success: true,
      data: data as SyncPayload,
      message: 'Data berhasil dimuat dari Supabase.',
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Gagal mengambil data dari Supabase.',
    };
  }
}
