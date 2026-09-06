
import React, { useRef, useCallback, useState } from 'react';
import { ShoppingItem } from '../types';
import Button from './Button';
import ConfirmModal from './ConfirmModal';

interface FileShareButtonsProps {
  items: ShoppingItem[];
  onImport: (importedItems: ShoppingItem[]) => void;
}

const FileShareButtons: React.FC<FileShareButtonsProps> = ({ items, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'primary' | 'success' | 'danger';
    icon: string;
  } | null>(null);

  const handleExport = useCallback(() => {
    try {
      const json = JSON.stringify(items, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `daftar-belanja-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (error) {
      console.error('Error exporting shopping list:', error);
      setModalState({
        isOpen: true,
        title: 'Ekspor Gagal',
        message: 'Gagal mengekspor daftar belanja. Silakan coba lagi.',
        variant: 'danger',
        icon: '⚠️',
      });
    }
  }, [items]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const importedItems: ShoppingItem[] = JSON.parse(content);
          // Basic validation to ensure it's an array of objects that look like ShoppingItem
          if (Array.isArray(importedItems) && importedItems.every(item => typeof item.id === 'string' && typeof item.name === 'string')) {
            onImport(importedItems);
            setModalState({
              isOpen: true,
              title: 'Impor Berhasil! 🎉',
              message: `Berhasil mengimpor ${importedItems.length} barang belanjaan dari file JSON.`,
              variant: 'success',
              icon: '✅',
            });
          } else {
            throw new Error('Format file tidak valid.');
          }
        } catch (error) {
          console.error('Error importing shopping list:', error);
          setModalState({
            isOpen: true,
            title: 'Impor Gagal',
            message: `Gagal mengimpor daftar belanja: ${error instanceof Error ? error.message : 'Format file tidak valid.'}`,
            variant: 'danger',
            icon: '❌',
          });
        }
      };
      reader.readAsText(file);
    }
  }, [onImport]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-4">
      <Button onClick={handleExport} variant="secondary" className="w-full">
        Ekspor Daftar (JSON)
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
      <Button onClick={handleImportClick} variant="secondary" className="w-full">
        Impor Daftar (JSON)
      </Button>

      {modalState && (
        <ConfirmModal
          isOpen={modalState.isOpen}
          title={modalState.title}
          message={modalState.message}
          variant={modalState.variant}
          icon={modalState.icon}
          confirmText="Tutup"
          onConfirm={() => setModalState(null)}
          onCancel={() => setModalState(null)}
        />
      )}
    </div>
  );
};

export default FileShareButtons;
