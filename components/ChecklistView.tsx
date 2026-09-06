import React, { useMemo, useState, useEffect } from 'react';
import { ShoppingItem } from '../types';
import { formatCurrency, GROUP_COLORS, formatNumberInput, parseNumberInput } from '../constants';

interface ChecklistViewProps {
  items?: ShoppingItem[];
  onUpdateItem: (item: ShoppingItem) => void;
  onBack: () => void;
  onOpenWhatsApp?: () => void;
}

const ChecklistView: React.FC<ChecklistViewProps> = ({ items = [], onUpdateItem, onBack, onOpenWhatsApp }) => {
  const safeItems = items || [];

  // Grouping logic (similar to ShoppingList)
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: ShoppingItem[] } = {};
    const ungrouped: ShoppingItem[] = [];
    safeItems.forEach(item => {
      if (item.groupTag) {
        if (!groups[item.groupTag]) groups[item.groupTag] = [];
        groups[item.groupTag].push(item);
      } else {
        ungrouped.push(item);
      }
    });
    return { groups, ungrouped };
  }, [safeItems]);

  const groupColors = useMemo(() => {
    const colors: { [key: string]: string } = {};
    Object.keys(groupedItems.groups).forEach((tag, index) => {
      colors[tag] = GROUP_COLORS[index % GROUP_COLORS.length];
    });
    return colors;
  }, [groupedItems.groups]);

  // Calculate Total of CHECKED items
  // Logic: Use realPrice if available, otherwise estimatedPrice, otherwise 0
  const checkedTotal = safeItems
    .filter(i => i.isChecked)
    .reduce((sum, i) => sum + (i.realPrice || i.estimatedPrice || 0), 0);
  
  const totalItems = safeItems.length;
  const checkedCount = safeItems.filter(i => i.isChecked).length;
  const progressPercent = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col font-sans h-[100dvh]">
      {/* Sticky Header */}
      <div className="bg-gray-900 text-white shadow-lg z-10 shrink-0">
        {/* Top Bar */}
        <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
                <button 
                    onClick={onBack}
                    className="flex items-center text-gray-300 hover:text-white transition-colors"
                >
                    <span className="text-2xl mr-1">‹</span> Kembali
                </button>
                {onOpenWhatsApp && (
                    <button
                        onClick={onOpenWhatsApp}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                        title="Kirim daftar belanjaan via WhatsApp"
                    >
                        <span>💬</span>
                        <span className="hidden sm:inline">Kirim ke WA</span>
                    </button>
                )}
            </div>
            <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Total Belanjaan</p>
                <p className="text-2xl font-extrabold text-yellow-400 leading-none">{formatCurrency(checkedTotal)}</p>
            </div>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-gray-800 h-1 w-full">
            <div 
                className="bg-green-500 h-1 transition-all duration-500 ease-out" 
                style={{ width: `${progressPercent}%` }}
            ></div>
        </div>
        
        {/* Sub Header */}
        <div className="px-4 py-2 bg-gray-800 flex justify-between items-center text-xs text-gray-300 border-b border-gray-700">
            <span>Progress: {checkedCount} / {totalItems} Item</span>
            <span>{Math.round(progressPercent)}% Selesai</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 pb-24">
        <div className="max-w-3xl mx-auto space-y-4">
            
            {items.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-xl mb-2">Daftar Kosong</p>
                    <p className="text-sm">Silakan tambah barang di menu utama.</p>
                </div>
            )}

            {/* Render Groups */}
             {(Object.entries(groupedItems.groups) as [string, ShoppingItem[]][]).map(([group, groupItems]) => (
                <div key={group} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className={`${groupColors[group] || 'bg-gray-100'} px-4 py-2 border-b border-gray-100 flex justify-between items-center sticky top-0 z-0`}>
                        <h3 className="font-bold text-gray-800 text-sm">📂 {group}</h3>
                        <span className="text-xs bg-white/50 px-2 py-0.5 rounded text-gray-700 font-medium">
                            {groupItems.filter(i => i.isChecked).length}/{groupItems.length}
                        </span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {groupItems.map(item => (
                            <ChecklistItem key={item.id} item={item} onUpdate={onUpdateItem} />
                        ))}
                    </div>
                </div>
             ))}

             {/* Render Ungrouped */}
             {groupedItems.ungrouped.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 sticky top-0 z-0">
                        <h3 className="font-bold text-gray-800 text-sm">📝 Lainnya</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {groupedItems.ungrouped.map(item => (
                            <ChecklistItem key={item.id} item={item} onUpdate={onUpdateItem} />
                        ))}
                    </div>
                </div>
             )}
        </div>
      </div>
    </div>
  );
};

