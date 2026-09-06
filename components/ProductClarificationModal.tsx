import React, { useState, useEffect } from 'react';
import { GenericClarification, GenericItemOption } from '../constants/clarifications';
import Button from './Button';

interface ProductClarificationModalProps {
  isOpen: boolean;
  clarification: GenericClarification | null;
  currentName: string;
  onSelectOption: (optionName: string, defaultUnit?: string, category?: string) => void;
  onKeepGeneric: () => void;
  onClose: () => void;
}

const ProductClarificationModal: React.FC<ProductClarificationModalProps> = ({
  isOpen,
  clarification,
  currentName,
  onSelectOption,
  onKeepGeneric,
  onClose,
}) => {
  const [customName, setCustomName] = useState<string>('');

  useEffect(() => {
    setCustomName('');
  }, [isOpen, clarification]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !clarification) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim()) {
      onSelectOption(customName.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden transform transition-all animate-scaleUp max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white p-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-inner">
              {clarification.icon}
            </span>
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-rose-100 bg-white/10 px-2 py-0.5 rounded-full inline-block mb-1">
                Pilihan Spesifik
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold leading-tight">
                {clarification.question}
              </h3>
            </div>
          </div>
          <p className="text-xs text-rose-100 mt-2 leading-relaxed">
            Menentukan jenis barang membantu Anda mengingat persis kebutuhan belanja dan memudahkan cek harga.
          </p>
        </div>

        {/* Options Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
            Pilih Jenis Yang Tersedia:
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {clarification.options.map((option, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectOption(option.name, option.defaultUnit, option.category)}
                className="flex items-center justify-between p-2.5 sm:p-3 text-left bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-rose-300 rounded-xl transition-all duration-150 group text-xs sm:text-sm font-semibold text-gray-800 hover:text-rose-700 shadow-sm hover:shadow"
              >
                <span>{option.name}</span>
                <span className="text-gray-300 group-hover:text-rose-500 font-bold ml-1">➔</span>
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Atau tulis jenis {clarification.displayName.toLowerCase()} lainnya:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`Contoh: ${clarification.options[0]?.name || 'Jenis lain'}`}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!customName.trim()}
                className="whitespace-nowrap"
              >
                Pakai Ini
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onKeepGeneric}
            className="text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-200/70 transition-colors"
          >
            Tetap gunakan "{currentName}" biasa
          </button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Batal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductClarificationModal;
