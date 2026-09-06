import React, { useState, useMemo, useEffect } from 'react';
import { PredefinedItem, ShoppingItem, Unit } from '../types';
import { PREDEFINED_ITEMS, PREDEFINED_UNITS, formatCurrency, formatNumberInput, parseNumberInput } from '../constants';
import Button from './Button';

interface SelectedIngredientData {
  item: PredefinedItem;
  quantity: number | null;
  unit: Unit | string | null;
  customEstPrice?: number | null;
}

interface IngredientPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMultipleItems: (items: Omit<ShoppingItem, 'id' | 'isChecked'>[]) => void;
  existingItemNames?: string[];
  priceHistory?: { [name: string]: number };
}

const DEFAULT_CATEGORIES = [
  'Semua',
  'Sembako',
  'Sayuran',
  'Bumbu Dapur',
  'Daging & Ikan',
  'Buah-buahan',
  'Kebutuhan Rumah Tangga',
  'Makanan Ringan & Minuman',
];

const CUSTOM_ITEMS_STORAGE_KEY = 'belanjaan_custom_predefined_items';

const IngredientPickerModal: React.FC<IngredientPickerModalProps> = ({
  isOpen,
  onClose,
  onAddMultipleItems,
  existingItemNames = [],
  priceHistory = {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedIngredientData>>(new Map());

  // Custom ingredients persisted in localStorage
  const [customItems, setCustomItems] = useState<PredefinedItem[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_ITEMS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Manual Input Form State
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCategory, setManualCategory] = useState('Bumbu Dapur');
  const [manualNewCategory, setManualNewCategory] = useState('');
  const [manualUnit, setManualUnit] = useState<string>('kg');
  const [manualQtyStr, setManualQtyStr] = useState<string>('1');
  const [manualEstPriceStr, setManualEstPriceStr] = useState<string>('');
  const [manualSaveDestination, setManualSaveDestination] = useState<'catalog_and_list' | 'list_only'>('catalog_and_list');
  const [formError, setFormError] = useState<string | null>(null);

  // Sync customItems to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_ITEMS_STORAGE_KEY, JSON.stringify(customItems));
    } catch (e) {
      console.error('Failed to save custom items to localStorage', e);
    }
  }, [customItems]);

  // Combined available items (Predefined + Custom)
  const allAvailableItems = useMemo(() => {
    return [...PREDEFINED_ITEMS, ...customItems];
  }, [customItems]);

  // Combined dynamic categories
  const dynamicCategories = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES);
    customItems.forEach(item => {
      if (item.category && item.category.trim()) {
        set.add(item.category.trim());
      }
    });
    return Array.from(set);
  }, [customItems]);

  // Existing names set for fast lookup
  const existingSet = useMemo(() => {
    return new Set((existingItemNames || []).map(n => (n || '').toLowerCase().trim()));
  }, [existingItemNames]);

  // Filtered items based on category and search
  const filteredList = useMemo(() => {
    return allAvailableItems.filter(item => {
      const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchCategory && matchSearch;
    });
  }, [allAvailableItems, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleToggleItem = (item: PredefinedItem) => {
    setSelectedItems(prev => {
      const next = new Map<string, SelectedIngredientData>(prev);
      if (next.has(item.name)) {
        next.delete(item.name);
      } else {
        next.set(item.name, {
          item,
          quantity: 1,
          unit: item.defaultUnit,
        });
      }
      return next;
    });
  };

  const handleUpdateQuantity = (name: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItems(prev => {
      const next = new Map<string, SelectedIngredientData>(prev);
      const current = next.get(name);
      if (!current) return prev;
      const currentQ = current.quantity ?? 1;
      const newQty = Math.max(1, currentQ + delta);
      next.set(name, { ...current, quantity: newQty });
      return next;
    });
  };

  const handleDeleteCustomItem = (itemName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomItems(prev => prev.filter(item => item.name.toLowerCase() !== itemName.toLowerCase()));
    setSelectedItems(prev => {
      const next = new Map(prev);
      next.delete(itemName);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedItems(prev => {
      const next = new Map<string, SelectedIngredientData>(prev);
      filteredList.forEach(item => {
        if (!next.has(item.name)) {
          next.set(item.name, {
            item,
            quantity: 1,
            unit: item.defaultUnit,
          });
        }
      });
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedItems(new Map());
  };

  const handleSaveManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = manualName.trim();
    if (!trimmedName) {
      setFormError('Nama bahan tidak boleh kosong.');
      return;
    }

    const resolvedCategory =
      manualCategory === 'TAMBAH_KATEGORI_BARU'
        ? (manualNewCategory.trim() || 'Lainnya')
        : manualCategory;

    const parsedQty = manualQtyStr.trim() === '' ? null : parseFloat(manualQtyStr);
    const parsedEstPrice = manualEstPriceStr.trim() === '' ? null : parseNumberInput(manualEstPriceStr);

    const newItemObj: PredefinedItem = {
      name: trimmedName,
      defaultUnit: manualUnit || 'buah',
      category: resolvedCategory,
      isCustom: true,
    };

    if (manualSaveDestination === 'catalog_and_list') {
      // 1. Simpan ke daftar pilihan bahan (kategori)
      setCustomItems(prev => {
        // Prevent exact duplicate in custom catalog
        const exists = prev.some(i => i.name.toLowerCase() === trimmedName.toLowerCase());
        if (exists) {
          return prev.map(i => (i.name.toLowerCase() === trimmedName.toLowerCase() ? newItemObj : i));
        }
        return [...prev, newItemObj];
      });
    }

    // 2. Selalu tambahkan ke selected items untuk dimasukkan ke daftar belanja
    setSelectedItems(prev => {
      const next = new Map(prev);
      next.set(trimmedName, {
        item: newItemObj,
        quantity: parsedQty !== null && !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : null,
        unit: manualUnit || null,
        customEstPrice: parsedEstPrice,
      });
      return next;
    });

    // Reset Form
    setManualName('');
    setManualQtyStr('1');
    setManualEstPriceStr('');
    setManualNewCategory('');
    setShowManualForm(false);
    setSelectedCategory(resolvedCategory); // Switch view to this category to see the item
  };

  const handleConfirmAdd = () => {
    if (selectedItems.size === 0) return;

    const itemsToAdd: Omit<ShoppingItem, 'id' | 'isChecked'>[] = Array.from(selectedItems.values()).map(
      ({ item, quantity, unit, customEstPrice }) => {
        const historyPrice = priceHistory[item.name];
        const est =
          customEstPrice !== undefined
            ? customEstPrice
            : historyPrice && quantity
            ? historyPrice * quantity
            : null;

        return {
          name: item.name,
          quantity,
          unit,
          estimatedPrice: est,
          realPrice: null,
          groupTag: item.category,
        };
      }
    );

    onAddMultipleItems(itemsToAdd);
    setSelectedItems(new Map());
    onClose();
  };

  const selectedCount = selectedItems.size;

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-rose-700 text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <span>🛒</span> Pilih Beberapa Bahan
            </h2>
            <p className="text-xs text-rose-100 mt-0.5">
              Pilih bahan dari daftar atau buat bahan kustom, lalu masukkan sekaligus ke daftar belanja.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors text-xl leading-none"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50 space-y-3">
          {/* Top Row: Search & Manual Add Toggle Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari bahan: misal Bawang, Beras, Ayam, Telur..."
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 shadow-xs"
              />
              <span className="absolute left-3.5 top-3 text-gray-400 text-sm">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-sm px-1.5"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowManualForm(!showManualForm)}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 ${
                showManualForm
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              <span>{showManualForm ? '✖ Tutup Form' : '✨ + Input Bahan Baru'}</span>
            </button>
          </div>

          {/* Collapsible Manual Input Form */}
          {showManualForm && (
            <form
              onSubmit={handleSaveManualItem}
              className="p-3.5 sm:p-4 bg-white rounded-xl border-2 border-rose-300 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <span>📝</span> Tambah Bahan Manual
                </h4>
                <span className="text-[11px] text-gray-500">
                  Bisa disimpan ke kategori atau hanya ke daftar belanja
                </span>
              </div>

              {formError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                  {formError}
                </div>
              )}

              {/* Input: Nama & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Bahan: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    placeholder="Misal: Ikan Bandeng Presto, Kecap Asin..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kategori Bahan:
                  </label>
                  <select
                    value={manualCategory}
                    onChange={e => setManualCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    {dynamicCategories
                      .filter(c => c !== 'Semua')
                      .map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    <option value="TAMBAH_KATEGORI_BARU">+ Tambah Kategori Baru...</option>
                  </select>

                  {manualCategory === 'TAMBAH_KATEGORI_BARU' && (
                    <input
                      type="text"
                      value={manualNewCategory}
                      onChange={e => setManualNewCategory(e.target.value)}
                      placeholder="Ketik nama kategori baru..."
                      className="w-full mt-1.5 px-3 py-1.5 border border-rose-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Input: Jumlah, Satuan, Estimasi Harga */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Jumlah: <span className="text-gray-400 font-normal">(opsional)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={manualQtyStr}
                    onChange={e => setManualQtyStr(e.target.value)}
                    placeholder="Kosongkan / 1"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Satuan:
                  </label>
                  <select
                    value={manualUnit}
                    onChange={e => setManualUnit(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    {PREDEFINED_UNITS.map(u => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Est. Harga: <span className="text-gray-400 font-normal">(Rp)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={manualEstPriceStr}
                    onChange={e => {
                      const num = e.target.value.replace(/[^0-9]/g, '');
                      setManualEstPriceStr(num ? Number(num).toLocaleString('id-ID') : '');
                    }}
                    placeholder="Misal: 15.000"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none text-right"
                  />
                </div>
              </div>

              {/* Storage Destination Options (User Choice) */}
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                <span className="text-xs font-bold text-gray-800 block">
                  Opsi Penyimpanan Bahan:
                </span>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="manualSaveDestination"
                    value="catalog_and_list"
                    checked={manualSaveDestination === 'catalog_and_list'}
                    onChange={() => setManualSaveDestination('catalog_and_list')}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <strong className="text-gray-900 block font-semibold">
                      Simpan ke kategori bahan (agar bisa dipilih lagi nanti)
                    </strong>
                    <span className="text-[11px] text-gray-500 leading-tight block mt-0.5">
                      Bahan ini akan disimpan di tab kategori yang dipilih dan selalu tersedia untuk sesi belanja mendatang.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="manualSaveDestination"
                    value="list_only"
                    checked={manualSaveDestination === 'list_only'}
                    onChange={() => setManualSaveDestination('list_only')}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <strong className="text-gray-900 block font-semibold">
                      Hanya tambahkan ke daftar belanja sekarang
                    </strong>
                    <span className="text-[11px] text-gray-500 leading-tight block mt-0.5">
                      Hanya dimasukkan ke daftar belanja saat ini tanpa disimpan permanen ke daftar pilihan bahan.
                    </span>
                  </div>
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Tambahkan Bahan
                </button>
              </div>
            </form>
          )}

          {/* Category Chips Scrollable */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {dynamicCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Quick Actions Row */}
          <div className="flex justify-between items-center text-xs text-gray-600 pt-1">
            <span>
              Menampilkan <strong>{filteredList.length}</strong> bahan
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAllFiltered}
                className="text-rose-700 hover:text-rose-900 font-semibold underline"
              >
                Pilih Semua Hasil
              </button>
              {selectedCount > 0 && (
                <button
                  onClick={handleClearSelection}
                  className="text-gray-500 hover:text-red-600 font-semibold"
                >
                  Batal Pilih
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Item Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">🔍</p>
              <p className="font-semibold text-sm">Bahan tidak ditemukan</p>
              <p className="text-xs mt-1">Coba kata kunci lain atau klik tombol &quot;+ Input Bahan Baru&quot; di atas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredList.map(item => {
                const isSelected = selectedItems.has(item.name);
                const isAlreadyInList = existingSet.has(item.name.toLowerCase().trim());
                const currentData = selectedItems.get(item.name);
                const hasHistoryPrice = priceHistory[item.name];

                return (
                  <div
                    key={item.name}
                    onClick={() => handleToggleItem(item)}
                    className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none flex flex-col justify-between ${
                      isSelected
                        ? 'bg-rose-50 border-rose-500 shadow-sm ring-1 ring-rose-500'
                        : isAlreadyInList
                        ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400 hover:shadow-xs'
                        : 'bg-white border-gray-200 hover:border-rose-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                          {isAlreadyInList && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                              Sudah ada di daftar
                            </span>
                          )}
                          {item.isCustom && (
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-medium px-1.5 py-0.2 rounded">
                              Kustom
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.category} • {item.defaultUnit}
                        </p>
                      </div>

                      {/* Right icons: Custom delete button and checkbox */}
                      <div className="flex items-center gap-1 shrink-0">
                        {item.isCustom && (
                          <button
                            type="button"
                            onClick={e => handleDeleteCustomItem(item.name, e)}
                            className="text-gray-400 hover:text-red-500 p-1 text-xs rounded hover:bg-gray-100"
                            title="Hapus bahan kustom ini dari pilihan"
                          >
                            🗑️
                          </button>
                        )}
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-rose-600 border-rose-600 text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer with quantity stepper if selected, or price hint */}
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                      {isSelected && currentData ? (
                        <div
                          className="flex items-center gap-2 w-full justify-between"
                          onClick={e => e.stopPropagation()}
                        >
                          <span className="text-xs font-semibold text-rose-800">
                            Jumlah: {currentData.quantity ?? 'Secukupnya'} {currentData.unit || ''}
                          </span>
                          <div className="flex items-center border border-rose-300 rounded-lg bg-white overflow-hidden shadow-xs">
                            <button
                              onClick={e => handleUpdateQuantity(item.name, -1, e)}
                              className="px-2 py-0.5 text-sm font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                              title="Kurangi"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-bold text-gray-800">
                              {currentData.quantity ?? 1}
                            </span>
                            <button
                              onClick={e => handleUpdateQuantity(item.name, 1, e)}
                              className="px-2 py-0.5 text-sm font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                              title="Tambah"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full text-[11px] text-gray-400">
                          <span>{isAlreadyInList ? '⚠️ Akan jadi duplikat' : 'Klik untuk memilih'}</span>
                          {hasHistoryPrice && (
                            <span className="text-gray-500 font-medium">
                              ~{formatCurrency(hasHistoryPrice)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
          <div className="text-xs sm:text-sm">
            <span className="font-bold text-gray-900">{selectedCount}</span> bahan dipilih
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} variant="ghost" size="sm">
              Batal
            </Button>
            <Button
              onClick={handleConfirmAdd}
              variant="primary"
              size="md"
              disabled={selectedCount === 0}
              className={`${
                selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : 'shadow-md'
              }`}
            >
              + Masukkan ({selectedCount}) ke Daftar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientPickerModal;
