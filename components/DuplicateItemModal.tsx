import React, { useState, useEffect } from 'react';
import { ShoppingItem, Unit } from '../types';
import { PREDEFINED_UNITS, formatCurrency } from '../constants';

export interface DuplicateItemModalProps {
  isOpen: boolean;
  existingItem: ShoppingItem | null;
  newItemData: Omit<ShoppingItem, 'id' | 'isChecked'> | null;
  onClose: () => void;
  onMergeOrUpdate: (updatedItem: ShoppingItem) => void;
  onReplace: (updatedItem: ShoppingItem) => void;
  onDeleteExisting: (id: string) => void;
  onAddSeparate?: (newItemData: Omit<ShoppingItem, 'id' | 'isChecked'>) => void;
}

const DuplicateItemModal: React.FC<DuplicateItemModalProps> = ({
  isOpen,
  existingItem,
  newItemData,
  onClose,
  onMergeOrUpdate,
  onReplace,
  onDeleteExisting,
  onAddSeparate,
}) => {
  const [isCustomEditing, setIsCustomEditing] = useState<boolean>(false);
  const [editedQty, setEditedQty] = useState<number>(1);
  const [editedUnit, setEditedUnit] = useState<string>('kg');
  const [editedPrice, setEditedPrice] = useState<string>('');
  const [editedNote, setEditedNote] = useState<string>('');

  useEffect(() => {
    if (existingItem && newItemData) {
      const existingQ = existingItem.quantity ?? 0;
      const newQ = newItemData.quantity ?? 0;
      const totalQ = existingQ + newQ;
      const mergedQty = totalQ > 0 ? Math.round(totalQ * 100) / 100 : 1;
      setEditedQty(mergedQty);
      setEditedUnit(existingItem.unit || newItemData.unit || 'kg');
      
      const calcPrice = (newItemData.estimatedPrice ?? 0) > 0 
        ? (newItemData.estimatedPrice || 0) 
        : (existingItem.estimatedPrice ?? 0);
      setEditedPrice(calcPrice > 0 ? calcPrice.toString() : '');

      const mergedNote = [existingItem.note, newItemData.note].filter(Boolean).join(', ');
      setEditedNote(mergedNote);
      setIsCustomEditing(false);
    }
  }, [existingItem, newItemData, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !existingItem || !newItemData) return null;

  const handleQuickAddQty = () => {
    const existingQ = existingItem.quantity ?? 0;
    const newQ = newItemData.quantity ?? 0;
    const totalQ = existingQ + newQ;
    const mergedQty = totalQ > 0 ? Math.round(totalQ * 100) / 100 : null;
    const mergedPrice = (existingItem.estimatedPrice || 0) + (newItemData.estimatedPrice || 0);
    const mergedNote = [existingItem.note, newItemData.note].filter(Boolean).join(', ');

    onMergeOrUpdate({
      ...existingItem,
      quantity: mergedQty,
      estimatedPrice: mergedPrice > 0 ? mergedPrice : existingItem.estimatedPrice,
      note: mergedNote || existingItem.note,
    });
    onClose();
  };

  const handleSaveCustomEdit = () => {
    const numPrice = editedPrice ? parseInt(editedPrice.replace(/\D/g, ''), 10) : null;
    onMergeOrUpdate({
      ...existingItem,
      quantity: editedQty > 0 ? editedQty : 1,
      unit: editedUnit,
      estimatedPrice: numPrice,
      note: editedNote || undefined,
    });
    onClose();
  };

  const handleReplaceAction = () => {
    onReplace({
      ...existingItem,
      name: newItemData.name,
      quantity: newItemData.quantity,
      unit: newItemData.unit,
      estimatedPrice: newItemData.estimatedPrice,
      groupTag: newItemData.groupTag || existingItem.groupTag,
      note: newItemData.note,
    });
    onClose();
  };

  const handleDeleteAction = () => {
    onDeleteExisting(existingItem.id);
    onClose();
  };

  const handleAddSeparateAction = () => {
    if (onAddSeparate) {
      onAddSeparate(newItemData);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-amber-50 border-b border-amber-200 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-sm">
            ⚠️
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                Barang Sudah Ada
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mt-0.5 truncate">
              {existingItem.name}
            </h3>
            <p className="text-xs text-amber-900/80 mt-0.5">
              Barang ini sudah ada di daftar belanja. Pilih tindakan yang Anda inginkan:
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 text-base leading-none rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">
                📌 Di Daftar Saat Ini
              </span>
              <p className="text-sm font-bold text-gray-900">
                {existingItem.quantity} {existingItem.unit}
              </p>
              <p className="text-gray-600 mt-1">
                Estimasi: <strong className="text-gray-800">{formatCurrency(existingItem.estimatedPrice)}</strong>
              </p>
              {existingItem.note && (
                <p className="text-gray-500 italic mt-0.5 truncate">
                  Ket: {existingItem.note}
                </p>
              )}
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
              <span className="font-bold text-rose-600 uppercase tracking-wider text-[10px] block mb-1">
                ✨ Yang Baru Dimasukkan
              </span>
              <p className="text-sm font-bold text-rose-950">
                {newItemData.quantity} {newItemData.unit}
              </p>
              <p className="text-rose-900 mt-1">
                Estimasi: <strong className="text-rose-950">{formatCurrency(newItemData.estimatedPrice)}</strong>
              </p>
              {newItemData.note && (
                <p className="text-rose-800/80 italic mt-0.5 truncate">
                  Ket: {newItemData.note}
                </p>
              )}
            </div>
          </div>

          {/* Detailed Custom Edit section if toggled */}
          {isCustomEditing ? (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  ✏️ Sesuaikan Data Barang
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomEditing(false)}
                  className="text-xs text-blue-700 underline"
                >
                  Batal Edit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Jumlah</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={editedQty}
                    onChange={(e) => setEditedQty(parseFloat(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Satuan</label>
                  <select
                    value={editedUnit}
                    onChange={(e) => setEditedUnit(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    {PREDEFINED_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Perkiraan Harga (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={editedPrice}
                    onChange={(e) => setEditedPrice(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 10000"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Catatan</label>
                  <input
                    type="text"
                    value={editedNote}
                    onChange={(e) => setEditedNote(e.target.value)}
                    placeholder="Contoh: Ukuran 1/2 kg"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveCustomEdit}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>
          ) : (
            /* Action Choices */
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Pilih Opsi:
              </span>

              {/* Option 0: Separate item */}
              <button
                type="button"
                onClick={handleAddSeparateAction}
                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                    📄
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                      Pisahkan (Tetap Tambah Sebagai Baris Baru)
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Jangan gabungkan, buat baris belanjaan baru untuk barang ini.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700">Pilih →</span>
              </button>

              {/* Option 1: Add Quantity / Merge */}
              <button
                type="button"
                onClick={handleQuickAddQty}
                className="w-full text-left p-3 rounded-xl border border-rose-200 hover:border-rose-400 bg-rose-50/50 hover:bg-rose-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                    ➕
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                      Tambah Jumlah (Gabungkan)
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Jumlah menjadi <strong>{Math.round((existingItem.quantity + newItemData.quantity) * 100) / 100} {existingItem.unit}</strong>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-700">Pilih →</span>
              </button>

              {/* Option 2: Edit Custom Data */}
              <button
                type="button"
                onClick={() => setIsCustomEditing(true)}
                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                    ✏️
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                      Edit Rincian Barang
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Ubah jumlah, satuan, estimasi harga, atau catatan secara manual.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-700">Pilih →</span>
              </button>

              {/* Option 3: Replace with new */}
              <button
                type="button"
                onClick={handleReplaceAction}
                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                    🔄
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                      Ganti dengan Data Baru (Timpa)
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Pakai jumlah {newItemData.quantity} {newItemData.unit} dan abaikan data lama.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-800">Pilih →</span>
              </button>

              {/* Option 4: Delete item */}
              <button
                type="button"
                onClick={handleDeleteAction}
                className="w-full text-left p-3 rounded-xl border border-red-200 hover:border-red-400 bg-red-50/30 hover:bg-red-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                    🗑️
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-red-700">
                      Hapus Barang dari Daftar
                    </h4>
                    <p className="text-[11px] text-red-500">
                      Hapus &quot;{existingItem.name}&quot; dari daftar belanja saat ini.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-700">Hapus →</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors"
          >
            Batal (Jangan Ubah)
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateItemModal;
