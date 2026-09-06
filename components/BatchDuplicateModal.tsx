import React, { useState, useEffect } from 'react';
import { ShoppingItem } from '../types';
import { formatCurrency } from '../constants';
import Button from './Button';

export type DuplicateAction = 'separate' | 'merge' | 'replace' | 'skip';

export interface BatchDuplicateItem {
  existing: ShoppingItem;
  incoming: Omit<ShoppingItem, 'id' | 'isChecked'>;
}

interface BatchDuplicateModalProps {
  isOpen: boolean;
  duplicateItems: BatchDuplicateItem[];
  nonDuplicateItems: Array<Omit<ShoppingItem, 'id' | 'isChecked'>>;
  onConfirm: (
    decisions: Array<{
      incoming: Omit<ShoppingItem, 'id' | 'isChecked'>;
      existing: ShoppingItem;
      action: DuplicateAction;
    }>,
    nonDuplicates: Array<Omit<ShoppingItem, 'id' | 'isChecked'>>
  ) => void;
  onClose: () => void;
}

const BatchDuplicateModal: React.FC<BatchDuplicateModalProps> = ({
  isOpen,
  duplicateItems,
  nonDuplicateItems,
  onConfirm,
  onClose,
}) => {
  // Store decision per duplicate index
  const [decisions, setDecisions] = useState<DuplicateAction[]>([]);

  useEffect(() => {
    // Default to 'separate' or 'merge' - let's default to 'separate' so nothing is overwritten silently!
    setDecisions(duplicateItems.map(() => 'separate'));
  }, [duplicateItems]);

  if (!isOpen || duplicateItems.length === 0) return null;

  const handleSetAll = (action: DuplicateAction) => {
    setDecisions(duplicateItems.map(() => action));
  };

  const handleSetItemAction = (index: number, action: DuplicateAction) => {
    setDecisions(prev => {
      const next = [...prev];
      next[index] = action;
      return next;
    });
  };

  const handleSubmit = () => {
    const result = duplicateItems.map((item, index) => ({
      incoming: item.incoming,
      existing: item.existing,
      action: decisions[index] || 'separate',
    }));
    onConfirm(result, nonDuplicateItems);
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-amber-500 text-white flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="text-2xl sm:text-3xl">⚠️</span>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Ditemukan {duplicateItems.length} Barang yang Sudah Ada di Daftar
              </h3>
              <p className="text-xs text-amber-100 mt-0.5 leading-relaxed">
                Beberapa barang yang Anda pilih/masukkan memiliki nama yang sama dengan yang sudah ada di daftar belanja saat ini.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors text-lg leading-none"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Global Action Shortcut bar */}
        <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-amber-900">Terapkan ke semua:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleSetAll('separate')}
              className="px-2.5 py-1 rounded-md bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-medium transition-colors"
            >
              📄 Pisahkan Semua (Baris Baru)
            </button>
            <button
              type="button"
              onClick={() => handleSetAll('merge')}
              className="px-2.5 py-1 rounded-md bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-medium transition-colors"
            >
              ➕ Gabungkan Semua
            </button>
            <button
              type="button"
              onClick={() => handleSetAll('skip')}
              className="px-2.5 py-1 rounded-md bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-medium transition-colors"
            >
              ⏭️ Lewati Semua
            </button>
          </div>
        </div>

        {/* List of Duplicate Items */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 bg-gray-50">
          {duplicateItems.map((item, idx) => {
            const currentAction = decisions[idx] || 'separate';
            const existingQtyStr = item.existing.quantity ? `${item.existing.quantity} ${item.existing.unit || ''}`.trim() : (item.existing.unit || 'Secukupnya');
            const incomingQtyStr = item.incoming.quantity ? `${item.incoming.quantity} ${item.incoming.unit || ''}`.trim() : (item.incoming.unit || 'Secukupnya');
            const mergedTotalQty = (item.existing.quantity ?? 0) + (item.incoming.quantity ?? 0);

            return (
              <div
                key={idx}
                className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {item.incoming.name}
                  </h4>
                  <span className="text-[11px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Duplikat
                  </span>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Sudah Ada di Daftar:
                    </span>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {existingQtyStr}
                    </p>
                    {item.existing.estimatedPrice && (
                      <p className="text-[11px] text-gray-500">
                        Est: {formatCurrency(item.existing.estimatedPrice)}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-500 block">
                      Yang Baru Dipilih:
                    </span>
                    <p className="font-semibold text-rose-700 mt-0.5">
                      {incomingQtyStr}
                    </p>
                    {item.incoming.estimatedPrice && (
                      <p className="text-[11px] text-gray-500">
                        Est: {formatCurrency(item.incoming.estimatedPrice)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons for this item */}
                <div className="pt-1">
                  <span className="text-[11px] font-medium text-gray-500 block mb-1.5">
                    Tindakan untuk barang ini:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleSetItemAction(idx, 'separate')}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        currentAction === 'separate'
                          ? 'bg-rose-50 border-rose-500 text-rose-800 font-bold ring-1 ring-rose-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="block text-sm">📄</span>
                      <span>Pisahkan</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Baris baru</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetItemAction(idx, 'merge')}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        currentAction === 'merge'
                          ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold ring-1 ring-amber-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="block text-sm">➕</span>
                      <span>Gabungkan</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">
                        {mergedTotalQty > 0 ? `Total: ${mergedTotalQty}` : 'Jumlah +'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetItemAction(idx, 'replace')}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        currentAction === 'replace'
                          ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold ring-1 ring-blue-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="block text-sm">🔄</span>
                      <span>Timpa</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Pakai data baru</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetItemAction(idx, 'skip')}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        currentAction === 'skip'
                          ? 'bg-gray-100 border-gray-400 text-gray-800 font-bold ring-1 ring-gray-400'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="block text-sm">⏭️</span>
                      <span>Lewati</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Jangan tambah</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {nonDuplicateItems.length > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span>✅</span> {nonDuplicateItems.length} barang lainnya yang bukan duplikat akan otomatis langsung ditambahkan.
              </span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-3.5 sm:p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-2">
          <Button variant="secondary" onClick={onClose} size="sm">
            Batal
          </Button>

          <Button variant="primary" onClick={handleSubmit} size="sm">
            Konfirmasi & Tambahkan ke Daftar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BatchDuplicateModal;
