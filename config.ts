/**
 * Konfigurasi global aplikasi Belanjaan.
 */

export const APP_CONFIG = {
  name: 'Belanjaan',
  fullName: 'Belanjaan - Smart Shopping List',
  version: '2.1.0',
  storageKeys: {
    shoppingList: 'shoppingList',
    shoppingHistory: 'shoppingHistory',
    priceHistory: 'belanjaan_price_history',
    listTitle: 'listTitle',
    customRecipes: 'belanjaan_custom_recipes',
    customPredefined: 'belanjaan_custom_predefined_items',
    cloudSyncConfig: 'belanjaan_cloud_sync_config',
    deviceId: 'belanjaan_device_id',
    lastSyncTimestamp: 'belanjaan_last_sync_ts',
  },
  defaultRoomKey: 'keluarga-belanja',
  defaultSupabaseTable: 'shopping_sync',
};

export const DEFAULT_CLOUD_SYNC_CONFIG = {
  provider: 'none' as const,
  autoSync: false,
  syncRoomKey: 'keluarga-belanja',
  googleSheets: {
    scriptUrl: '',
    authToken: '',
  },
  supabase: {
    url: '',
    anonKey: '',
    tableName: 'shopping_sync',
  },
  lastSyncTime: null,
  lastSyncStatus: 'idle' as const,
  lastSyncMessage: null,
};
