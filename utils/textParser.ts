import { Unit, ShoppingItem, PredefinedItem } from '../types';
import { PREDEFINED_ITEMS, PREDEFINED_UNITS } from '../constants';

export interface ParsedShoppingItem {
  idTemp: string;
  name: string;
  quantity: number | null;
  unit: Unit | string | null;
  category: string;
  note?: string;
  estimatedPrice: number | null;
  matchedPredefined?: PredefinedItem;
}

interface PredefinedMapEntry {
  canonicalName: string;
  category: string;
  defaultUnit: Unit;
}

// Comprehensive dictionary for Indonesian traditional market and grocery terms
const GROCERY_DICTIONARY: { [alias: string]: PredefinedMapEntry } = {
  // Bumbu Dapur
  'bawang merah': { canonicalName: 'Bawang Merah', category: 'Bumbu Dapur', defaultUnit: Unit.KG },
  'bamer': { canonicalName: 'Bawang Merah', category: 'Bumbu Dapur', defaultUnit: Unit.KG },
  'bawang putih': { canonicalName: 'Bawang Putih', category: 'Bumbu Dapur', defaultUnit: Unit.KG },
  'baput': { canonicalName: 'Bawang Putih', category: 'Bumbu Dapur', defaultUnit: Unit.KG },
  'bawang daun': { canonicalName: 'Bawang Daun', category: 'Bumbu Dapur', defaultUnit: Unit.IKAT },
  'daun bawang': { canonicalName: 'Bawang Daun', category: 'Bumbu Dapur', defaultUnit: Unit.IKAT },
  'bawang bombay': { canonicalName: 'Bawang Bombay', category: 'Bumbu Dapur', defaultUnit: Unit.BUAH },
  'bawang bombai': { canonicalName: 'Bawang Bombay', category: 'Bumbu Dapur', defaultUnit: Unit.BUAH },
  'cengek': { canonicalName: 'Cabai Rawit (Cengek)', category: 'Bumbu Dapur', defaultUnit: Unit.GRAM },
  'cabe rawit': { canonicalName: 'Cabai Rawit (Cengek)', category: 'Bumbu Dapur', defaultUnit: Unit.GRAM },
  'cabai rawit': { canonicalName: 'Cabai Rawit (Cengek)', category: 'Bumbu Dapur', defaultUnit: Unit.GRAM },
  'cabe keriting merah': { canonicalName: 'Cabai Merah Keriting', category: 'Bumbu Dapur', defaultUnit: Unit.GRAM },
  'cabai keriting merah': { canonicalName: 'Cabai Merah Keriting', category: 'Bumbu Dapur', defaultUnit: Unit.GRAM },
  'cabe merah keriting': { canonicalName: 'Cabai Merah Keriting', category: 'Bumbu Dapur', defaultUnit: Unit.GRAM },
  'cabe keriting ijo': { canonicalName: 'Cabai Hijau Keriting', category: 'Bumbu Dapur', defaultUnit: Unit.GRAM },
  'cabe keriting hijau': { canonicalName: 'Cabai Hijau Keriting', category: 'Bumbu Dapur', defaultUnit: Unit.GRAM },
  'cabai keriting hijau': { canonicalName: 'Cabai Hijau Keriting', category: 'Bumbu Dapur', defaultUnit: Unit.GRAM },
  'cabe merah': { canonicalName: 'Cabai Merah', category: 'Bumbu Dapur', defaultUnit: Unit.GRAM },
  'cabai merah': { canonicalName: 'Cabai Merah', category: 'Bumbu Dapur', defaultUnit: Unit.GRAM },
  'cabe ijo': { canonicalName: 'Cabai Hijau', category: 'Bumbu Dapur', defaultUnit: Unit.GRAM },
  'cabe': { canonicalName: 'Cabai', category: 'Bumbu Dapur', defaultUnit: Unit.GRAM },
  'cabai': { canonicalName: 'Cabai', category: 'Bumbu Dapur', defaultUnit: Unit.GRAM },
  'jahe': { canonicalName: 'Jahe', category: 'Bumbu Dapur', defaultUnit: Unit.BUNGKUS },
  'kencur': { canonicalName: 'Kencur', category: 'Bumbu Dapur', defaultUnit: Unit.BUNGKUS },
  'cikur': { canonicalName: 'Kencur', category: 'Bumbu Dapur', defaultUnit: Unit.BUNGKUS },
  'kunyit': { canonicalName: 'Kunyit', category: 'Bumbu Dapur', defaultUnit: Unit.BUNGKUS },
  'koneng': { canonicalName: 'Kunyit', category: 'Bumbu Dapur', defaultUnit: Unit.BUNGKUS },
  'lengkuas': { canonicalName: 'Lengkuas', category: 'Bumbu Dapur', defaultUnit: Unit.BUNGKUS },
  'laos': { canonicalName: 'Lengkuas', category: 'Bumbu Dapur', defaultUnit: Unit.BUNGKUS },
  'kemiri': { canonicalName: 'Kemiri', category: 'Bumbu Dapur', defaultUnit: Unit.BUNGKUS },
  'terasi bakar': { canonicalName: 'Terasi Bakar', category: 'Bumbu Dapur', defaultUnit: Unit.BUNGKUS },
  'terasi': { canonicalName: 'Terasi', category: 'Bumbu Dapur', defaultUnit: Unit.BUNGKUS },
  'ladaku': { canonicalName: 'Ladaku', category: 'Bumbu Dapur', defaultUnit: Unit.SACHET },
  'merica': { canonicalName: 'Merica Bubuk', category: 'Bumbu Dapur', defaultUnit: Unit.SACHET },
  'ketumbar': { canonicalName: 'Ketumbar Bubuk', category: 'Bumbu Dapur', defaultUnit: Unit.SACHET },
  'jeruk nipis': { canonicalName: 'Jeruk Nipis', category: 'Bumbu Dapur', defaultUnit: Unit.BUAH },
  'jeruk limau': { canonicalName: 'Jeruk Limau', category: 'Bumbu Dapur', defaultUnit: Unit.BUAH },
  'jeruk limo': { canonicalName: 'Jeruk Limau', category: 'Bumbu Dapur', defaultUnit: Unit.BUAH },
  'kecap': { canonicalName: 'Kecap Manis', category: 'Bumbu Dapur', defaultUnit: Unit.BOTOL },
  'kecap manis': { canonicalName: 'Kecap Manis', category: 'Bumbu Dapur', defaultUnit: Unit.BOTOL },
  'saus tomat': { canonicalName: 'Saus Tomat', category: 'Bumbu Dapur', defaultUnit: Unit.BOTOL },
  'saus sambal': { canonicalName: 'Saus Sambal', category: 'Bumbu Dapur', defaultUnit: Unit.BOTOL },
  'penyedap': { canonicalName: 'Penyedap Rasa', category: 'Bumbu Dapur', defaultUnit: Unit.BUNGKUS },
  'royco': { canonicalName: 'Penyedap Royco', category: 'Bumbu Dapur', defaultUnit: Unit.SACHET },
  'masako': { canonicalName: 'Penyedap Masako', category: 'Bumbu Dapur', defaultUnit: Unit.SACHET },
  'micin': { canonicalName: 'Penyedap Rasa', category: 'Bumbu Dapur', defaultUnit: Unit.BUNGKUS },
  'gula merah': { canonicalName: 'Gula Merah', category: 'Bumbu Dapur', defaultUnit: Unit.KG },
  'gula aren': { canonicalName: 'Gula Aren', category: 'Bumbu Dapur', defaultUnit: Unit.KG },
  'asam jawa': { canonicalName: 'Asam Jawa', category: 'Bumbu Dapur', defaultUnit: Unit.BUNGKUS },
  'serai': { canonicalName: 'Serai', category: 'Bumbu Dapur', defaultUnit: Unit.IKAT },
  'sereh': { canonicalName: 'Serai', category: 'Bumbu Dapur', defaultUnit: Unit.IKAT },
  'daun salam': { canonicalName: 'Daun Salam', category: 'Bumbu Dapur', defaultUnit: Unit.IKAT },
  'daun jeruk': { canonicalName: 'Daun Jeruk', category: 'Bumbu Dapur', defaultUnit: Unit.BUNGKUS },
  'daun seledri': { canonicalName: 'Daun Seledri', category: 'Bumbu Dapur', defaultUnit: Unit.IKAT },
  'seledri': { canonicalName: 'Daun Seledri', category: 'Bumbu Dapur', defaultUnit: Unit.IKAT },

  // Sayuran
  'kol': { canonicalName: 'Kol', category: 'Sayuran', defaultUnit: Unit.BUAH },
  'kubis': { canonicalName: 'Kol', category: 'Sayuran', defaultUnit: Unit.BUAH },
  'sawi': { canonicalName: 'Sawi', category: 'Sayuran', defaultUnit: Unit.IKAT },
  'caisim': { canonicalName: 'Sawi Caisim', category: 'Sayuran', defaultUnit: Unit.IKAT },
  'pakcoy': { canonicalName: 'Sawi Pakcoy', category: 'Sayuran', defaultUnit: Unit.IKAT },
  'wortel': { canonicalName: 'Wortel', category: 'Sayuran', defaultUnit: Unit.KG },
  'waluh': { canonicalName: 'Waluh (Labu Siam)', category: 'Sayuran', defaultUnit: Unit.BUAH },
  'labu siam': { canonicalName: 'Labu Siam', category: 'Sayuran', defaultUnit: Unit.BUAH },
  'toge': { canonicalName: 'Toge (Tauge)', category: 'Sayuran', defaultUnit: Unit.BUNGKUS },
  'tauge': { canonicalName: 'Toge (Tauge)', category: 'Sayuran', defaultUnit: Unit.BUNGKUS },
  'buncis': { canonicalName: 'Buncis', category: 'Sayuran', defaultUnit: Unit.GRAM },
  'jagung manis': { canonicalName: 'Jagung Manis', category: 'Sayuran', defaultUnit: Unit.BUAH },
  'jagung': { canonicalName: 'Jagung', category: 'Sayuran', defaultUnit: Unit.BUAH },
  'kentang': { canonicalName: 'Kentang', category: 'Sayuran', defaultUnit: Unit.KG },
  'sayur': { canonicalName: 'Aneka Sayur (Bungkusan)', category: 'Sayuran', defaultUnit: Unit.BUNGKUS },
  'sayuran': { canonicalName: 'Aneka Sayuran', category: 'Sayuran', defaultUnit: Unit.BUNGKUS },
  'sayur sop': { canonicalName: 'Bahan Sayur Sop', category: 'Sayuran', defaultUnit: Unit.BUNGKUS },
  'sayur asem': { canonicalName: 'Bahan Sayur Asem', category: 'Sayuran', defaultUnit: Unit.BUNGKUS },
  'sayur lodeh': { canonicalName: 'Bahan Sayur Lodeh', category: 'Sayuran', defaultUnit: Unit.BUNGKUS },
  'jengkol': { canonicalName: 'Jengkol', category: 'Sayuran', defaultUnit: Unit.KG },
  'pete': { canonicalName: 'Petai (Pete)', category: 'Sayuran', defaultUnit: Unit.IKAT },
  'petai': { canonicalName: 'Petai', category: 'Sayuran', defaultUnit: Unit.IKAT },
  'kangkung': { canonicalName: 'Kangkung', category: 'Sayuran', defaultUnit: Unit.IKAT },
  'bayam': { canonicalName: 'Bayam', category: 'Sayuran', defaultUnit: Unit.IKAT },
  'daun singkong': { canonicalName: 'Daun Singkong', category: 'Sayuran', defaultUnit: Unit.IKAT },
  'tomat': { canonicalName: 'Tomat', category: 'Sayuran', defaultUnit: Unit.KG },
  'timun': { canonicalName: 'Timun', category: 'Sayuran', defaultUnit: Unit.BUAH },
  'mentimun': { canonicalName: 'Timun', category: 'Sayuran', defaultUnit: Unit.BUAH },
  'terong': { canonicalName: 'Terong', category: 'Sayuran', defaultUnit: Unit.BUAH },
  'brokoli': { canonicalName: 'Brokoli', category: 'Sayuran', defaultUnit: Unit.BUAH },
  'kembang kol': { canonicalName: 'Kembang Kol', category: 'Sayuran', defaultUnit: Unit.BUAH },
  'pare': { canonicalName: 'Pare', category: 'Sayuran', defaultUnit: Unit.BUAH },
  'kacang panjang': { canonicalName: 'Kacang Panjang', category: 'Sayuran', defaultUnit: Unit.IKAT },

  // Daging & Ikan
  'ayam': { canonicalName: 'Daging Ayam', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'daging ayam': { canonicalName: 'Daging Ayam', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'ayam potong': { canonicalName: 'Ayam Potong', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'ceker': { canonicalName: 'Ceker Ayam', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'ceker ayam': { canonicalName: 'Ceker Ayam', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'sayap ayam': { canonicalName: 'Sayap Ayam', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'ati ampela': { canonicalName: 'Ati Ampela', category: 'Daging & Ikan', defaultUnit: Unit.SET },
  'sapi': { canonicalName: 'Daging Sapi', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'daging sapi': { canonicalName: 'Daging Sapi', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'tetelan': { canonicalName: 'Tetelan Daging', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'ikan': { canonicalName: 'Ikan', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'ikan lele': { canonicalName: 'Ikan Lele', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'ikan mas': { canonicalName: 'Ikan Mas', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'ikan nila': { canonicalName: 'Ikan Nila', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'ikan tongkol': { canonicalName: 'Ikan Tongkol', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'ikan kembung': { canonicalName: 'Ikan Kembung', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'perasinan': { canonicalName: 'Ikan Asin / Perasinan', category: 'Daging & Ikan', defaultUnit: Unit.BUNGKUS },
  'ikan asin': { canonicalName: 'Ikan Asin', category: 'Daging & Ikan', defaultUnit: Unit.BUNGKUS },
  'udang': { canonicalName: 'Udang', category: 'Daging & Ikan', defaultUnit: Unit.KG },
  'cumi': { canonicalName: 'Cumi', category: 'Daging & Ikan', defaultUnit: Unit.KG },

  // Sembako & Lauk Olahan
  'tahun': { canonicalName: 'Tahu', category: 'Sembako', defaultUnit: Unit.BUNGKUS },
  'tahu': { canonicalName: 'Tahu', category: 'Sembako', defaultUnit: Unit.BUNGKUS },
  'tahu kuning': { canonicalName: 'Tahu Kuning', category: 'Sembako', defaultUnit: Unit.BUNGKUS },
  'tahu putih': { canonicalName: 'Tahu Putih', category: 'Sembako', defaultUnit: Unit.BUNGKUS },
  'tempe': { canonicalName: 'Tempe', category: 'Sembako', defaultUnit: Unit.BUNGKUS },
  'aci': { canonicalName: 'Aci (Tepung Tapioka)', category: 'Sembako', defaultUnit: Unit.KG },
  'tepung aci': { canonicalName: 'Tepung Aci', category: 'Sembako', defaultUnit: Unit.KG },
  'tapioka': { canonicalName: 'Tepung Tapioka', category: 'Sembako', defaultUnit: Unit.KG },
  'kanji': { canonicalName: 'Tepung Kanji', category: 'Sembako', defaultUnit: Unit.KG },
  'beras': { canonicalName: 'Beras', category: 'Sembako', defaultUnit: Unit.KG },
  'gula': { canonicalName: 'Gula Pasir', category: 'Sembako', defaultUnit: Unit.KG },
  'gula pasir': { canonicalName: 'Gula Pasir', category: 'Sembako', defaultUnit: Unit.KG },
  'minyak': { canonicalName: 'Minyak Goreng', category: 'Sembako', defaultUnit: Unit.LITER },
  'minyak goreng': { canonicalName: 'Minyak Goreng', category: 'Sembako', defaultUnit: Unit.LITER },
  'tepung': { canonicalName: 'Tepung Terigu', category: 'Sembako', defaultUnit: Unit.KG },
  'tepung terigu': { canonicalName: 'Tepung Terigu', category: 'Sembako', defaultUnit: Unit.KG },
  'terigu': { canonicalName: 'Tepung Terigu', category: 'Sembako', defaultUnit: Unit.KG },
  'telur': { canonicalName: 'Telur Ayam', category: 'Sembako', defaultUnit: Unit.BIJI },
  'telor': { canonicalName: 'Telur Ayam', category: 'Sembako', defaultUnit: Unit.BIJI },
  'telur ayam': { canonicalName: 'Telur Ayam', category: 'Sembako', defaultUnit: Unit.BIJI },
  'garam': { canonicalName: 'Garam', category: 'Sembako', defaultUnit: Unit.BUNGKUS },
  'kopi': { canonicalName: 'Kopi Bubuk', category: 'Sembako', defaultUnit: Unit.BUNGKUS },
  'kopi bubuk': { canonicalName: 'Kopi Bubuk', category: 'Sembako', defaultUnit: Unit.BUNGKUS },
  'teh': { canonicalName: 'Teh Celup', category: 'Sembako', defaultUnit: Unit.BUNGKUS },
  'susu': { canonicalName: 'Susu', category: 'Sembako', defaultUnit: Unit.KARDUS },
  'mie': { canonicalName: 'Mie Instan', category: 'Sembako', defaultUnit: Unit.BUNGKUS },
  'mie instan': { canonicalName: 'Mie Instan', category: 'Sembako', defaultUnit: Unit.BUNGKUS },
  'indomie': { canonicalName: 'Mie Indomie', category: 'Sembako', defaultUnit: Unit.BUNGKUS },

  // Buah-buahan
  'jeruk': { canonicalName: 'Jeruk', category: 'Buah-buahan', defaultUnit: Unit.KG },
  'apel': { canonicalName: 'Apel', category: 'Buah-buahan', defaultUnit: Unit.BUAH },
  'pisang': { canonicalName: 'Pisang', category: 'Buah-buahan', defaultUnit: Unit.SISIR },
  'anggur': { canonicalName: 'Anggur', category: 'Buah-buahan', defaultUnit: Unit.KG },
  'mangga': { canonicalName: 'Mangga', category: 'Buah-buahan', defaultUnit: Unit.BUAH },
  'semangka': { canonicalName: 'Semangka', category: 'Buah-buahan', defaultUnit: Unit.BUAH },
  'melon': { canonicalName: 'Melon', category: 'Buah-buahan', defaultUnit: Unit.BUAH },
  'pepaya': { canonicalName: 'Pepaya', category: 'Buah-buahan', defaultUnit: Unit.BUAH },
  'alpukat': { canonicalName: 'Alpukat', category: 'Buah-buahan', defaultUnit: Unit.KG },

  // Kebutuhan Rumah Tangga & Plastik
  'pelastik': { canonicalName: 'Plastik Bening', category: 'Kebutuhan Rumah Tangga', defaultUnit: Unit.PACK },
  'plastik': { canonicalName: 'Plastik Bening', category: 'Kebutuhan Rumah Tangga', defaultUnit: Unit.PACK },
  'plastik bening': { canonicalName: 'Plastik Bening', category: 'Kebutuhan Rumah Tangga', defaultUnit: Unit.PACK },
  'kantong plastik': { canonicalName: 'Kantong Plastik', category: 'Kebutuhan Rumah Tangga', defaultUnit: Unit.PACK },
  'kresek': { canonicalName: 'Kantong Kresek', category: 'Kebutuhan Rumah Tangga', defaultUnit: Unit.PACK },
  'sabun': { canonicalName: 'Sabun Mandi', category: 'Kebutuhan Rumah Tangga', defaultUnit: Unit.BUAH },
  'sabun cuci': { canonicalName: 'Deterjen', category: 'Kebutuhan Rumah Tangga', defaultUnit: Unit.BUNGKUS },
  'sabun cuci piring': { canonicalName: 'Sabun Cuci Piring', category: 'Kebutuhan Rumah Tangga', defaultUnit: Unit.BOTOL },
  'sunlight': { canonicalName: 'Sabun Cuci Piring', category: 'Kebutuhan Rumah Tangga', defaultUnit: Unit.BUNGKUS },
  'deterjen': { canonicalName: 'Deterjen', category: 'Kebutuhan Rumah Tangga', defaultUnit: Unit.BUNGKUS },
  'rinso': { canonicalName: 'Deterjen', category: 'Kebutuhan Rumah Tangga', defaultUnit: Unit.BUNGKUS },
  'odol': { canonicalName: 'Pasta Gigi', category: 'Kebutuhan Rumah Tangga', defaultUnit: Unit.BUAH },
  'pasta gigi': { canonicalName: 'Pasta Gigi', category: 'Kebutuhan Rumah Tangga', defaultUnit: Unit.BUAH },
  'tissue': { canonicalName: 'Tissue', category: 'Kebutuhan Rumah Tangga', defaultUnit: Unit.ROLL },
  'tisu': { canonicalName: 'Tissue', category: 'Kebutuhan Rumah Tangga', defaultUnit: Unit.ROLL },
};

// Unit aliases dictionary
const UNIT_MAP: { [key: string]: Unit } = {
  kg: Unit.KG,
  kilo: Unit.KG,
  kilogram: Unit.KG,
  g: Unit.GRAM,
  gr: Unit.GRAM,
  gram: Unit.GRAM,
  ons: Unit.GRAM, // 1 ons = 100 gram (handled via quantity multiplier or unit)
  l: Unit.LITER,
  ltr: Unit.LITER,
  liter: Unit.LITER,
  ml: Unit.ML,
  mili: Unit.ML,
  buah: Unit.BUAH,
  bh: Unit.BUAH,
  biji: Unit.BIJI,
  bj: Unit.BIJI,
  butir: Unit.BIJI,
  btr: Unit.BIJI,
  ekor: Unit.BIJI,
  ikat: Unit.IKAT,
  ikt: Unit.IKAT,
  batang: Unit.IKAT,
  btg: Unit.IKAT,
  lembar: Unit.IKAT,
  bks: Unit.BUNGKUS,
  bungkus: Unit.BUNGKUS,
  bgk: Unit.BUNGKUS,
  sachet: Unit.SACHET,
  saset: Unit.SACHET,
  botol: Unit.BOTOL,
  btl: Unit.BOTOL,
  dus: Unit.DUS,
  kardus: Unit.KARDUS,
  box: Unit.BOX,
  kotak: Unit.BOX,
  pack: Unit.PACK,
  pak: Unit.PACK,
  papan: Unit.BUNGKUS, // for tempe papan
  potong: Unit.BUAH,
  pc: Unit.PC,
  pcs: Unit.PCS,
  roll: Unit.ROLL,
  rol: Unit.ROLL,
  sisir: Unit.SISIR,
  renteng: Unit.RENTENG,
  renceng: Unit.RENTENG,
  set: Unit.SET,
  unit: Unit.UNIT,
  meter: Unit.METER,
  m: Unit.METER,
};

// Parse fractions like 1/2, 1/4, 3/4, 1 1/2, 2.5, 2,5
function parseQuantityString(str: string): number | null {
  const clean = str.trim().replace(',', '.');

  // Mixed fraction: 1 1/2
  if (/^\d+\s+\d+\/\d+$/.test(clean)) {
    const [whole, frac] = clean.split(/\s+/);
    const [num, den] = frac.split('/').map(Number);
    if (den !== 0) return Number(whole) + num / den;
  }

  // Simple fraction: 1/2, 1/4, 3/4
  if (/^\d+\/\d+$/.test(clean)) {
    const [num, den] = clean.split('/').map(Number);
    if (den !== 0) return num / den;
  }

  const num = parseFloat(clean);
  if (!isNaN(num) && num > 0) {
    return num;
  }
  return null;
}

// Capitalize words
function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Checks dictionary and predefined items accurately without accidental collisions
 * (e.g. Prevents "Jeruk Nipis" from colliding with "Jeruk")
 */
function matchDictionaryOrPredefined(rawName: string): {
  canonicalName: string;
  category: string;
  defaultUnit: Unit | string;
} | null {
  const lower = rawName.toLowerCase().trim();

  // 1. Exact match in GROCERY_DICTIONARY
  if (GROCERY_DICTIONARY[lower]) {
    return GROCERY_DICTIONARY[lower];
  }

  // 2. Exact match in PREDEFINED_ITEMS
  const exactPredefined = PREDEFINED_ITEMS.find(
    p => p.name.toLowerCase() === lower
  );
  if (exactPredefined) {
    return {
      canonicalName: exactPredefined.name,
      category: exactPredefined.category,
      defaultUnit: exactPredefined.defaultUnit,
    };
  }

  // 3. Multi-word exact phrase matching (check longer dictionary phrases first)
  // Sort dictionary keys by length descending to match specific items first
  // e.g. "cabe keriting ijo" before "cabe"
  const dictKeys = Object.keys(GROCERY_DICTIONARY).sort((a, b) => b.length - a.length);
  for (const key of dictKeys) {
    // Only match if it is an exact word or word boundary match, NOT a partial substring
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(lower)) {
      // Special protection: do NOT match single generic words if user typed a distinct multiword
      // e.g. If user typed "jeruk nipis", don't match "jeruk"
      if (key === 'jeruk' && (lower.includes('nipis') || lower.includes('limau') || lower.includes('purut') || lower.includes('limo'))) {
        continue;
      }
      if (key === 'sayur' && lower !== 'sayur' && !lower.startsWith('sayur ')) {
        continue;
      }
      return GROCERY_DICTIONARY[key];
    }
  }

  return null;
}

/**
 * Extracts price patterns like:
 * - "2k" or "2 k" or "2.5k" -> Rp 2.000 / Rp 2.500
 * - "5k", "Ceker 5k", "Jahe 2k", "Kencur 2 k" -> Rp 5.000 / Rp 2.000
 * - "10rb" or "10 rb" or "2 ribu" or "2 rebu" -> Rp 10.000 / Rp 2.000
 * - "@2k" or "@ 2.000" or "harga 2000"
 * - "Rp 5000" or "Rp 5.000" or "Rp2.000"
 * - "5.000" or "2.000" or "15000" at end of line (>= 500)
 */
function extractPriceFromLine(line: string): { cleanedLine: string; price: number | null } {
  let cleaned = line;
  let price: number | null = null;

  // Pattern 1: Number followed by k/rb/ribu/rebu (e.g. "2k", "2 k", "5k", "10rb", "2 ribu", "@2k", "(2k)")
  const kPattern = /(?:^|[\s\-\(@,])(?:rp\.?\s*)?(\d+(?:[\.,]\d+)?)\s*(k|rb|ribu|rebu)(?:[\s\)\.,]|$)/i;
  const matchK = cleaned.match(kPattern);
  if (matchK) {
    const rawVal = parseFloat(matchK[1].replace(',', '.'));
    if (!isNaN(rawVal)) {
      price = Math.round(rawVal * 1000);
      cleaned = cleaned.replace(matchK[0], ' ').trim();
    }
  }

  // Pattern 2: Explicit "Rp 5.000" or "Rp 5000" or "Rp2000" or "@ Rp 5.000"
  if (price === null) {
    const rpPattern = /(?:^|[\s\-\(@,])(?:@\s*)?rp\.?\s*(\d{1,3}(?:\.\d{3})+|\d{3,7})(?:[\s\)\.,]|$)/i;
    const matchRp = cleaned.match(rpPattern);
    if (matchRp) {
      const numStr = matchRp[1].replace(/\./g, '');
      const parsedRp = parseInt(numStr, 10);
      if (!isNaN(parsedRp)) {
        price = parsedRp;
        cleaned = cleaned.replace(matchRp[0], ' ').trim();
      }
    }
  }

  // Pattern 3: "@ 2000" or "harga 2000" or "harga 2.000"
  if (price === null) {
    const atPattern = /(?:^|[\s\-\(,])(?:@|harga)\s*(\d{1,3}(?:\.\d{3})+|\d{3,7})(?:[\s\)\.,]|$)/i;
    const matchAt = cleaned.match(atPattern);
    if (matchAt) {
      const numStr = matchAt[1].replace(/\./g, '');
      const parsed = parseInt(numStr, 10);
      if (!isNaN(parsed)) {
        price = parsed;
        cleaned = cleaned.replace(matchAt[0], ' ').trim();
      }
    }
  }

  // Pattern 4: Formatted with thousands separator at the end (e.g. "Jahe 2.000" or "Ayam 35.000")
  if (price === null) {
    const dotPricePattern = /(?:^|\s+)(\d{1,3}(?:\.\d{3})+)(?:[\s\)\.,]|$)/;
    const matchDot = cleaned.match(dotPricePattern);
    if (matchDot) {
      const numStr = matchDot[1].replace(/\./g, '');
      const parsed = parseInt(numStr, 10);
      if (!isNaN(parsed) && parsed >= 500) {
        price = parsed;
        cleaned = cleaned.replace(matchDot[0], ' ').trim();
      }
    }
  }

  // Pattern 5: Standalone number >= 1000 at end of line (e.g. "Jahe 2000") if not matching a unit
  if (price === null) {
    const endNumPattern = /(?:^|\s+)(\d{4,7})(?:[\s\)\.,]|$)/;
    const matchEndNum = cleaned.match(endNumPattern);
    if (matchEndNum) {
      const parsed = parseInt(matchEndNum[1], 10);
      if (!isNaN(parsed) && parsed >= 1000) {
        price = parsed;
        cleaned = cleaned.replace(matchEndNum[0], ' ').trim();
      }
    }
  }

  return { cleanedLine: cleaned, price };
}

/**
 * Extracts size/specification notes like:
 * "Pelastik bening ukuran 1/2 kg" -> Note: "Ukuran 1/2 kg", cleaned: "Pelastik bening"
 */
function extractSizeSpecification(line: string): { cleanedLine: string; note?: string } {
  const sizePattern = /\b(ukuran\s+[^\(\)]+)/i;
  const match = line.match(sizePattern);
  if (match) {
    const note = capitalizeWords(match[1].trim());
    const cleanedLine = line.replace(match[0], '').trim();
    return { cleanedLine, note };
  }
  return { cleanedLine: line };
}

/**
 * Parses a single line of text into a structured shopping item
 */
export function parseShoppingLine(
  rawLine: string,
  priceHistory: { [name: string]: number } = {}
): ParsedShoppingItem | null {
  let line = rawLine.trim();

  // Skip empty lines or header labels
  if (!line || line.length < 2) return null;
  if (/^(daftar belanja|catatan|belanjaan|list belanja|ini daftarnya):?$/i.test(line)) return null;

  // Strip leading list numbering and bullets: "1. ", "1) ", "- ", "* ", "• ", "+ "
  line = line.replace(/^(\d+[\.\)]|\-|\*|•|\+)\s*/, '').trim();
  if (!line) return null;

  // 1. Extract price embedded in line (e.g. "Cabe keriting ijo 2k", "Jahe 2k", "Ceker 5k")
  const { cleanedLine: afterPriceLine, price: extractedPrice } = extractPriceFromLine(line);
  line = afterPriceLine;

  // 2. Extract size specifications (e.g. "ukuran 1/2 kg")
  const { cleanedLine: afterSizeLine, note: sizeNote } = extractSizeSpecification(line);
  line = afterSizeLine;

  // 3. Extract parenthetical notes (e.g. "(paha saja)")
  let note: string | undefined = sizeNote;
  const parenMatch = line.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const pNote = parenMatch[1].trim();
    note = note ? `${note}, ${pNote}` : pNote;
    line = line.replace(/\([^)]+\)/, '').trim();
  }

  let itemName = line;
  let quantity: number | null = null;
  let unit: Unit | string | null = null;
  let hasExplicitQty = false;

  // Regex patterns to detect quantity & unit:
  // Pattern A: Number + optional unit at START e.g. "2 kg Beras" or "1/2 kg Daging" or "2 Jagung"
  const startPattern = /^(\d+(?:[\.,]\d+|\s+\d+\/\d+|\/\d+)?)\s*([a-zA-Z]+)?\s+(.+)$/;
  // Pattern B: Number + optional unit at END e.g. "Jagung manis 2", "Kentang 2 biji", "Aci 1/4"
  const endPattern = /^(.+?)\s+(\d+(?:[\.,]\d+|\s+\d+\/\d+|\/\d+)?)\s*([a-zA-Z]+)?$/;

  const matchStart = line.match(startPattern);
  const matchEnd = line.match(endPattern);

  if (matchStart) {
    const parsedQty = parseQuantityString(matchStart[1]);
    const potentialUnit = matchStart[2]?.toLowerCase();
    const restName = matchStart[3].trim();

    if (parsedQty !== null && restName.length > 0) {
      hasExplicitQty = true;
      quantity = parsedQty;
      if (potentialUnit && UNIT_MAP[potentialUnit]) {
        unit = UNIT_MAP[potentialUnit];
      }
      itemName = restName;
    }
  } else if (matchEnd) {
    const parsedQty = parseQuantityString(matchEnd[2]);
    const potentialUnit = matchEnd[3]?.toLowerCase();
    const prefixName = matchEnd[1].trim();

    if (parsedQty !== null && prefixName.length > 0) {
      hasExplicitQty = true;
      quantity = parsedQty;
      if (potentialUnit && UNIT_MAP[potentialUnit]) {
        unit = UNIT_MAP[potentialUnit];
      }
      itemName = prefixName;
    }
  }

  // Clean trailing punctuation
  itemName = itemName.replace(/^[-–—,:]+|[-–—,:]+$/g, '').trim();
  if (!itemName) return null;

  // 4. Lookup in Indonesian Dictionary and Predefined Items
  const matched = matchDictionaryOrPredefined(itemName);

  let finalName = matched ? matched.canonicalName : capitalizeWords(itemName);
  let category = matched ? matched.category : 'Lainnya';

  // 5. Determine Unit:
  // If user explicitly specified quantity, but did not specify unit:
  if (hasExplicitQty && !unit) {
    if (matched) {
      unit = matched.defaultUnit;
    } else {
      unit = Unit.BUAH;
    }
  }

  // Special logic for fractions on powders/grains/liquid if no unit was given (e.g. "Aci 1/4")
  if (hasExplicitQty && quantity !== null && quantity < 1 && unit === Unit.BUAH) {
    if (matched && (matched.category === 'Sembako' || matched.category === 'Bumbu Dapur')) {
      unit = matched.defaultUnit;
    } else {
      unit = Unit.KG;
    }
  }

  // 6. Estimated Price:
  // If no price was explicitly written in the input, do NOT auto-fill it!
  // Leave it null so it can be filled manually or during checklist.
  const finalEstimatedPrice = extractedPrice;

  return {
    idTemp: Math.random().toString(36).substring(2, 9),
    name: finalName,
    quantity,
    unit,
    category,
    note,
    estimatedPrice: finalEstimatedPrice,
  };
}

/**
 * Parses multiple lines of raw text into an array of shopping items
 */
export function parseShoppingTextList(
  text: string,
  priceHistory: { [name: string]: number } = {}
): ParsedShoppingItem[] {
  if (!text) return [];

  // Split by newlines, semicolons, or commas followed by newline
  const lines = text
    .split(/\r?\n|;/)
    .map(l => l.trim())
    .filter(Boolean);

  const results: ParsedShoppingItem[] = [];

  for (const line of lines) {
    const parsed = parseShoppingLine(line, priceHistory);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
}
