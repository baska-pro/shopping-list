
import React, { useState, useEffect } from 'react';
import { Unit, ShoppingItem, PredefinedItem } from '../types';
import { PREDEFINED_ITEMS, PREDEFINED_UNITS, formatNumberInput } from '../constants';
import { findGenericClarification, GenericClarification } from '../constants/clarifications';
import ProductClarificationModal from './ProductClarificationModal';
import Button from './Button';
import Input from './Input';
import Select from './Select';

interface AddItemFormProps {
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'isChecked'>) => void;
  priceHistory: { [name: string]: number };
  onOpenPicker?: () => void;
  onOpenTextImport?: () => void;
  onOpenVoiceInput?: () => void;
  onOpenRecipePicker?: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({
  onAddItem,
  priceHistory,
  onOpenPicker,
  onOpenTextImport,
  onOpenVoiceInput,
  onOpenRecipePicker,
}) => {
  const [itemName, setItemName] = useState<string>('');
  const [quantityStr, setQuantityStr] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [customUnit, setCustomUnit] = useState<string>('');
  const [estimatedPrice, setEstimatedPrice] = useState<number | ''>('');
  const [filteredItems, setFilteredItems] = useState<PredefinedItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [groupTag, setGroupTag] = useState<string>('');
  const [pendingClarification, setPendingClarification] = useState<GenericClarification | null>(null);

  useEffect(() => {
    if (itemName.length > 0) {
      const filtered = PREDEFINED_ITEMS.filter(item =>
        item.name.toLowerCase().includes(itemName.toLowerCase())
      );
      setFilteredItems(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredItems([]);
      setShowSuggestions(false);
    }
  }, [itemName]);

  const handleSelectItem = (item: PredefinedItem) => {
    setItemName(item.name);
    setUnit(item.defaultUnit);
    setGroupTag(item.category);
    setShowSuggestions(false);
  };

  const commitAddItem = (
    finalName: string,
    overrideUnit?: string,
    overrideCategory?: string
  ) => {
    const parsedQty = quantityStr.trim() === '' ? null : parseFloat(quantityStr);
    const chosenUnit = overrideUnit || (unit === Unit.LAINNYA ? customUnit.trim() : (unit || null));
    const chosenCategory = overrideCategory || groupTag.trim() || null;

    onAddItem({
      name: finalName.trim(),
      quantity: parsedQty !== null && !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : null,
      unit: chosenUnit || null,
      estimatedPrice: estimatedPrice === '' ? null : Number(estimatedPrice),
      realPrice: null,
      groupTag: chosenCategory,
    });

    // Reset form
    setItemName('');
    setQuantityStr('');
    setUnit('');
    setCustomUnit('');
    setEstimatedPrice('');
    setGroupTag('');
    setShowSuggestions(false);
    setPendingClarification(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = itemName.trim();
    if (!cleanName) return;

    // Check if item name is generic (e.g. 'ikan', 'daging', 'bawang', 'cabe')
    const clarification = findGenericClarification(cleanName);
    if (clarification) {
      setPendingClarification(clarification);
      return;
    }

    commitAddItem(cleanName);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const historyPrice = itemName.trim() ? priceHistory[itemName.trim()] : null;

  return (
    <div className="bg-white p-4 sm:p-5 shadow-lg rounded-xl mb-6 border-t-4 border-rose-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="bg-rose-100 text-rose-600 p-2 rounded-full mr-2">
            📝
          </span>
          Tambah Barang
        </h2>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {onOpenVoiceInput && (
            <button
              type="button"
              onClick={onOpenVoiceInput}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs sm:text-sm rounded-lg transition-all shadow-xs active:scale-95 ring-2 ring-rose-200"
              title="Katakan belanjaan Anda langsung lewat mikrofon"
            >
              <span>🎙️</span>
              <span>Input Suara</span>
            </button>
          )}
          {onOpenRecipePicker && (
            <button
              type="button"
              onClick={onOpenRecipePicker}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-lg transition-colors shadow-xs active:scale-95"
              title="Pilih menu masakan dan masukkan bahannya ke daftar belanja"
            >
              <span>🍳</span>
              <span>Dari Resep</span>
            </button>
          )}
          {onOpenPicker && (
            <button
              type="button"
              onClick={onOpenPicker}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-xs active:scale-95"
            >
              <span>🛒</span>
              <span>Pilih Bahan</span>
            </button>
          )}
          {onOpenTextImport && (
            <button
              type="button"
              onClick={onOpenTextImport}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-xs active:scale-95"
            >
              <span>📋</span>
              <span>Teks</span>
            </button>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-bold text-gray-700">
                Nama Barang *
              </label>
              {onOpenVoiceInput && (
                <button
                  type="button"
                  onClick={onOpenVoiceInput}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 hover:underline"
                  title="Gunakan suara untuk mengisi barang"
                >
                  <span>🎙️</span>
                  <span>Input Suara</span>
                </button>
              )}
            </div>
            <Input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onFocus={() => itemName && setShowSuggestions(true)}
              onBlur={handleBlur}
              placeholder="Contoh: Ikan, Bawang, Beras"
              autoComplete="off"
              required
            />
            {showSuggestions && filteredItems.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto mt-1 ring-1 ring-black ring-opacity-5">
                {filteredItems.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectItem(item)}
                    className="px-4 py-3 hover:bg-rose-50 cursor-pointer text-sm text-gray-900 border-b last:border-0 border-gray-100"
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-gray-500 text-xs">{item.category}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-2">
            <div className="w-1/3">
              <Input
                label="Jumlah"
                type="number"
                inputMode="decimal"
                step="any"
                min="0.01"
                placeholder="- (Opsional)"
                value={quantityStr}
                onChange={(e) => setQuantityStr(e.target.value)}
              />
            </div>
            <div className="w-2/3">
              <Select
                label="Satuan"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                options={[
                  { value: '', label: '- Pilih Satuan (Opsional) -' },
                  ...PREDEFINED_UNITS.map(u => ({ value: u, label: u }))
                ]}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unit === Unit.LAINNYA && (
            <Input
              label="Satuan Custom"
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
              placeholder="Contoh: Piring, Bungkus"
            />
          )}
          
          <div>
            <Input
              label="Perkiraan Anggaran / Budget (Opsional)"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={estimatedPrice !== '' ? formatNumberInput(estimatedPrice) : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                setEstimatedPrice(raw ? Number(raw) : '');
              }}
              placeholder="Kosongkan jika ingin isi saat belanja"
            />
            {historyPrice && (
              <div className="mt-1 flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                <span>Riwayat harga beli: <b>Rp {formatNumberInput(historyPrice)}</b></span>
                <button
                  type="button"
                  onClick={() => setEstimatedPrice(historyPrice)}
                  className="text-rose-600 hover:text-rose-800 font-semibold underline text-[11px]"
                >
                  Pakai Angka Ini
                </button>
              </div>
            )}
          </div>

          <Input
            label="Kelompok / Kategori (Opsional)"
            value={groupTag}
            onChange={(e) => setGroupTag(e.target.value)}
            placeholder="Contoh: Bumbu Dapur, Sayuran, Pasar"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" className="w-full md:w-auto shadow-md">
            + Tambah ke Daftar
          </Button>
        </div>
      </form>

      {/* Product Clarification Modal for generic names like 'ikan', 'daging', etc. */}
      <ProductClarificationModal
        isOpen={Boolean(pendingClarification)}
        clarification={pendingClarification}
        currentName={itemName}
        onSelectOption={(optionName, defaultUnit, category) => {
          commitAddItem(optionName, defaultUnit, category);
        }}
        onKeepGeneric={() => {
          commitAddItem(itemName);
        }}
        onClose={() => setPendingClarification(null)}
      />
    </div>
  );
};

export default AddItemForm;
