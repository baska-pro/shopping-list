import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ShoppingItem, ShoppingSession } from './types';
import AddItemForm from './components/AddItemForm';
import ShoppingList from './components/ShoppingList';
import DownloadImageButton from './components/DownloadImageButton';
import FileShareButtons from './components/FileShareButtons';
import HistoryView from './components/HistoryView';
import PriceListView from './components/PriceListView';
import PrintableList from './components/PrintableList';
import ChecklistView from './components/ChecklistView'; // Import new component
import IngredientPickerModal from './components/IngredientPickerModal';
import TextListImportModal from './components/TextListImportModal';
import VoiceInputModal from './components/VoiceInputModal';
import RecipePickerModal from './components/RecipePickerModal';
import WhatsAppShareModal from './components/WhatsAppShareModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import CloudSyncModal from './components/CloudSyncModal';
import ConfirmModal from './components/ConfirmModal';
import DuplicateItemModal from './components/DuplicateItemModal';
import BatchDuplicateModal, { BatchDuplicateItem, DuplicateAction } from './components/BatchDuplicateModal';
import Button from './components/Button';
import { v4 as uuidv4 } from 'uuid';
import { formatCurrency } from './constants';
import { CloudSyncConfig, SyncPayload } from './types';
import { loadCloudSyncConfig, saveCloudSyncConfig, buildSyncPayload, pushDataToCloud, pullDataFromCloud } from './services/syncService';
import { Cloud, RefreshCw, CheckCircle2, FileSpreadsheet, Database, HardDrive } from 'lucide-react';

