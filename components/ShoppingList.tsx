
import React, { useMemo, forwardRef, useState, useCallback } from 'react';
import { ShoppingItem } from '../types';
import { GROUP_COLORS, formatCurrency } from '../constants';
import ShoppingListItem from './ShoppingListItem';
import Button from './Button';
import { v4 as uuidv4 } from 'uuid';
import ConfirmModal from './ConfirmModal';

interface ShoppingListProps {
  items?: ShoppingItem[];
  title: string;
  onTitleChange: (title: string) => void;
  onItemUpdate: (updatedItem: ShoppingItem) => void;
  onItemDelete: (id: string) => void;
  onMergeItems: (mergedItem: ShoppingItem, itemsToDeleteIds: string[]) => void;
  onPriceChange: (name: string, price: number) => void;
  onClearList: () => void;
  onOpenWhatsApp?: () => void;
}

const ShoppingList = forwardRef<HTMLDivElement, ShoppingListProps>(({ items = [], title, onTitleChange, onItemUpdate, onItemDelete, onMergeItems, onPriceChange, onClearList, onOpenWhatsApp }, ref) => {
  const safeItems = items || [];
  const [isMergeMode, setIsMergeMode] = useState<boolean>(false);
  const [selectedForMerge, setSelectedForMerge] = useState<Set<string>>(new Set());
  const [itemToDelete, setItemToDelete] = useState<ShoppingItem | null>(null);
  const [mergeAlert, setMergeAlert] = useState<string | null>(null);

  const groupedItems = useMemo(() => {
    const groups: { [key: string]: ShoppingItem[] } = {};
    const ungrouped: ShoppingItem[] = [];

    safeItems.forEach(item => {
      if (item.groupTag) {
        if (!groups[item.groupTag]) {
          groups[item.groupTag] = [];
        }
        groups[item.groupTag].push(item);
      } else {
        ungrouped.push(item);
      }
    });

    return { groups, ungrouped };
  }, [safeItems]);

  const groupTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    for (const groupTag in groupedItems.groups) {
      totals[groupTag] = groupedItems.groups[groupTag].reduce((sum, item) => sum + (item.realPrice ?? 0), 0);
    }
    return totals;
  }, [groupedItems.groups]);

  const overallTotal = useMemo(() => {
    return safeItems.reduce((sum, item) => sum + (item.realPrice ?? 0), 0);
  }, [safeItems]);

  const groupColors = useMemo(() => {
    const colors: { [key: string]: string } = {};
    const groupTags = Object.keys(groupedItems.groups);
    groupTags.forEach((tag, index) => {
      colors[tag] = GROUP_COLORS[index % GROUP_COLORS.length];
    });
    return colors;
  }, [groupedItems.groups]);

  const handleToggleMergeSelect = useCallback((id: string) => {
    setSelectedForMerge(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  }, []);

  const handleMergeAction = useCallback(() => {
    const itemsToMerge = safeItems.filter(item => selectedForMerge.has(item.id));
    if (itemsToMerge.length < 2) {
        setMergeAlert("Pilih minimal 2 item untuk digabungkan menjadi satu paket.");
        return;
    }

    // Determine common properties - Changed separator to comma
    const combinedName = itemsToMerge.map(i => i.name).join(', ');
    const totalEstimated = itemsToMerge.reduce((sum, i) => sum + (i.estimatedPrice || 0), 0);
    const totalReal = itemsToMerge.reduce((sum, i) => sum + (i.realPrice || 0), 0);

    const newItem: ShoppingItem = {
        id: uuidv4(),
        name: `Paket: ${combinedName}`,
        quantity: 1, // Auto set to 1
        unit: 'Paket', // Auto set to Paket
        estimatedPrice: totalEstimated,
        realPrice: totalReal,
        groupTag: 'Gabungan', // Explicitly set category
        isChecked: false
    };

    onMergeItems(newItem, itemsToMerge.map(i => i.id));
    setSelectedForMerge(new Set());
    setIsMergeMode(false);
  }, [safeItems, selectedForMerge, onMergeItems]);

  // Calculate global indices
  let globalIndexCounter = 0;

  return (
    <div ref={ref} className="bg-white p-4 shadow-lg rounded-xl mb-6 border-t-4 border-gray-600">
      <div className="flex flex-col gap-4 mb-6">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             {/* Title Input */}
            <div className="w-full md:w-2/3">
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="text-2xl font-bold text-gray-800 border-b-2 border-transparent hover:border-gray-300 focus:border-rose-500 focus:outline-none bg-transparent w-full placeholder-gray-400"
                    placeholder="Judul Daftar (Contoh: Belanja Bulanan)"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 self-end md:self-auto items-center">
                {items.length > 0 && onOpenWhatsApp && (
                    <button 
                        type="button"
                        onClick={onOpenWhatsApp}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-all font-bold flex items-center gap-1.5 shadow-xs active:scale-95"
                        title="Simpan atau bagikan daftar belanja ini ke WhatsApp"
                    >
                        <span>💬</span>
                        <span className="hidden sm:inline">Kirim ke WA</span>
                    </button>
                )}

                {items.length > 0 && (
                    <button 
                        onClick={onClearList}
                        className="text-xs text-red-600 hover:text-red-800 border border-red-200 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors font-semibold"
                        title="Hapus semua item"
                    >
                        🗑️ Kosongkan
                    </button>
                )}

                {/* Merge Toggle */}
                <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <label className="flex items-center cursor-pointer select-none">
                        <div className="relative">
                        <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={isMergeMode}
                            onChange={() => {
                                setIsMergeMode(!isMergeMode);
                                setSelectedForMerge(new Set());
                            }}
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${isMergeMode ? 'bg-rose-500' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isMergeMode ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                        <div className="ml-3 text-sm font-medium text-gray-700">
                        Mode Gabung
                        </div>
                    </label>
                </div>
            </div>
        </div>
      </div>

      {isMergeMode && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg mb-4 flex justify-between items-center animate-pulse">
              <span className="text-rose-800 font-medium text-sm">Centang barang yang ingin digabungkan menjadi 1 paket.</span>
              <Button 
                onClick={handleMergeAction} 
                variant="primary" 
                size="sm"
                disabled={selectedForMerge.size < 2}
                className={selectedForMerge.size < 2 ? 'opacity-50 cursor-not-allowed' : ''}
              >
                  Gabung ({selectedForMerge.size})
              </Button>
          </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">Daftar belanja kosong.</p>
            <p className="text-gray-400 text-sm">Tambahkan barang melalui formulir di atas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 pb-2">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800 text-white">
              <tr>
                {/* Checkbox Column - Only visible in Merge Mode */}
                {isMergeMode && (
                  <th scope="col" className="py-3 px-2 text-center text-xs font-bold uppercase tracking-wider w-10">
                    #
                  </th>
                )}
                {/* Continuous Number Column */}
                <th scope="col" className="py-3 px-2 text-center text-xs font-bold uppercase tracking-wider w-8">
                  No
                </th>
                <th scope="col" className="py-3 px-2 text-left text-xs font-bold uppercase tracking-wider min-w-[140px]">
                  Nama Barang
                </th>
                <th scope="col" className="py-3 px-2 text-center text-xs font-bold uppercase tracking-wider min-w-[130px]">
                  Jumlah
                </th>
                <th scope="col" className="py-3 px-2 text-right text-xs font-bold uppercase tracking-wider min-w-[100px]">
                  HARGA AWAL
                </th>
                <th scope="col" className="py-3 px-2 text-right text-xs font-bold uppercase tracking-wider text-yellow-300 min-w-[120px]">
                  Harga Real
                </th>
                <th scope="col" className="py-3 px-2 text-right text-xs font-bold uppercase tracking-wider min-w-[80px]">
                  +/-
                </th>
                {/* Removed hidden class for mobile visibility */}
                <th scope="col" className="py-3 px-2 text-center text-xs font-bold uppercase tracking-wider min-w-[80px]">
                  Grup
                </th>
                <th scope="col" className="py-3 px-2 text-right text-xs font-bold uppercase tracking-wider min-w-[90px]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.keys(groupedItems.groups).length > 0 &&
                (Object.entries(groupedItems.groups) as [string, ShoppingItem[]][]).map(([groupTag, groupItems]) => (
                  <React.Fragment key={groupTag}>
                    <tr className={`${groupColors[groupTag] || 'bg-gray-100'}`}>
                      <td colSpan={isMergeMode ? 9 : 8} className="py-2 px-4 text-left text-sm sm:text-base border-t border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-800 flex items-center text-sm">
                                📂 {groupTag}
                            </span>
                            <span className="text-rose-700 font-bold bg-white bg-opacity-60 px-2 py-0.5 rounded text-xs shadow-sm">
                                Total: {formatCurrency(groupTotals[groupTag])}
                            </span>
                        </div>
                      </td>
                    </tr>
                    {groupItems.map((item, idx) => {
                        globalIndexCounter++;
                        return (
                            <ShoppingListItem
                                key={item.id}
                                item={item}
                                index={idx}
                                globalIndex={globalIndexCounter}
                                onUpdate={onItemUpdate}
                                onDelete={onItemDelete}
                                onRequestDelete={(it) => setItemToDelete(it)}
                                groupColors={groupColors}
                                isMergeMode={isMergeMode}
                                isSelectedForMerge={selectedForMerge.has(item.id)}
                                onToggleMergeSelect={handleToggleMergeSelect}
                                onPriceChange={onPriceChange}
                            />
                        );
                    })}
                  </React.Fragment>
                ))}

              {groupedItems.ungrouped.length > 0 && (
                <>
                  <tr className="bg-gray-100">
                    <td colSpan={isMergeMode ? 9 : 8} className="py-2 px-4 font-bold text-gray-800 text-left text-sm sm:text-base border-t border-b border-gray-200">
                      📝 Lainnya
                    </td>
                  </tr>
                  {groupedItems.ungrouped.map((item, idx) => {
                    globalIndexCounter++;
                    return (
                        <ShoppingListItem
                        key={item.id}
                        item={item}
                        index={idx}
                        globalIndex={globalIndexCounter}
                        onUpdate={onItemUpdate}
                        onDelete={onItemDelete}
                        onRequestDelete={(it) => setItemToDelete(it)}
                        groupColors={groupColors}
                        isMergeMode={isMergeMode}
                        isSelectedForMerge={selectedForMerge.has(item.id)}
                        onToggleMergeSelect={handleToggleMergeSelect}
                        onPriceChange={onPriceChange}
                        />
                    );
                  })}
                </>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-800 text-white">
                <td colSpan={isMergeMode ? 5 : 4} className="py-3 px-4 text-right text-base font-bold">
                  Total Belanja:
                </td>
                <td colSpan={isMergeMode ? 4 : 4} className="py-3 px-4 text-left text-base font-bold text-yellow-300">
                  {formatCurrency(overallTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Modern Confirmation Modal for Single Item Delete */}
      <ConfirmModal
        isOpen={itemToDelete !== null}
        title="Hapus Barang?"
        message={`Yakin ingin menghapus "${itemToDelete?.name}" dari daftar belanja?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        icon="🗑️"
        onConfirm={() => {
          if (itemToDelete) {
            onItemDelete(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Modern Notice Modal for Merge Action */}
      <ConfirmModal
        isOpen={mergeAlert !== null}
        title="Gabung Barang"
        message={mergeAlert || ''}
        confirmText="Mengerti"
        variant="primary"
        icon="ℹ️"
        onConfirm={() => setMergeAlert(null)}
        onCancel={() => setMergeAlert(null)}
      />
    </div>
  );
});

export default ShoppingList;