// Sub-component for individual row
interface ChecklistItemProps {
    item: ShoppingItem;
    onUpdate: (item: ShoppingItem) => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onUpdate }) => {
    // Local state for Price Input
    const [priceStr, setPriceStr] = useState<string>('');
    // Local state for Note Input
    const [note, setNote] = useState<string>('');
    const [showNote, setShowNote] = useState<boolean>(false);

    useEffect(() => {
        // Initialize price string from realPrice (if set)
        const currentPrice = item.realPrice !== null ? item.realPrice : '';
        setPriceStr(formatNumberInput(currentPrice));
        
        // Initialize note
        setNote(item.note || '');
        if (item.note) setShowNote(true);
    }, [item.realPrice, item.note]);

    const handleToggle = () => {
        // Toggle check state only; do not auto-fill realPrice from budget/estimatedPrice
        onUpdate({ ...item, isChecked: !item.isChecked });
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawVal = e.target.value.replace(/[^0-9]/g, '');
        if (!rawVal) {
            setPriceStr('');
            onUpdate({ ...item, realPrice: null });
            return;
        }
        
        const formatted = Number(rawVal).toLocaleString('id-ID');
        setPriceStr(formatted);
        
        // Auto-check when price is entered: "Ketika ceklist mode harga di isi maka otomatis ceklist"
        const numVal = Number(rawVal);
        onUpdate({ 
            ...item, 
            realPrice: numVal,
            isChecked: numVal > 0 ? true : item.isChecked 
        });
    };

    const handleUseEstimate = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.estimatedPrice) {
            onUpdate({
                ...item,
                realPrice: item.estimatedPrice,
                isChecked: true
            });
        }
    };

    const handleNoteSave = () => {
        const trimmedNote = note.trim();
        if (trimmedNote !== item.note) {
            onUpdate({ ...item, note: trimmedNote || undefined });
        }
    };

    const isUsingEstimate = item.realPrice === null && item.estimatedPrice !== null;

    return (
        <div className={`transition-all duration-200 ${item.isChecked ? 'bg-green-50/50' : 'bg-white hover:bg-gray-50'}`}>
            <div className="relative flex items-center p-3.5 sm:p-4">
                {/* Checkbox */}
                <div 
                    onClick={handleToggle}
                    className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center mr-3 cursor-pointer transition-colors duration-200 ${item.isChecked ? 'bg-green-500 border-green-500 shadow-md' : 'border-gray-300 bg-white'}`}
                >
                    {item.isChecked && (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 mr-2 cursor-pointer" onClick={handleToggle}>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <p className={`text-base font-bold truncate ${item.isChecked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {item.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">
                            {item.quantity ? `${item.quantity} ${item.unit || ''}`.trim() : (item.unit || 'Secukupnya / Kemasan')}
                        </p>
                        {item.estimatedPrice ? (
                            <span className="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                                Anggaran: {formatCurrency(item.estimatedPrice)}
                            </span>
                        ) : null}
                    </div>
                </div>

                {/* Note Toggle Icon */}
                <button
                    onClick={(e) => { e.stopPropagation(); setShowNote(!showNote); }}
                    className={`p-2 mr-1 rounded-full ${note ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'}`}
                    title="Catatan"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                </button>
                
                {/* Editable Price with Numeric Keyboard */}
                <div className="text-right flex-shrink-0 w-28">
                    <div className="relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">Rp</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={priceStr}
                            onChange={handlePriceChange}
                            onClick={(e) => e.stopPropagation()} // Prevent toggle check when clicking input
                            placeholder={item.estimatedPrice ? formatNumberInput(item.estimatedPrice) : "0"}
                            className={`w-full text-right text-base font-bold bg-transparent border-b border-gray-300 focus:border-rose-500 focus:outline-none p-1 pl-5 ${item.isChecked ? 'text-green-600' : 'text-gray-800'}`}
                        />
                    </div>
                    {isUsingEstimate && (
                        <button
                            type="button"
                            onClick={handleUseEstimate}
                            className="text-[10px] text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-1.5 py-0.5 rounded mt-1 font-semibold transition-colors block ml-auto"
                            title="Gunakan perkiraan anggaran"
                        >
                            ✓ Pakai Rp {formatNumberInput(item.estimatedPrice)}
                        </button>
                    )}
                </div>
            </div>

            {/* Note Input Area */}
            {showNote && (
                <div className="px-4 pb-4 pl-14 animate-fadeIn">
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onBlur={handleNoteSave}
                        placeholder="Tambahkan catatan kecil (misal: Merk harus X)..."
                        className="w-full text-sm p-2 border border-yellow-200 bg-yellow-50 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 resize-none"
                        rows={2}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default ChecklistView;