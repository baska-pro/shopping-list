
export enum Unit {
  KG = 'kg',
  LITER = 'liter',
  BUAH = 'buah',
  BUNGKUS = 'bungkus',
  BIJI = 'biji',
  IKAT = 'ikat',
  SACHET = 'sachet',
  BOTOL = 'botol',
  KARDUS = 'kardus',
  PC = 'pc', // piece
  PACK = 'pack',
  BOX = 'box',
  GRAM = 'gram',
  ML = 'ml',
  ROLL = 'roll',
  DUS = 'dus',
  UNIT = 'unit',
  SET = 'set',
  PCS = 'pcs', // pieces
  METER = 'meter',
  RENTENG = 'renteng',
  SISIR = 'sisir', // Custom unit for items like bananas
  BATANG = 'batang',
  LEMBAR = 'lembar',
  SIUNG = 'siung',
  LAINNYA = 'lainnya', // Custom unit
}

export interface ShoppingItem {
  id: string; // Unique identifier for the item
  name: string;
  quantity: number | null; // Nullable if quantity is unspecified (e.g., packed goods)
  unit: Unit | string | null; // Can be a predefined unit, custom string, or null if unspecified
  estimatedPrice: number | null; // Price before shopping
  realPrice: number | null; // Actual price during/after shopping
  groupTag: string | null; // Tag for grouping items (e.g., "Pasar", "Supermarket")
  isChecked: boolean; // For marking items as bought
  note?: string; // Optional note for the item
}

export interface PredefinedItem {
  name: string;
  defaultUnit: Unit | string;
  category: string; // e.g., "Sembako", "Sayuran", "Bumbu Dapur", "Kebutuhan Rumah Tangga"
  isCustom?: boolean;
}

export interface ShoppingSession {
  id: string;
  date: string; // ISO String
  title: string; // Title of the list (e.g. "Belanja Bulanan")
  items: ShoppingItem[];
  totalEstimate: number;
  totalReal: number;
}

export interface RecipeIngredient {
  name: string;
  quantity: number | null;
  unit: Unit | string | null;
  category: string;
  note?: string;
  estimatedPrice?: number | null;
}

export interface Recipe {
  id: string;
  name: string;
  category: string; // e.g., 'Sayuran', 'Daging & Ayam', 'Seafood', 'Lauk Pauk', 'Sup & Berkuah'
  description: string;
  defaultServings: number;
  cookTimeMinutes?: number;
  difficulty?: 'Mudah' | 'Sedang' | 'Spesial';
  ingredients: RecipeIngredient[];
  instructions?: string[];
  isCustom?: boolean;
}

export type SyncProvider = 'none' | 'google-sheets' | 'supabase';

export interface CloudSyncConfig {
  provider: SyncProvider;
  autoSync: boolean;
  syncRoomKey: string; // ID / Passphrase ruang sinkronisasi untuk multi-device
  googleSheets: {
    scriptUrl: string;
    authToken?: string;
  };
  supabase: {
    url: string;
    anonKey: string;
    tableName?: string;
  };
  lastSyncTime?: string | null;
  lastSyncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncMessage?: string | null;
}

export interface SyncPayload {
  version: number;
  updatedAt: string;
  deviceId: string;
  listTitle: string;
  shoppingItems: ShoppingItem[];
  history: ShoppingSession[];
  priceHistory: { [name: string]: number };
  customRecipes: Recipe[];
}
