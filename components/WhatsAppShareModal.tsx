import React, { useState, useMemo } from 'react';
import { ShoppingItem } from '../types';
import { formatCurrency } from '../constants';
import Button from './Button';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  items?: ShoppingItem[];
  listTitle?: string;
  currentTitle?: string;
}

const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  items = [],
  listTitle,
  currentTitle,
}) => {
  const activeTitle = listTitle || currentTitle || 'Daftar Belanja';
  const safeItems = items || [];
  const [filterMode, setFilterMode] = useState<'all' | 'unchecked_only'>('all');
  const [includePrices, setIncludePrices] = useState<boolean>(true);
  const [groupByCategory, setGroupByCategory] = useState<boolean>(true);
  const [customNote, setCustomNote] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Filter items based on selected mode
  const filteredItems = useMemo(() => {
    if (filterMode === 'unchecked_only') {
      return safeItems.filter(i => !i.isChecked);
    }
    return safeItems;
  }, [safeItems, filterMode]);

  // Format WhatsApp message text
  const formattedWhatsAppText = useMemo(() => {
    if (filteredItems.length === 0) {
      return `🛒 *${activeTitle.toUpperCase()}*\n(Daftar belanja kosong)`;
    }

    const today = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let lines: string[] = [];
    lines.push(`🛒 *${activeTitle.toUpperCase()}*`);
    lines.push(`📅 ${today}`);
    if (customNote.trim()) {
      lines.push(`📝 Catatan: _${customNote.trim()}_`);
    }
    lines.push('──────────────────');

    let totalEst = 0;
    filteredItems.forEach(i => {
      if (i.estimatedPrice) {
        totalEst += i.estimatedPrice * (i.quantity ?? 1);
      }
    });

    if (groupByCategory) {
      // Group items by groupTag or 'Lainnya'
      const groups: { [key: string]: ShoppingItem[] } = {};
      filteredItems.forEach(i => {
        const cat = i.groupTag || 'Belanjaan Umum';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(i);
      });

      Object.entries(groups).forEach(([category, groupList]) => {
        lines.push(`\n📍 *${category.toUpperCase()}*`);
        groupList.forEach(item => {
          const statusIcon = item.isChecked ? '✅' : '▫️';
          const qtyText = item.quantity
            ? `${item.quantity} ${item.unit || ''}`.trim()
            : item.unit || '';
          const qtyPart = qtyText ? ` (${qtyText})` : '';
          const pricePart =
            includePrices && item.estimatedPrice
              ? ` - ~${formatCurrency(item.estimatedPrice * (item.quantity ?? 1))}`
              : '';
          const notePart = item.note ? ` _[${item.note}]_` : '';

          lines.push(`${statusIcon} ${item.name}${qtyPart}${pricePart}${notePart}`);
        });
      });
    } else {
      lines.push('');
      filteredItems.forEach((item, idx) => {
        const statusIcon = item.isChecked ? '✅' : '▫️';
        const qtyText = item.quantity
          ? `${item.quantity} ${item.unit || ''}`.trim()
          : item.unit || '';
        const qtyPart = qtyText ? ` (${qtyText})` : '';
        const pricePart =
          includePrices && item.estimatedPrice
            ? ` - ~${formatCurrency(item.estimatedPrice * (item.quantity ?? 1))}`
            : '';
        const notePart = item.note ? ` _[${item.note}]_` : '';

        lines.push(`${statusIcon} ${item.name}${qtyPart}${pricePart}${notePart}`);
      });
    }

    lines.push('\n──────────────────');
    lines.push(`📦 Total: *${filteredItems.length} barang*`);
    if (includePrices && totalEst > 0) {
      lines.push(`💰 Estimasi Biaya: *${formatCurrency(totalEst)}*`);
    }
    lines.push('\n_Dibuat dengan Belanjaan Pintar ✨_');

    return lines.join('\n');
  }, [filteredItems, currentTitle, customNote, includePrices, groupByCategory]);

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(formattedWhatsAppText);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(formattedWhatsAppText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentTitle,
          text: formattedWhatsAppText,
        });
      } catch (err) {
        console.warn('Share cancelled or failed', err);
      }
    } else {
      handleCopyText();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[140] bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
              💬
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Simpan & Bagikan ke WhatsApp</h2>
              <p className="text-xs text-emerald-100">
                Kirim daftar belanja terformat rapi langsung ke kontak atau grup keluarga.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors text-lg leading-none"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-gray-50">
          {/* Options / Customization Card */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-3 text-xs">
            <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
              <span>⚙️</span> Pengaturan Format Pesan:
            </h4>

            {/* Filter Mode */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`p-2 rounded-lg border text-left font-medium transition-colors ${
                  filterMode === 'all'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                📋 Semua Barang ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('unchecked_only')}
                className={`p-2 rounded-lg border text-left font-medium transition-colors ${
                  filterMode === 'unchecked_only'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                🛒 Belum Dibeli ({items.filter(i => !i.isChecked).length})
              </button>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includePrices}
                  onChange={e => setIncludePrices(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 cursor-pointer"
                />
                <span className="text-gray-700">Sertakan estimasi harga barang & total perkiraan</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={groupByCategory}
                  onChange={e => setGroupByCategory(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 cursor-pointer"
                />
                <span className="text-gray-700">Kelompokkan berdasarkan kategori / lokasi beli</span>
              </label>
            </div>

            {/* Optional custom note */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Pesan / Catatan Tambahan (Opsional):
              </label>
              <input
                type="text"
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                placeholder="Misal: Tolong dibelikan pas pulang kerja ya..."
                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <span>📱</span> Preview Pesan WhatsApp:
              </span>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
              >
                {copied ? '✅ Tersalin!' : '📋 Salin Teks'}
              </button>
            </div>

            <div className="p-3 bg-emerald-50/50 border border-emerald-200/70 rounded-lg max-h-56 overflow-y-auto font-mono text-[11px] text-gray-800 whitespace-pre-wrap leading-relaxed">
              {formattedWhatsAppText}
            </div>
          </div>
        </div>

        {/* Footer with Big Action Buttons */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <Button variant="secondary" onClick={onClose} size="sm" className="w-full sm:w-auto">
            Tutup
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button
                variant="secondary"
                onClick={handleNativeShare}
                size="sm"
                className="flex-1 sm:flex-initial"
              >
                📤 Bagikan Lainnya
              </Button>
            )}

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition-colors text-xs active:scale-95"
            >
              <span>💬</span> Buka di WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppShareModal;
