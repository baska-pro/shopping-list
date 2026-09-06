import { Unit } from '../types';

export interface GenericItemOption {
  name: string;
  defaultUnit?: Unit | string;
  category?: string;
}

export interface GenericClarification {
  key: string;
  matchPattern: RegExp;
  displayName: string;
  question: string;
  icon: string;
  options: GenericItemOption[];
}

export const GENERIC_CLARIFICATIONS: GenericClarification[] = [
  {
    key: 'ikan',
    matchPattern: /^(ikan|fish)(\s+(segar|laut|air\s*tawar|kolam))?$/i,
    displayName: 'Ikan',
    question: 'Ikan apa yang ingin Anda beli?',
    icon: '🐟',
    options: [
      { name: 'Ikan Kembung', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Ikan Mas', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Ikan Lele', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Ikan Nila', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Ikan Tongkol', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Ikan Gurame', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Ikan Bandeng', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Ikan Bawal', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Ikan Patin', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Ikan Teri', defaultUnit: Unit.BUNGKUS, category: 'Daging & Ikan' },
      { name: 'Ikan Asin', defaultUnit: Unit.BUNGKUS, category: 'Daging & Ikan' },
      { name: 'Ikan Kakap', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Ikan Salmon', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
    ],
  },
  {
    key: 'daging',
    matchPattern: /^(daging)(\s+(segar|mentah|kiloan))?$/i,
    displayName: 'Daging',
    question: 'Daging apa yang ingin Anda beli?',
    icon: '🥩',
    options: [
      { name: 'Daging Sapi', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Daging Ayam', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Daging Kambing', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Daging Giling / Cincang', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Daging Has Dalam (Tenderloin)', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Daging Sandung Lamur (Rawon/Soto)', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Daging Rendang', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
    ],
  },
  {
    key: 'ayam',
    matchPattern: /^(ayam)(\s+(segar|potong))?$/i,
    displayName: 'Ayam',
    question: 'Bagian atau jenis ayam apa yang ingin dibeli?',
    icon: '🍗',
    options: [
      { name: 'Ayam Potong Negeri', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Ayam Kampung', defaultUnit: Unit.BUAH, category: 'Daging & Ikan' },
      { name: 'Dada Ayam Fillet', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Paha Ayam', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Sayap Ayam', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Ceker Ayam', defaultUnit: Unit.KG, category: 'Daging & Ikan' },
      { name: 'Ati Ampela Ayam', defaultUnit: Unit.BUNGKUS, category: 'Daging & Ikan' },
    ],
  },
  {
    key: 'cabai',
    matchPattern: /^(cabe|cabai|lombok)(\s+(segar))?$/i,
    displayName: 'Cabai',
    question: 'Jenis cabai apa yang ingin Anda beli?',
    icon: '🌶️',
    options: [
      { name: 'Cabai Rawit Merah (Cengek)', defaultUnit: Unit.GRAM, category: 'Bumbu Dapur' },
      { name: 'Cabai Rawit Hijau', defaultUnit: Unit.GRAM, category: 'Bumbu Dapur' },
      { name: 'Cabai Merah Keriting', defaultUnit: Unit.GRAM, category: 'Bumbu Dapur' },
      { name: 'Cabai Hijau Keriting', defaultUnit: Unit.GRAM, category: 'Bumbu Dapur' },
      { name: 'Cabai Merah Besar', defaultUnit: Unit.GRAM, category: 'Bumbu Dapur' },
      { name: 'Cabai Hijau Besar', defaultUnit: Unit.GRAM, category: 'Bumbu Dapur' },
      { name: 'Cabai Giling', defaultUnit: Unit.BUNGKUS, category: 'Bumbu Dapur' },
    ],
  },
  {
    key: 'bawang',
    matchPattern: /^(bawang)(\s+(segar|mentah))?$/i,
    displayName: 'Bawang',
    question: 'Bawang apa yang ingin Anda beli?',
    icon: '🧅',
    options: [
      { name: 'Bawang Merah', defaultUnit: Unit.KG, category: 'Bumbu Dapur' },
      { name: 'Bawang Putih', defaultUnit: Unit.KG, category: 'Bumbu Dapur' },
      { name: 'Bawang Bombay', defaultUnit: Unit.BUAH, category: 'Bumbu Dapur' },
      { name: 'Daun Bawang', defaultUnit: Unit.IKAT, category: 'Bumbu Dapur' },
      { name: 'Bawang Goreng', defaultUnit: Unit.BUNGKUS, category: 'Bumbu Dapur' },
    ],
  },
  {
    key: 'minyak',
    matchPattern: /^(minyak)(\s+(goreng|masak|dapur))?$/i,
    displayName: 'Minyak',
    question: 'Minyak apa yang ingin Anda beli?',
    icon: '🛢️',
    options: [
      { name: 'Minyak Goreng Sawit', defaultUnit: Unit.LITER, category: 'Sembako' },
      { name: 'Minyak Kelapa', defaultUnit: Unit.BOTOL, category: 'Sembako' },
      { name: 'Minyak Jagung', defaultUnit: Unit.BOTOL, category: 'Sembako' },
      { name: 'Minyak Zaitun (Olive Oil)', defaultUnit: Unit.BOTOL, category: 'Sembako' },
      { name: 'Minyak Wijen', defaultUnit: Unit.BOTOL, category: 'Bumbu Dapur' },
    ],
  },
  {
    key: 'telur',
    matchPattern: /^(telur|telor)(\s+(segar))?$/i,
    displayName: 'Telur',
    question: 'Telur apa yang ingin Anda beli?',
    icon: '🥚',
    options: [
      { name: 'Telur Ayam Negeri', defaultUnit: Unit.KG, category: 'Sembako' },
      { name: 'Telur Ayam Kampung', defaultUnit: Unit.BIJI, category: 'Sembako' },
      { name: 'Telur Bebek', defaultUnit: Unit.BIJI, category: 'Sembako' },
      { name: 'Telur Puyuh', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
      { name: 'Telur Asin', defaultUnit: Unit.BIJI, category: 'Sembako' },
    ],
  },
  {
    key: 'beras',
    matchPattern: /^(beras)(\s+(putih|makan))?$/i,
    displayName: 'Beras',
    question: 'Jenis beras apa yang ingin dibeli?',
    icon: '🌾',
    options: [
      { name: 'Beras Pandan Wangi', defaultUnit: Unit.KG, category: 'Sembako' },
      { name: 'Beras Rojo Lele', defaultUnit: Unit.KG, category: 'Sembako' },
      { name: 'Beras Setra Ramos', defaultUnit: Unit.KG, category: 'Sembako' },
      { name: 'Beras Ketan Putih', defaultUnit: Unit.KG, category: 'Sembako' },
      { name: 'Beras Merah', defaultUnit: Unit.KG, category: 'Sembako' },
    ],
  },
  {
    key: 'sayur',
    matchPattern: /^(sayur|sayuran)(\s+(segar|mentah))?$/i,
    displayName: 'Sayur',
    question: 'Sayur apa yang ingin Anda beli?',
    icon: '🥬',
    options: [
      { name: 'Sayur Bayam', defaultUnit: Unit.IKAT, category: 'Sayuran' },
      { name: 'Sayur Kangkung', defaultUnit: Unit.IKAT, category: 'Sayuran' },
      { name: 'Sayur Sawi Hijau / Caisim', defaultUnit: Unit.IKAT, category: 'Sayuran' },
      { name: 'Sayur Sop (Paket)', defaultUnit: Unit.BUNGKUS, category: 'Sayuran' },
      { name: 'Sayur Asem (Paket)', defaultUnit: Unit.BUNGKUS, category: 'Sayuran' },
      { name: 'Sayur Lodeh (Paket)', defaultUnit: Unit.BUNGKUS, category: 'Sayuran' },
      { name: 'Sayur Buncis', defaultUnit: Unit.KG, category: 'Sayuran' },
      { name: 'Sayur Kol', defaultUnit: Unit.BUAH, category: 'Sayuran' },
    ],
  },
  {
    key: 'tahu',
    matchPattern: /^(tahu)(\s+(mentah|segar))?$/i,
    displayName: 'Tahu',
    question: 'Jenis tahu apa yang ingin dibeli?',
    icon: '🧈',
    options: [
      { name: 'Tahu Putih', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
      { name: 'Tahu Kuning', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
      { name: 'Tahu Pong / Kopong', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
      { name: 'Tahu Sutra / Tofu', defaultUnit: Unit.BUAH, category: 'Sembako' },
      { name: 'Tahu Cokelat / Segitiga', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
    ],
  },
  {
    key: 'tempe',
    matchPattern: /^(tempe|tempeh)(\s+(mentah|segar))?$/i,
    displayName: 'Tempe',
    question: 'Jenis tempe apa yang ingin dibeli?',
    icon: '🥢',
    options: [
      { name: 'Tempe Papan / Balok', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
      { name: 'Tempe Daun', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
      { name: 'Tempe Mendoan', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
    ],
  },
  {
    key: 'tepung',
    matchPattern: /^(tepung)(\s+(masak|dapur))?$/i,
    displayName: 'Tepung',
    question: 'Jenis tepung apa yang ingin dibeli?',
    icon: '🌾',
    options: [
      { name: 'Tepung Terigu', defaultUnit: Unit.KG, category: 'Sembako' },
      { name: 'Tepung Tapioka / Aci', defaultUnit: Unit.KG, category: 'Sembako' },
      { name: 'Tepung Beras', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
      { name: 'Tepung Maizena', defaultUnit: Unit.KARDUS, category: 'Sembako' },
      { name: 'Tepung Bumbu Serbaguna', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
      { name: 'Tepung Ketan', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
    ],
  },
  {
    key: 'mie',
    matchPattern: /^(mie|mi)(\s+(masak))?$/i,
    displayName: 'Mie',
    question: 'Jenis mie apa yang ingin dibeli?',
    icon: '🍜',
    options: [
      { name: 'Mie Telur', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
      { name: 'Mie Instan', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
      { name: 'Mie Bihun', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
      { name: 'Mie Soun', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
      { name: 'Mie Basah Kuning', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
      { name: 'Kwetiau', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
    ],
  },
  {
    key: 'kerupuk',
    matchPattern: /^(kerupuk|krupuk)(\s+(mentah|matang))?$/i,
    displayName: 'Kerupuk',
    question: 'Jenis kerupuk apa yang ingin dibeli?',
    icon: '🍘',
    options: [
      { name: 'Kerupuk Bawang', defaultUnit: Unit.BUNGKUS, category: 'Makanan Ringan & Minuman' },
      { name: 'Kerupuk Udang', defaultUnit: Unit.BUNGKUS, category: 'Makanan Ringan & Minuman' },
      { name: 'Kerupuk Putih Kaleng', defaultUnit: Unit.BUNGKUS, category: 'Makanan Ringan & Minuman' },
      { name: 'Kerupuk Kulit / Rambak', defaultUnit: Unit.BUNGKUS, category: 'Makanan Ringan & Minuman' },
      { name: 'Kerupuk Ikan', defaultUnit: Unit.BUNGKUS, category: 'Makanan Ringan & Minuman' },
    ],
  },
  {
    key: 'gula',
    matchPattern: /^(gula)(\s+(dapur))?$/i,
    displayName: 'Gula',
    question: 'Jenis gula apa yang ingin dibeli?',
    icon: '🍬',
    options: [
      { name: 'Gula Pasir Putih', defaultUnit: Unit.KG, category: 'Sembako' },
      { name: 'Gula Merah / Kelapa', defaultUnit: Unit.KG, category: 'Bumbu Dapur' },
      { name: 'Gula Aren', defaultUnit: Unit.BUNGKUS, category: 'Bumbu Dapur' },
      { name: 'Gula Batu', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
      { name: 'Gula Halus', defaultUnit: Unit.BUNGKUS, category: 'Sembako' },
    ],
  },
];

/**
 * Checks if a product name is generic and requires clarification.
 * E.g., 'ikan' -> returns clarification with options ('Ikan Mas', 'Ikan Lele', ...)
 * 'ikan mas' -> returns null because it's already specific!
 */
export function findGenericClarification(rawName: string): GenericClarification | null {
  const trimmed = rawName.trim();
  if (!trimmed) return null;

  for (const item of GENERIC_CLARIFICATIONS) {
    if (item.matchPattern.test(trimmed)) {
      return item;
    }
  }
  return null;
}
