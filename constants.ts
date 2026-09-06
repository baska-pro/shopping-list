
import { Unit, PredefinedItem } from './types';

export const PREDEFINED_UNITS: Unit[] = [
  Unit.KG,
  Unit.LITER,
  Unit.BUAH,
  Unit.BUNGKUS,
  Unit.BIJI,
  Unit.IKAT,
  Unit.SACHET,
  Unit.BOTOL,
  Unit.KARDUS,
  Unit.PC,
  Unit.PACK,
  Unit.BOX,
  Unit.GRAM,
  Unit.ML,
  Unit.ROLL,
  Unit.DUS,
  Unit.UNIT,
  Unit.SET,
  Unit.PCS,
  Unit.METER,
  Unit.RENTENG,
  Unit.SISIR,
  Unit.LAINNYA,
];

export const PREDEFINED_ITEMS: PredefinedItem[] = [
  // Sembako
  { name: 'Beras', defaultUnit: Unit.KG, category: 'Sembako' },
  { name: 'Gula Pasir', defaultUnit: Unit.KG, category: 'Sembako' },
  { name: 'Minyak Goreng', defaultUnit: Unit.LITER, category: 'Sembako' },
  { name: 'Tepung Terigu', defaultUnit: Unit.KG, category: 'Sembako' },
  { name: 'Aci / Tapioka', defaultUnit: Unit.KG, category: 'Sembako' },
  { name: 'Tahu', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
  { name: 'Tempe', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
  { name: 'Telur Ayam', defaultUnit: Unit.BIJI, category: 'Sembako' },
  { name: 'Garam', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
  { name: 'Kopi Bubuk', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
  { name: 'Teh Celup', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
  { name: 'Susu Bubuk', defaultUnit: Unit.KARDUS, category: 'Sembako' },
  { name: 'Mie Instan', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },

  // Sayuran
  { name: 'Bayam', defaultUnit: Unit.IKAT, category: 'Sayuran' },
  { name: 'Kangkung', defaultUnit: Unit.IKAT, category: 'Sayuran' },
  { name: 'Daun Singkong', defaultUnit: Unit.IKAT, category: 'Sayuran' },
  { name: 'Wortel', defaultUnit: Unit.KG, category: 'Sayuran' },
  { name: 'Kentang', defaultUnit: Unit.KG, category: 'Sayuran' },
  { name: 'Tomat', defaultUnit: Unit.KG, category: 'Sayuran' },
  { name: 'Kol', defaultUnit: Unit.BUAH, category: 'Sayuran' },
  { name: 'Sawi', defaultUnit: Unit.IKAT, category: 'Sayuran' },
  { name: 'Buncis', defaultUnit: Unit.KG, category: 'Sayuran' },
  { name: 'Toge / Tauge', defaultUnit: Unit.BUNGKUS, category: 'Sayuran' },
  { name: 'Waluh / Labu Siam', defaultUnit: Unit.BUAH, category: 'Sayuran' },
  { name: 'Jagung Manis', defaultUnit: Unit.BUAH, category: 'Sayuran' },
  { name: 'Timun', defaultUnit: Unit.BUAH, category: 'Sayuran' },
  { name: 'Terong', defaultUnit: Unit.BUAH, category: 'Sayuran' },
  { name: 'Brokoli', defaultUnit: Unit.BUAH, category: 'Sayuran' },
  { name: 'Jengkol', defaultUnit: Unit.KG, category: 'Sayuran' },
  { name: 'Sayur Sop / Asem', defaultUnit: Unit.BUNGKUS, category: 'Sayuran' },

  // Buah-buahan
  { name: 'Apel', defaultUnit: Unit.BUAH, category: 'Buah-buahan' },
  { name: 'Pisang', defaultUnit: Unit.SISIR, category: 'Buah-buahan' },
  { name: 'Jeruk', defaultUnit: Unit.KG, category: 'Buah-buahan' },
  { name: 'Anggur', defaultUnit: Unit.KG, category: 'Buah-buahan' },
  { name: 'Mangga', defaultUnit: Unit.BUAH, category: 'Buah-buahan' },

  // Daging & Ikan
  { name: 'Ayam Potong', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
  { name: 'Ceker Ayam', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
  { name: 'Daging Sapi', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
  { name: 'Ikan Segar', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
  { name: 'Ikan Lele', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
  { name: 'Ikan Mas', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
  { name: 'Ikan Asin / Perasinan', defaultUnit: Unit.BUNGKUS, category: 'Daging & Ikan' },
  { name: 'Udang', defaultUnit: Unit.KG, category: 'Daging & Ikan' },

  // Bumbu Dapur
  { name: 'Bawang Merah', defaultUnit: Unit.KG, category: 'Bumbu Dapur' },
  { name: 'Bawang Putih', defaultUnit: Unit.KG, category: 'Bumbu Dapur' },
  { name: 'Bawang Daun', defaultUnit: Unit.IKAT, category: 'Bumbu Dapur' },
  { name: 'Bawang Bombay', defaultUnit: Unit.BUAH, category: 'Bumbu Dapur' },
  { name: 'Cabai Merah Keriting', defaultUnit: Unit.GRAM, category: 'Bumbu Dapur' },
  { name: 'Cabai Hijau Keriting', defaultUnit: Unit.GRAM, category: 'Bumbu Dapur' },
  { name: 'Cabai Rawit / Cengek', defaultUnit: Unit.GRAM, category: 'Bumbu Dapur' },
  { name: 'Jahe', defaultUnit: Unit.BUNGKUS, category: 'Bumbu Dapur' },
  { name: 'Kencur', defaultUnit: Unit.BUNGKUS, category: 'Bumbu Dapur' },
  { name: 'Kunyit', defaultUnit: Unit.BUNGKUS, category: 'Bumbu Dapur' },
  { name: 'Lengkuas', defaultUnit: Unit.BUNGKUS, category: 'Bumbu Dapur' },
  { name: 'Kemiri', defaultUnit: Unit.BUNGKUS, category: 'Bumbu Dapur' },
  { name: 'Terasi Bakar', defaultUnit: Unit.BUNGKUS, category: 'Bumbu Dapur' },
  { name: 'Ladaku / Merica', defaultUnit: Unit.SACHET, category: 'Bumbu Dapur' },
  { name: 'Jeruk Nipis', defaultUnit: Unit.BUAH, category: 'Bumbu Dapur' },
  { name: 'Jeruk Limau', defaultUnit: Unit.BUAH, category: 'Bumbu Dapur' },
  { name: 'Kecap Manis', defaultUnit: Unit.BOTOL, category: 'Bumbu Dapur' },
  { name: 'Saus Tomat', defaultUnit: Unit.BOTOL, category: 'Bumbu Dapur' },
  { name: 'Saus Sambal', defaultUnit: Unit.BOTOL, category: 'Bumbu Dapur' },
  { name: 'Merica Bubuk', defaultUnit: Unit.SACHET, category: 'Bumbu Dapur' },
  { name: 'Ketumbar Bubuk', defaultUnit: Unit.SACHET, category: 'Bumbu Dapur' },
  { name: 'Penyedap Rasa', defaultUnit: Unit.BUNGKUS, category: 'Bumbu Dapur' },
  { name: 'Gula Merah', defaultUnit: Unit.KG, category: 'Bumbu Dapur' },
  { name: 'Asam Jawa', defaultUnit: Unit.BUNGKUS, category: 'Bumbu Dapur' },

  // Kebutuhan Rumah Tangga
  { name: 'Plastik Bening', defaultUnit: Unit.PACK, category: 'Kebutuhan Rumah Tangga' },
  { name: 'Sabun Cuci Piring', defaultUnit: Unit.BOTOL, category: 'Kebutuhan Rumah Tangga' },
  { name: 'Deterjen', defaultUnit: Unit.BUNGKUS, category: 'Kebutuhan Rumah Tangga' },
  { name: 'Pembersih Lantai', defaultUnit: Unit.BOTOL, category: 'Kebutuhan Rumah Tangga' },
  { name: 'Pasta Gigi', defaultUnit: Unit.BUAH, category: 'Kebutuhan Rumah Tangga' },
  { name: 'Sabun Mandi', defaultUnit: Unit.BUAH, category: 'Kebutuhan Rumah Tangga' },
  { name: 'Shampo', defaultUnit: Unit.BOTOL, category: 'Kebutuhan Rumah Tangga' },
  { name: 'Tissue', defaultUnit: Unit.ROLL, category: 'Kebutuhan Rumah Tangga' },
  { name: 'Tisu Toilet', defaultUnit: Unit.ROLL, category: 'Kebutuhan Rumah Tangga' },
  { name: 'Spons Cuci Piring', defaultUnit: Unit.PCS, category: 'Kebutuhan Rumah Tangga' },
  { name: 'Sikat Gigi', defaultUnit: Unit.PCS, category: 'Kebutuhan Rumah Tangga' },
  { name: 'Obat Nyamuk', defaultUnit: Unit.BUNGKUS, category: 'Kebutuhan Rumah Tangga' },
  { name: 'Lampu Bohlam', defaultUnit: Unit.BUAH, category: 'Kebutuhan Rumah Tangga' },
  { name: 'Baterai', defaultUnit: Unit.SET, category: 'Kebutuhan Rumah Tangga' },

  // Makanan Ringan & Minuman
  { name: 'Roti Tawar', defaultUnit: Unit.BUNGKUS, category: 'Makanan Ringan & Minuman' },
  { name: 'Biskuit', defaultUnit: Unit.BUNGKUS, category: 'Makanan Ringan & Minuman' },
  { name: 'Keripik', defaultUnit: Unit.BUNGKUS, category: 'Makanan Ringan & Minuman' },
  { name: 'Air Mineral', defaultUnit: Unit.BOTOL, category: 'Makanan Ringan & Minuman' },
  { name: 'Sirup', defaultUnit: Unit.BOTOL, category: 'Makanan Ringan & Minuman' },
  { name: 'Cokelat', defaultUnit: Unit.BUNGKUS, category: 'Makanan Ringan & Minuman' },
];

// Red/Warm Elegant Theme Colors for Groups
export const GROUP_COLORS: string[] = [
  'bg-red-50',
  'bg-rose-50',
  'bg-orange-50',
  'bg-amber-50',
  'bg-stone-100',
  'bg-warmGray-100',
  'bg-pink-50',
  'bg-red-100',
];

export const formatCurrency = (amount: number | null): string => {
  if (amount === null || isNaN(amount)) return 'Rp -';
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

// Formats number input with dots (e.g. 15000 -> 15.000)
export const formatNumberInput = (value: number | string | null): string => {
  if (value === null || value === '') return '';
  const stringVal = value.toString().replace(/\./g, '');
  if (isNaN(Number(stringVal))) return '';
  return Number(stringVal).toLocaleString('id-ID');
};

// Parses formatted string back to number (e.g. 15.000 -> 15000)
export const parseNumberInput = (value: string): number => {
  return Number(value.replace(/\./g, ''));
};