type ViewMode = 'shopping-list' | 'history' | 'price-list' | 'checklist';

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  submessage?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning' | 'success';
  icon?: string;
  onConfirm: () => void;
}

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('shopping-list');
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [isTextImportOpen, setIsTextImportOpen] = useState<boolean>(false);
  const [isVoiceInputOpen, setIsVoiceInputOpen] = useState<boolean>(false);
  const [isRecipePickerOpen, setIsRecipePickerOpen] = useState<boolean>(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState<boolean>(false);
  const [cloudConfig, setCloudConfig] = useState<CloudSyncConfig>(loadCloudSyncConfig);
  const [isAutoSyncing, setIsAutoSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  
  // Modern modal state for alerts and confirmations
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  // Modern modal state for duplicate items
  const [duplicateModalData, setDuplicateModalData] = useState<{
    isOpen: boolean;
    existingItem: ShoppingItem;
    newItemData: Omit<ShoppingItem, 'id' | 'isChecked'>;
  } | null>(null);

  // Modern modal state for batch duplicate items (from IngredientPicker or TextImport)
  const [batchDuplicateData, setBatchDuplicateData] = useState<{
    isOpen: boolean;
    duplicateItems: BatchDuplicateItem[];
    nonDuplicateItems: Array<Omit<ShoppingItem, 'id' | 'isChecked'>>;
  } | null>(null);
  
  const [listTitle, setListTitle] = useState<string>(() => {
      try {
          return localStorage.getItem('listTitle') || 'Daftar Belanja';
      } catch (e) {
          return 'Daftar Belanja';
      }
  });
  
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    try {
      const savedItems = localStorage.getItem('shoppingList');
      return savedItems ? JSON.parse(savedItems) : [];
    } catch (error) {
      console.error('Failed to load shopping list from localStorage:', error);
      return [];
    }
  });

  const [priceHistory, setPriceHistory] = useState<{ [name: string]: number }>(() => {
      try {
          const savedHistory = localStorage.getItem('priceHistory');
          return savedHistory ? JSON.parse(savedHistory) : {};
      } catch (error) {
          console.error('Failed to load price history:', error);
          return {};
      }
  });

  const [shoppingHistory, setShoppingHistory] = useState<ShoppingSession[]>(() => {
    try {
      const saved = localStorage.getItem('shoppingSessionHistory');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });

  const shoppingListRef = useRef<HTMLDivElement>(null);
  const printableListRef = useRef<HTMLDivElement>(null);

  // Persist List Title
  useEffect(() => {
    try {
        localStorage.setItem('listTitle', listTitle);
    } catch (error) {
        console.error('Failed to save title', error);
    }
  }, [listTitle]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppingList', JSON.stringify(shoppingItems));
    } catch (error) {
      console.error('Failed to save shopping list to localStorage:', error);
    }
  }, [shoppingItems]);

  useEffect(() => {
      try {
          localStorage.setItem('priceHistory', JSON.stringify(priceHistory));
      } catch (error) {
          console.error('Failed to save price history:', error);
      }
  }, [priceHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppingSessionHistory', JSON.stringify(shoppingHistory));
    } catch (error) {
      console.error('Failed to save session history:', error);
    }
  }, [shoppingHistory]);

  // Handle incoming data from Cloud
  const handleDataAppliedFromCloud = useCallback((payload: SyncPayload) => {
    if (payload.shoppingItems) {
      setShoppingItems(payload.shoppingItems);
    }
    if (payload.listTitle) {
      setListTitle(payload.listTitle);
    }
    if (payload.history) {
      setShoppingHistory(payload.history);
      try {
        localStorage.setItem('shoppingSessionHistory', JSON.stringify(payload.history));
      } catch (e) {}
    }
    if (payload.priceHistory) {
      setPriceHistory(payload.priceHistory);
      try {
        localStorage.setItem('priceHistory', JSON.stringify(payload.priceHistory));
      } catch (e) {}
    }
    setSyncToast('Data berhasil disinkronkan dari Cloud!');
    setTimeout(() => setSyncToast(null), 3500);
  }, []);

  const handleConfigUpdated = useCallback((newConfig: CloudSyncConfig) => {
    setCloudConfig(newConfig);
  }, []);

  // Initial Auto-Pull on app mount if autoSync is active
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (cloudConfig.autoSync && cloudConfig.provider !== 'none') {
        setIsAutoSyncing(true);
        pullDataFromCloud(cloudConfig)
          .then(res => {
            if (res.success && res.data) {
              handleDataAppliedFromCloud(res.data);
            }
          })
          .catch(err => console.warn('Auto-pull error:', err))
          .finally(() => setIsAutoSyncing(false));
      }
    }
  }, [cloudConfig, handleDataAppliedFromCloud]);

  // Debounced Auto-Push on changes when autoSync is enabled
  useEffect(() => {
    if (isInitialMount.current) return;
    if (!cloudConfig.autoSync || cloudConfig.provider === 'none') return;

    const timer = setTimeout(() => {
      const payload = buildSyncPayload({
        listTitle,
        shoppingItems,
        history: shoppingHistory,
        priceHistory,
      });
      setIsAutoSyncing(true);
      pushDataToCloud(cloudConfig, payload)
        .then(res => {
          if (res.success) {
            setCloudConfig(prev => ({
              ...prev,
              lastSyncTime: new Date().toISOString(),
              lastSyncStatus: 'success',
            }));
          }
        })
        .catch(err => console.warn('Auto-push error:', err))
        .finally(() => setIsAutoSyncing(false));
    }, 2500);

    return () => clearTimeout(timer);
  }, [shoppingItems, listTitle, shoppingHistory, priceHistory, cloudConfig]);

  const handleAddItem = useCallback((newItemData: Omit<ShoppingItem, 'id' | 'isChecked'>) => {
    // Check for duplicates
    const existing = shoppingItems.find(
        item => item.name.toLowerCase().trim() === newItemData.name.toLowerCase().trim()
    );

    if (existing) {
        setDuplicateModalData({
            isOpen: true,
            existingItem: existing,
            newItemData,
        });
        return;
    }

    const newItem: ShoppingItem = {
      ...newItemData,
      id: uuidv4(),
      isChecked: false,
    };
    setShoppingItems((prevItems) => [...prevItems, newItem]);
    setCurrentView('shopping-list'); // Ensure we switch back to list if adding
  }, [shoppingItems]);

  const handleDuplicateMergeOrUpdate = useCallback((updatedItem: ShoppingItem) => {
    setShoppingItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setDuplicateModalData(null);
    setCurrentView('shopping-list');
  }, []);

  const handleDuplicateReplace = useCallback((replacementItem: ShoppingItem) => {
    setShoppingItems(prev => prev.map(item => item.id === replacementItem.id ? replacementItem : item));
    setDuplicateModalData(null);
    setCurrentView('shopping-list');
  }, []);

  const handleDuplicateDeleteExisting = useCallback((existingId: string) => {
    setShoppingItems(prev => prev.filter(item => item.id !== existingId));
    setDuplicateModalData(null);
  }, []);

  const handleDuplicateAddSeparate = useCallback((newItemData: Omit<ShoppingItem, 'id' | 'isChecked'>) => {
    const newItem: ShoppingItem = {
      ...newItemData,
      id: uuidv4(),
      isChecked: false,
    };
    setShoppingItems(prev => [...prev, newItem]);
    setDuplicateModalData(null);
    setCurrentView('shopping-list');
  }, []);

  const handleAddMultipleItems = useCallback((newItemsData: Omit<ShoppingItem, 'id' | 'isChecked'>[]) => {
    if (newItemsData.length === 0) return;

    // Check for duplicates against existing shoppingItems
    const duplicates: BatchDuplicateItem[] = [];
    const nonDuplicates: Array<Omit<ShoppingItem, 'id' | 'isChecked'>> = [];

    newItemsData.forEach(incomingItem => {
      const existing = shoppingItems.find(
        item => item.name.toLowerCase().trim() === incomingItem.name.toLowerCase().trim()
      );
      if (existing) {
        duplicates.push({ existing, incoming: incomingItem });
      } else {
        nonDuplicates.push(incomingItem);
      }
    });

    if (duplicates.length > 0) {
      // Prompt user with BatchDuplicateModal with duplicate warning & options
      setBatchDuplicateData({
        isOpen: true,
        duplicateItems: duplicates,
        nonDuplicateItems: nonDuplicates,
      });
      return;
    }

    // No duplicates: directly append as new items
    setShoppingItems(prevItems => [
      ...prevItems,
      ...newItemsData.map(item => ({
        ...item,
        id: uuidv4(),
        isChecked: false,
      })),
    ]);
    setCurrentView('shopping-list');
  }, [shoppingItems]);

  const handleBatchDuplicateConfirm = useCallback(
    (
      decisions: Array<{
        incoming: Omit<ShoppingItem, 'id' | 'isChecked'>;
        existing: ShoppingItem;
        action: DuplicateAction;
      }>,
      nonDuplicates: Array<Omit<ShoppingItem, 'id' | 'isChecked'>>
    ) => {
      setShoppingItems(prevItems => {
        let updated = [...prevItems];
        const newItemsToPush: ShoppingItem[] = [];

        decisions.forEach(({ incoming, existing, action }) => {
          if (action === 'separate') {
            // Keep existing intact, add incoming as a separate new row!
            newItemsToPush.push({
              ...incoming,
              id: uuidv4(),
              isChecked: false,
            });
          } else if (action === 'merge') {
            // User explicitly chose to merge!
            const idx = updated.findIndex(i => i.id === existing.id);
            if (idx !== -1) {
              const existingQty = updated[idx].quantity ?? 0;
              const incomingQty = incoming.quantity ?? 0;
              const totalQty =
                existingQty + incomingQty > 0
                  ? Math.round((existingQty + incomingQty) * 100) / 100
                  : null;
              updated[idx] = {
                ...updated[idx],
                quantity: totalQty,
                estimatedPrice:
                  (updated[idx].estimatedPrice || 0) + (incoming.estimatedPrice || 0) ||
                  updated[idx].estimatedPrice ||
                  incoming.estimatedPrice,
                note: [updated[idx].note, incoming.note].filter(Boolean).join(', ') || undefined,
              };
            }
          } else if (action === 'replace') {
            // User chose to overwrite with new
            const idx = updated.findIndex(i => i.id === existing.id);
            if (idx !== -1) {
              updated[idx] = {
                ...updated[idx],
                quantity: incoming.quantity,
                unit: incoming.unit,
                estimatedPrice: incoming.estimatedPrice,
                note: incoming.note,
                groupTag: incoming.groupTag || updated[idx].groupTag,
              };
            }
          }
          // action === 'skip': do nothing, incoming duplicate is discarded
        });

        // Add non-duplicate items
        nonDuplicates.forEach(item => {
          newItemsToPush.push({
            ...item,
            id: uuidv4(),
            isChecked: false,
          });
        });

        return [...updated, ...newItemsToPush];
      });

      setBatchDuplicateData(null);
      setCurrentView('shopping-list');
    },
    []
  );

  const handleUpdateItem = useCallback((updatedItem: ShoppingItem) => {
    setShoppingItems((prevItems) =>
      prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  }, []);

  const handleToggleCheck = useCallback((item: ShoppingItem) => {
      setShoppingItems((prevItems) => 
        prevItems.map((i) => (i.id === item.id ? { ...i, isChecked: !i.isChecked } : i))
      );
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    setShoppingItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const handleClearList = useCallback(() => {
    if (shoppingItems.length === 0) {
        setConfirmModal({
            isOpen: true,
            title: 'Daftar Kosong',
            message: 'Daftar belanja Anda sudah kosong, tidak ada barang yang perlu dihapus.',
            confirmText: 'Mengerti',
            variant: 'primary',
            icon: 'ℹ️',
            onConfirm: () => setConfirmModal(null),
        });
        return;
    }
    
    setConfirmModal({
        isOpen: true,
        title: 'Kosongkan Daftar Belanja?',
        message: `Anda yakin ingin menghapus SEMUA (${shoppingItems.length}) barang di daftar belanja ini?`,
        submessage: 'Tindakan ini akan mengosongkan seluruh daftar saat ini dan tidak dapat dibatalkan.',
        confirmText: 'Ya, Kosongkan Semua',
        cancelText: 'Batal',
        variant: 'danger',
        icon: '🗑️',
        onConfirm: () => {
            setShoppingItems([]);
            setConfirmModal(null);
        },
    });
  }, [shoppingItems]);

  const handleImportItems = useCallback((importedItems: ShoppingItem[]) => {
    setShoppingItems(importedItems);
    setCurrentView('shopping-list');
  }, []);

  const handleMergeItems = useCallback((mergedItem: ShoppingItem, itemsToDeleteIds: string[]) => {
      setShoppingItems((prevItems) => {
          const remainingItems = prevItems.filter(item => !itemsToDeleteIds.includes(item.id));
          return [...remainingItems, mergedItem];
      });
  }, []);

  const handlePriceUpdate = useCallback((name: string, price: number) => {
      setPriceHistory(prev => ({
          ...prev,
          [name.trim()]: price
      }));
  }, []);

  const executeRecapSave = useCallback(() => {
    const historyItems = shoppingItems.map(item => ({
        ...item,
        realPrice: item.realPrice === null ? 0 : item.realPrice
    }));

    const totalEstimate = historyItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
    const totalReal = historyItems.reduce((sum, item) => sum + (item.realPrice || 0), 0);

    const newSession: ShoppingSession = {
      id: uuidv4(),
      date: new Date().toISOString(),
      title: listTitle, // Store current title
      items: historyItems,
      totalEstimate,
      totalReal
    };

    const newHistory = [newSession, ...shoppingHistory];
    setShoppingHistory(newHistory);
    localStorage.setItem('shoppingSessionHistory', JSON.stringify(newHistory));
    
    setShoppingItems([]);
    setListTitle('Daftar Belanja'); // Reset title default
    
    setConfirmModal({
        isOpen: true,
        title: 'Rekap Berhasil Disimpan! 🎉',
        message: 'Daftar belanja telah berhasil direkap dan dipindahkan ke Riwayat Belanja.',
        submessage: `Total belanja: ${formatCurrency(totalReal)} (${historyItems.length} barang).`,
        confirmText: 'Lihat Riwayat Belanja',
        variant: 'success',
        icon: '✅',
        onConfirm: () => {
            setConfirmModal(null);
            setCurrentView('history');
        }
    });
  }, [shoppingItems, shoppingHistory, listTitle]);

  const handleRecap = useCallback(() => {
    if (shoppingItems.length === 0) {
      setConfirmModal({
        isOpen: true,
        title: 'Daftar Belanja Kosong',
        message: 'Daftar belanja masih kosong, tidak ada data barang yang bisa direkap.',
        confirmText: 'Mengerti',
        variant: 'primary',
        icon: '🛒',
        onConfirm: () => setConfirmModal(null),
      });
      return;
    }

    const incompleteItems = shoppingItems.filter(item => item.realPrice === null);
    
    if (incompleteItems.length > 0) {
      setConfirmModal({
        isOpen: true,
        title: 'Lengkapi & Rekap Belanja',
        message: `Ada ${incompleteItems.length} barang yang belum diisi 'Harga Asli'.`,
        submessage: "Barang yang harganya kosong akan disimpan sebagai Rp 0 di riwayat belanja. Apakah Anda ingin melanjutkan rekap?",
        confirmText: 'Lanjutkan Rekap',
        cancelText: 'Periksa Kembali',
        variant: 'warning',
        icon: '⚠️',
        onConfirm: () => {
          setConfirmModal(null);
          executeRecapSave();
        },
      });
    } else {
      const totalReal = shoppingItems.reduce((sum, item) => sum + (item.realPrice || 0), 0);
      setConfirmModal({
        isOpen: true,
        title: 'Simpan ke Riwayat Belanja?',
        message: 'Data belanjaan akan disimpan ke menu Riwayat dan daftar belanja saat ini akan dikosongkan.',
        submessage: `Total Belanja: ${formatCurrency(totalReal)} (${shoppingItems.length} barang).`,
        confirmText: 'Ya, Simpan ke Riwayat',
        cancelText: 'Batal',
        variant: 'success',
        icon: '💾',
        onConfirm: () => {
          setConfirmModal(null);
          executeRecapSave();
        },
      });
    }
  }, [shoppingItems, executeRecapSave]);

  const handleDeleteHistory = useCallback((id: string) => {
    setShoppingHistory(prev => prev.filter(h => h.id !== id));
  }, []);

  const getTabClass = (view: ViewMode) => 
    `flex-1 py-3 text-xs md:text-base font-bold transition-all duration-200 border-b-2 whitespace-nowrap ${
      currentView === view 
      ? 'border-rose-600 text-rose-700 bg-rose-50' 
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
    }`;

  // -- Full Screen Mode: Checklist --
  if (currentView === 'checklist') {
      return (
        <>
          <ChecklistView 
            items={shoppingItems} 
            onUpdateItem={handleUpdateItem}
            onBack={() => setCurrentView('shopping-list')}
            onOpenWhatsApp={() => setIsWhatsAppModalOpen(true)}
          />
          <WhatsAppShareModal
            isOpen={isWhatsAppModalOpen}
            onClose={() => setIsWhatsAppModalOpen(false)}
            items={shoppingItems}
            listTitle={listTitle}
          />
        </>
      );
  }

  // -- Standard Layout --
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-rose-700 md:text-5xl tracking-tight mb-1">
            Shopping Books
          </h1>
          <p className="text-gray-500 text-xs md:text-sm">Kelola belanjaan Anda dengan mudah, cerdas, & sinkron antar perangkat.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
          {/* Cloud Sync Status & Trigger Button */}
          <button
            type="button"
            onClick={() => setIsCloudSyncOpen(true)}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
              cloudConfig.provider !== 'none'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 shadow-2xs'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-2xs'
            }`}
            title="Pengaturan Sinkronisasi Cloud (Google Sheets & Supabase)"
          >
            {isAutoSyncing ? (
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
            ) : cloudConfig.provider === 'google-sheets' ? (
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
            ) : cloudConfig.provider === 'supabase' ? (
              <Database className="w-4 h-4 text-teal-600" />
            ) : (
              <Cloud className="w-4 h-4 text-gray-500" />
            )}
            <span>
              {cloudConfig.provider === 'google-sheets'
                ? 'Sheets Sync'
                : cloudConfig.provider === 'supabase'
                ? 'Supabase Sync'
                : 'Cloud Sync'}
            </span>
            {cloudConfig.provider !== 'none' && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            )}
          </button>

          <PWAInstallButton />
        </div>
      </div>

      {/* Modern Navigation Tabs - Removed Checklist from here */}
      <div className="w-full max-w-5xl flex mb-6 bg-white rounded-t-xl shadow-sm border-b border-gray-200 overflow-x-auto">
        <button className={getTabClass('shopping-list')} onClick={() => setCurrentView('shopping-list')}>
          📝 Daftar Belanja
        </button>
        <button className={getTabClass('history')} onClick={() => setCurrentView('history')}>
          📅 Riwayat
        </button>
        <button className={getTabClass('price-list')} onClick={() => setCurrentView('price-list')}>
          💰 Daftar Harga
        </button>
      </div>

      <div className="w-full max-w-5xl">
        {currentView === 'shopping-list' && (
          <>
            <AddItemForm 
              onAddItem={handleAddItem} 
              priceHistory={priceHistory}
              onOpenPicker={() => setIsPickerOpen(true)}
              onOpenTextImport={() => setIsTextImportOpen(true)}
              onOpenVoiceInput={() => setIsVoiceInputOpen(true)}
              onOpenRecipePicker={() => setIsRecipePickerOpen(true)}
            />
            
            <ShoppingList
              ref={shoppingListRef}
              title={listTitle}
              onTitleChange={setListTitle}
              items={shoppingItems}
              onItemUpdate={handleUpdateItem}
              onItemDelete={handleDeleteItem}
              onMergeItems={handleMergeItems}
              onPriceChange={handlePriceUpdate}
              onClearList={handleClearList}
              onOpenWhatsApp={() => setIsWhatsAppModalOpen(true)}
            />

            {/* Checklist Mode Entry Point - Prominent Button */}
             <div className="mb-8">
                <button 
                    onClick={() => setCurrentView('checklist')}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <span className="text-2xl">🛒</span>
                    <div className="text-left">
                        <div className="text-lg leading-tight">Mulai Belanja (Checklist Mode)</div>
                        <div className="text-xs font-normal opacity-90">Layar penuh, centang barang, edit harga, & catatan.</div>
                    </div>
                    <span className="ml-auto text-xl">➔</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
               <div className="bg-white p-6 shadow-lg rounded-xl border-t-4 border-rose-400">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Selesai Belanja?</h3>
                <p className="text-sm text-gray-500 mb-4">Pastikan harga asli diisi. Klik rekap untuk menyimpan.</p>
                <Button onClick={handleRecap} variant="primary" className="w-full bg-rose-700 hover:bg-rose-800 shadow-md">
                  ✅ Rekap ke Riwayat
                </Button>
               </div>

              <div className="bg-white p-6 shadow-lg rounded-xl border-t-4 border-gray-400">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Simpan & Bagikan Data</h3>
                <div className="flex flex-col gap-3">
                   {/* Direct WhatsApp Share Button */}
                   <button
                     type="button"
                     onClick={() => setIsWhatsAppModalOpen(true)}
                     className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98"
                     title="Simpan atau bagikan daftar belanja ke WhatsApp"
                   >
                     <span className="text-lg">💬</span>
                     <span>Simpan / Kirim ke WhatsApp</span>
                   </button>

                   {/* Clean Image Download */}
                   <DownloadImageButton targetRef={printableListRef} filename={`${listTitle.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0,10)}.png`}>
                     📷 Download Gambar (Rapih)
                   </DownloadImageButton>
                  <FileShareButtons items={shoppingItems} onImport={handleImportItems} />
                </div>
              </div>
            </div>

            {/* Hidden Printable View */}
            <PrintableList ref={printableListRef} items={shoppingItems} title={listTitle} date={new Date().toLocaleDateString('id-ID')} />

            {/* Quick Multi-Ingredient Picker Modal */}
            <IngredientPickerModal
              isOpen={isPickerOpen}
              onClose={() => setIsPickerOpen(false)}
              onAddMultipleItems={handleAddMultipleItems}
              existingItemNames={(shoppingItems || []).map(i => i.name)}
              priceHistory={priceHistory || {}}
            />

            {/* Smart Plain Text Shopping List Import Modal */}
            <TextListImportModal
              isOpen={isTextImportOpen}
              onClose={() => setIsTextImportOpen(false)}
              onAddMultipleItems={handleAddMultipleItems}
              existingItemNames={(shoppingItems || []).map(i => i.name)}
              priceHistory={priceHistory || {}}
            />

            {/* Quick Voice-to-List Modal */}
            <VoiceInputModal
              isOpen={isVoiceInputOpen}
              onClose={() => setIsVoiceInputOpen(false)}
              onAddMultipleItems={handleAddMultipleItems}
              priceHistory={priceHistory || {}}
            />

            {/* Recipe to Shopping List Modal */}
            <RecipePickerModal
              isOpen={isRecipePickerOpen}
              onClose={() => setIsRecipePickerOpen(false)}
              onAddMultipleItems={handleAddMultipleItems}
              existingItemNames={(shoppingItems || []).map(i => i.name)}
              priceHistory={priceHistory || {}}
            />

            {/* WhatsApp Share & Export Modal */}
            <WhatsAppShareModal
              isOpen={isWhatsAppModalOpen}
              onClose={() => setIsWhatsAppModalOpen(false)}
              items={shoppingItems || []}
              listTitle={listTitle || 'Daftar Belanja'}
            />
          </>
        )}

        {currentView === 'history' && (
           <HistoryView 
            history={shoppingHistory} 
            onLoadList={handleImportItems}
            onDeleteHistory={handleDeleteHistory}
           />
        )}

        {currentView === 'price-list' && (
          <PriceListView history={shoppingHistory} />
        )}
      </div>

      {/* Global Modern Confirmation / Alert Modal */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          submessage={confirmModal.submessage}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          variant={confirmModal.variant}
          icon={confirmModal.icon}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* Global Modern Duplicate Item Modal */}
      {duplicateModalData && (
        <DuplicateItemModal
          isOpen={duplicateModalData.isOpen}
          existingItem={duplicateModalData.existingItem}
          newItemData={duplicateModalData.newItemData}
          onClose={() => setDuplicateModalData(null)}
          onMergeOrUpdate={handleDuplicateMergeOrUpdate}
          onReplace={handleDuplicateReplace}
          onDeleteExisting={handleDuplicateDeleteExisting}
          onAddSeparate={handleDuplicateAddSeparate}
        />
      )}

      {/* Global Modern Batch Duplicate Modal (Multi-items) */}
      {batchDuplicateData && (
        <BatchDuplicateModal
          isOpen={batchDuplicateData.isOpen}
          duplicateItems={batchDuplicateData.duplicateItems}
          nonDuplicateItems={batchDuplicateData.nonDuplicateItems}
          onConfirm={handleBatchDuplicateConfirm}
          onClose={() => setBatchDuplicateData(null)}
        />
      )}

      {/* Cloud Sync & Multi-Device Storage Modal */}
      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        currentPayload={buildSyncPayload({
          listTitle,
          shoppingItems,
          history: shoppingHistory,
          priceHistory,
        })}
        onDataAppliedFromCloud={handleDataAppliedFromCloud}
        onConfigUpdated={handleConfigUpdated}
      />

      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-5 right-5 z-[150] bg-gray-900/95 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm border border-gray-700 animate-fade-in backdrop-blur-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{syncToast}</span>
        </div>
      )}

      <footer className="w-full max-w-4xl text-center text-gray-400 text-xs mt-8 pb-8">
        &copy; {new Date().getFullYear()} Shopping Books. Data tersimpan lokal di browser Anda dengan opsi sinkronisasi cloud.
      </footer>
    </div>
  );
}

export default App;