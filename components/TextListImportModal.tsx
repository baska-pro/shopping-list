import React, { useState, useMemo } from 'react';
import { ShoppingItem, Unit } from '../types';
import { PREDEFINED_UNITS, formatCurrency, formatNumberInput } from '../constants';
import { parseShoppingTextList, ParsedShoppingItem } from '../utils/textParser';
import { findGenericClarification } from '../constants/clarifications';
import Button from './Button';

interface TextListImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMultipleItems: (items: Omit<ShoppingItem, 'id' | 'isChecked'>[]) => void;
  existingItemNames?: string[];
  priceHistory?: { [name: string]: number };
}

const EXAMPLE_TEXT = `Kol
Gula
Daging Ayam
Bawang Merah 1/2 kg
Cabai Rawit 250 gram
Minyak Goreng 2 liter
Telur Ayam 10 butir`;

const TextListImportModal: React.FC<TextListImportModalProps> = ({
  isOpen,
  onClose,
  onAddMultipleItems,
  existingItemNames = [],
  priceHistory = {},
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [editedItems, setEditedItems] = useState<ParsedShoppingItem[] | null>(null);

  // Parse text live
  const parsedItems = useMemo(() => {
    return parseShoppingTextList(rawText, priceHistory || {});
  }, [rawText, priceHistory]);

  // Use editedItems if user tweaked items manually, otherwise use parsedItems
  const itemsToDisplay = editedItems !== null ? editedItems : parsedItems;

  const existingSet = useMemo(() => {
    return new Set((existingItemNames || []).map(n => (n || '').toLowerCase().trim()));
  }, [existingItemNames]);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setRawText(text);
    setEditedItems(null); // Reset manual edits when text changes
  };

  const handleLoadExample = () => {
    handleTextChange(EXAMPLE_TEXT);
  };

  const handleClear = () => {
    handleTextChange('');
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText) {
          handleTextChange(clipboardText);
        }
      }
    } catch {
      // If clipboard permission is restricted in iframe, user can simply paste via keyboard/long-press
    }
  };

  const handleUpdateItem = (index: number, updates: Partial<ParsedShoppingItem>) => {
    const list = [...itemsToDisplay];
    list[index] = { ...list[index], ...updates };
    setEditedItems(list);
  };

  const handleRemoveItem = (index: number) => {
    const list = itemsToDisplay.filter((_, i) => i !== index);
    setEditedItems(list);
  };

  const handleConfirmSubmit = () => {
    if (itemsToDisplay.length === 0) return;

    const formatted: Omit<ShoppingItem, 'id' | 'isChecked'>[] = itemsToDisplay.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      estimatedPrice: item.estimatedPrice,
      realPrice: null,
      groupTag: item.category,
      note: item.note,
    }));

    onAddMultipleItems(formatted);
    setRawText('');
    setEditedItems(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-rose-700 text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <span>📋</span> Masukkan Daftar Belanja Teks
            </h2>
            <p className="text-xs text-rose-100 mt-0.5">
              Tempel atau ketik daftar bahan per baris. Format, jumlah, satuan, dan kategori akan otomatis terdeteksi.
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

        {/* Content Body: Two columns on medium+ screens, stacked on mobile */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gray-50 flex flex-col md:flex-row gap-4">
          {/* Left Column: Text Input & Controls */}
          <div className="flex-1 flex flex-col space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-gray-700">
                Tulis / Tempel Daftar Teks:
              </label>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="px-2 py-1 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-100 font-medium transition-colors"
                  title="Tempel dari Clipboard"
                >
                  📋 Tempel
                </button>
                <button
                  type="button"
                  onClick={handleLoadExample}
                  className="px-2 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-md hover:bg-rose-100 font-medium transition-colors"
                >
                  Contoh
                </button>
                {rawText && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-2 py-1 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-md font-medium transition-colors"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>

            <div className="relative flex-1 min-h-[160px] md:min-h-[260px]">
              <textarea
                value={rawText}
                onChange={e => handleTextChange(e.target.value)}
                placeholder={`Contoh penulisan:
Kol
Gula
Daging Ayam
Bayam 2 ikat
Bawang merah 1/2 kg
Minyak goreng 2 liter
(Ketik 1 nama bahan per baris)`}
                className="w-full h-full min-h-[180px] p-3 text-sm font-mono bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none shadow-xs text-gray-800 leading-relaxed"
                autoFocus
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-[11px] text-amber-900 leading-snug">
              💡 <strong>Tips Pintar:</strong> Anda bisa langsung menulis nama bahan saja (misal: <em>Kol</em>, <em>Gula</em>), atau sertakan jumlah/satuan (misal: <em>2 kg Beras</em> atau <em>Beras 2 kg</em>). Simbol nomor dan tanda strip akan dibersihkan otomatis.
            </div>
          </div>

          {/* Right Column: Live Detection & Format Preview */}
          <div className="flex-1 flex flex-col border border-gray-200 rounded-xl bg-white overflow-hidden shadow-xs">
            <div className="p-3 bg-gray-100/80 border-b border-gray-200 flex justify-between items-center">
              <span className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <span>✨</span> Format Hasil Deteksi
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                {itemsToDisplay.length} bahan
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 max-h-[300px] md:max-h-[360px] bg-gray-50/50">
              {itemsToDisplay.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                  <span className="text-3xl mb-2">📝</span>
                  <p className="text-xs font-medium text-gray-500">
                    Ketik atau tempel daftar bahan di sebelah kiri untuk melihat hasil konversi otomatis.
                  </p>
                </div>
              ) : (
                itemsToDisplay.map((item, idx) => {
                  const isExisting = existingSet.has(item.name.toLowerCase().trim());
                  const clarification = findGenericClarification(item.name);
                  return (
                    <div
                      key={item.idTemp || idx}
                      className="p-2.5 bg-white border border-gray-200 rounded-lg shadow-2xs hover:border-rose-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-gray-900 truncate">
                              {item.name}
                            </span>
                            {isExisting && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-1.5 py-0.2 rounded">
                                Ada di daftar
                              </span>
                            )}
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium">
                              {item.category}
                            </span>
                          </div>
                          {item.note && (
                            <p className="text-[11px] text-gray-500 italic mt-0.5">
                              Catatan: {item.note}
                            </p>
                          )}
                          {clarification && (
                            <div className="mt-1.5 p-1.5 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-800">
                              <span className="font-semibold">{clarification.icon} {clarification.question}</span>
                              <div className="flex gap-1 flex-wrap mt-1">
                                {clarification.options.slice(0, 6).map((opt) => (
                                  <button
                                    key={opt.name}
                                    type="button"
                                    onClick={() => handleUpdateItem(idx, { 
                                      name: opt.name, 
                                      unit: item.unit || opt.defaultUnit || item.unit, 
                                      category: opt.category || item.category 
                                    })}
                                    className="px-1.5 py-0.5 bg-white border border-rose-300 rounded hover:bg-rose-100 text-rose-700 font-medium transition-colors"
                                  >
                                    {opt.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Delete single item from preview */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-gray-400 hover:text-red-600 p-1 text-xs leading-none rounded"
                          title="Hapus baris ini"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Controls row for quantity & unit */}
                      <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-gray-500 text-[11px]">Jumlah:</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            placeholder="-"
                            value={item.quantity !== null && item.quantity !== undefined ? item.quantity : ''}
                            onChange={e => {
                              const val = e.target.value.trim();
                              handleUpdateItem(idx, {
                                quantity: val === '' ? null : parseFloat(val),
                              });
                            }}
                            className="w-14 px-1.5 py-0.5 border border-gray-300 rounded text-center text-xs font-bold bg-white"
                          />
                          <select
                            value={item.unit || ''}
                            onChange={e => handleUpdateItem(idx, { unit: e.target.value || null })}
                            className="px-1.5 py-0.5 border border-gray-300 rounded text-xs bg-white capitalize"
                          >
                            <option value="">-</option>
                            {PREDEFINED_UNITS.map(u => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-1 mt-1 sm:mt-0">
                          <span className="text-gray-500 text-[11px]">Harga: Rp</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={item.estimatedPrice ? formatNumberInput(item.estimatedPrice) : ''}
                            placeholder="0"
                            onChange={e => {
                              const raw = e.target.value.replace(/[^0-9]/g, '');
                              handleUpdateItem(idx, { estimatedPrice: raw ? Number(raw) : null });
                            }}
                            className="w-20 px-1.5 py-0.5 border border-gray-300 rounded text-right text-xs font-bold text-emerald-800 bg-white"
                            title="Perkiraan anggaran harga"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-white flex items-center justify-between gap-2">
          <div className="text-xs sm:text-sm text-gray-600">
            Total: <strong className="text-gray-900">{itemsToDisplay.length}</strong> barang siap dimasukkan
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} variant="ghost" size="sm">
              Batal
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              variant="primary"
              size="md"
              disabled={itemsToDisplay.length === 0}
              className={`${
                itemsToDisplay.length === 0 ? 'opacity-50 cursor-not-allowed' : 'shadow-md'
              }`}
            >
              + Masukkan ({itemsToDisplay.length}) ke Daftar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextListImportModal;
